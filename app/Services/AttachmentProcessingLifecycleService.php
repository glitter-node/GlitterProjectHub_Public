<?php

namespace App\Services;

use App\Enums\AttachmentStatus;
use App\Extension\HookManager;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class AttachmentProcessingLifecycleService
{
    public function staleThresholdMinutes(): int
    {
        return max(1, (int) config('attachment.processing_stale_minutes', 15));
    }

    /**
     * @return array<string, mixed>
     */
    public function queuedProcessingMeta(?array $existing = null): array
    {
        $meta = is_array($existing) ? $existing : [];
        $processing = is_array($meta['processing'] ?? null) ? $meta['processing'] : [];

        $meta['processing'] = array_replace($processing, [
            'queued_at' => $processing['queued_at'] ?? now()->toISOString(),
            'attempts' => (int) ($processing['attempts'] ?? 0),
            'async' => true,
        ]);

        return $meta;
    }

    /**
     * @return array<string, mixed>
     */
    public function markStarted(Model $attachment, string $domain, int $jobAttempt = 1): array
    {
        $meta = $this->meta($attachment);
        $processing = is_array($meta['processing'] ?? null) ? $meta['processing'] : [];
        $previousAttempts = (int) ($processing['attempts'] ?? 0);
        $now = now()->toISOString();

        if ($this->status($attachment) === AttachmentStatus::Failed->value) {
            $this->logLifecycle('retry_started', $domain, $attachment, [
                'reason' => $attachment->failed_reason,
            ]);
        }

        $meta['processing'] = array_replace($processing, [
            'queued_at' => $processing['queued_at'] ?? $now,
            'started_at' => $now,
            'completed_at' => null,
            'last_heartbeat_at' => $now,
            'attempts' => max($previousAttempts + 1, $jobAttempt),
            'worker' => $this->workerName(),
            'queue' => $this->queueName(),
            'last_error' => null,
            'async' => true,
        ]);

        $attachment->forceFill(['meta' => $meta])->save();

        $fresh = $attachment->fresh() ?? $attachment;
        $this->logLifecycle('processing_started', $domain, $fresh);
        HookManager::doAction('attachment.processing_started', $domain, $fresh);

        return $meta;
    }

    public function isProcessingStale(Model $attachment): bool
    {
        if ($this->status($attachment) !== AttachmentStatus::Processing->value) {
            return false;
        }

        $meta = $this->meta($attachment);
        $processing = is_array($meta['processing'] ?? null) ? $meta['processing'] : [];
        $candidate = $processing['last_heartbeat_at'] ?? $processing['started_at'] ?? null;
        $lastSeen = $candidate ? Carbon::parse($candidate) : $attachment->updated_at;

        return $lastSeen instanceof Carbon
            && $lastSeen->lte(now()->subMinutes($this->staleThresholdMinutes()));
    }

    public function markStaleFailed(Model $attachment, string $domain): bool
    {
        $meta = $this->meta($attachment);
        $now = now()->toISOString();
        $reason = 'processing_stale';
        $meta['processing'] = array_replace(is_array($meta['processing'] ?? null) ? $meta['processing'] : [], [
            'completed_at' => $now,
            'last_heartbeat_at' => $meta['processing']['last_heartbeat_at'] ?? null,
            'last_error' => $reason,
            'async' => true,
        ]);
        $meta['processing']['failures'][] = [
            'reason' => $reason,
            'failed_at' => $now,
            'previous_status' => AttachmentStatus::Processing->value,
        ];

        $updated = $attachment->newQuery()
            ->whereKey($attachment->getKey())
            ->where('status', AttachmentStatus::Processing->value)
            ->update([
                'status' => AttachmentStatus::Failed->value,
                'processed_at' => now(),
                'failed_reason' => $reason,
                'meta' => $meta,
                'updated_at' => now(),
            ]);

        if ($updated !== 1) {
            return false;
        }

        $fresh = $attachment->fresh() ?? $attachment;
        $this->logLifecycle('stale_detected', $domain, $fresh, ['reason' => $reason]);
        HookManager::doAction('attachment.processing_stale', $domain, $fresh);
        $this->logLifecycle('failed', $domain, $fresh, ['reason' => $reason]);
        HookManager::doAction('attachment.processing_failed', $domain, $fresh);

        return true;
    }

    /**
     * @param  array<string, mixed>  $inspection
     * @return array<string, mixed>
     */
    public function completedMeta(Model $attachment, array $inspection): array
    {
        $meta = $this->meta($attachment);
        $meta = array_replace_recursive($meta, $inspection['meta']);
        $now = now()->toISOString();
        $processing = is_array($meta['processing'] ?? null) ? $meta['processing'] : [];
        $meta['processing'] = array_replace($processing, [
            'completed_at' => $now,
            'finalized_at' => $now,
            'last_heartbeat_at' => $processing['last_heartbeat_at'] ?? $now,
            'last_error' => null,
            'async' => true,
        ]);

        if (($inspection['status'] ?? null) === AttachmentStatus::Quarantined->value) {
            $meta['quarantine'] = array_replace(is_array($meta['quarantine'] ?? null) ? $meta['quarantine'] : [], [
                'quarantine_reason' => $inspection['failed_reason'] ?? null,
                'quarantine_detected_mime' => $inspection['detected_mime'] ?? null,
                'quarantine_uploaded_mime' => $this->uploadedMime($attachment),
                'quarantine_extension' => $this->extension($attachment),
                'quarantine_detected_at' => $now,
            ]);
        }

        return $meta;
    }

    public function failedMeta(Model $attachment, string $reason): array
    {
        $meta = $this->meta($attachment);
        $now = now()->toISOString();
        $processing = is_array($meta['processing'] ?? null) ? $meta['processing'] : [];
        $meta['processing'] = array_replace($processing, [
            'completed_at' => $now,
            'finalized_at' => $now,
            'last_heartbeat_at' => $processing['last_heartbeat_at'] ?? $now,
            'last_error' => $reason,
            'async' => true,
        ]);
        $meta['processing']['failures'][] = [
            'reason' => $reason,
            'failed_at' => $now,
            'previous_failed_reason' => $attachment->failed_reason,
        ];

        return $meta;
    }

    public function logLifecycle(string $event, string $domain, ?Model $attachment, array $extra = []): void
    {
        Log::channel('attachment_lifecycle')->info('attachment.lifecycle.'.$event, array_filter(array_merge([
            'event' => $event,
            'domain' => $domain,
            'attachment_id' => $attachment?->getKey(),
            'disk' => $attachment?->disk ?? null,
            'path' => $attachment?->path ?? null,
            'status' => $attachment ? $this->status($attachment) : null,
            'queue' => $this->queueName(),
            'worker' => $this->workerName(),
            'reason' => $extra['reason'] ?? null,
        ], $extra), static fn ($value) => $value !== null));
    }

    public function fireCompleted(string $domain, Model $attachment): void
    {
        $this->logLifecycle('ready', $domain, $attachment);
        HookManager::doAction('attachment.processing_completed', $domain, $attachment);
    }

    public function fireQuarantined(string $domain, Model $attachment, ?string $reason): void
    {
        $this->logLifecycle('quarantined', $domain, $attachment, ['reason' => $reason]);
        HookManager::doAction('attachment.processing_completed', $domain, $attachment);
    }

    public function fireFailed(string $domain, Model $attachment, string $reason): void
    {
        $this->logLifecycle('failed', $domain, $attachment, ['reason' => $reason]);
        HookManager::doAction('attachment.processing_failed', $domain, $attachment);
    }

    private function status(Model $attachment): string
    {
        $status = $attachment->status;

        return $status instanceof AttachmentStatus ? $status->value : (string) $status;
    }

    /**
     * @return array<string, mixed>
     */
    private function meta(Model $attachment): array
    {
        return is_array($attachment->meta) ? $attachment->meta : [];
    }

    private function uploadedMime(Model $attachment): ?string
    {
        $meta = $this->meta($attachment);
        $upload = is_array($meta['upload'] ?? null) ? $meta['upload'] : [];

        return $upload['uploaded_mime'] ?? $attachment->mime_type ?? null;
    }

    private function extension(Model $attachment): ?string
    {
        $meta = $this->meta($attachment);
        $upload = is_array($meta['upload'] ?? null) ? $meta['upload'] : [];

        return $upload['extension'] ?? pathinfo((string) $attachment->original_filename, PATHINFO_EXTENSION) ?: null;
    }

    private function workerName(): string
    {
        return gethostname() ?: php_uname('n') ?: 'unknown';
    }

    private function queueName(): string
    {
        return (string) config('queue.default', 'sync');
    }
}
