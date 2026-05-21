<?php

namespace App\Services;

use App\Enums\AttachmentStatus;
use App\Jobs\FinalizeAttachmentUploadJob;
use App\Models\Attachment as CoreAttachment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Modules\Sirsoft\Board\Models\Attachment as BoardAttachment;
use Modules\Sirsoft\Page\Models\PageAttachment;

class AttachmentPipelineOperatorService
{
    /** @var array<int, string> */
    private const DOMAINS = ['core', 'board', 'page'];

    /** @var array<int, string> */
    private const STATUSES = ['pending', 'processing', 'ready', 'failed', 'quarantined'];

    private const TERMINAL_EXPORT_STATUSES = ['failed', 'quarantined'];

    public function __construct(
        private AttachmentProcessingLifecycleService $lifecycle
    ) {}

    /**
     * @return array<int, string>
     */
    public function domains(string $domain): array
    {
        return $domain === 'all' ? self::DOMAINS : [$domain];
    }

    /**
     * @return array<int, string>
     */
    public function statuses(string $status): array
    {
        return $status === 'all' ? self::STATUSES : [$status];
    }

    public function isValidDomain(string $domain): bool
    {
        return $domain === 'all' || in_array($domain, self::DOMAINS, true);
    }

    public function isValidStatus(string $status): bool
    {
        return $status === 'all' || in_array($status, self::STATUSES, true);
    }

    public function isValidTerminalExportStatus(string $status): bool
    {
        return $status === 'all' || in_array($status, self::TERMINAL_EXPORT_STATUSES, true);
    }

    public function terminalExportStatuses(string $status): array
    {
        return $status === 'all' ? self::TERMINAL_EXPORT_STATUSES : [$status];
    }

    /**
     * @return array<string, array<string, int>>
     */
    public function statusCounts(string $domainFilter, string $statusFilter): array
    {
        $counts = [];
        foreach ($this->domains($domainFilter) as $domain) {
            $counts[$domain] = [];
            foreach ($this->statuses($statusFilter) as $status) {
                $counts[$domain][$status] = $this->query($domain)->where('status', $status)->count();
            }
        }

        return $counts;
    }

    /**
     * @return array<string, int>
     */
    public function staleCounts(string $domainFilter, ?int $limit = null): array
    {
        $counts = [];
        foreach ($this->domains($domainFilter) as $domain) {
            $count = 0;
            $query = $this->query($domain)->where('status', AttachmentStatus::Processing->value)->orderBy('id');
            if ($limit !== null && $limit > 0) {
                $query->limit($limit);
            }

            foreach ($query->cursor() as $attachment) {
                if ($this->lifecycle->isProcessingStale($attachment)) {
                    $count++;
                }
            }
            $counts[$domain] = $count;
        }

        return $counts;
    }

    /**
     * @return Collection<int, array{domain: string, attachment: Model, stale: bool}>
     */
    public function retryCandidates(string $domainFilter, ?int $id, bool $includeStale, int $limit): Collection
    {
        $candidates = collect();
        foreach ($this->domains($domainFilter) as $domain) {
            if ($id !== null) {
                $attachment = $this->query($domain)->whereKey($id)->first();
                if ($attachment) {
                    $isStale = $this->lifecycle->isProcessingStale($attachment);
                    $candidates->push(['domain' => $domain, 'attachment' => $attachment, 'stale' => $isStale]);
                }
                continue;
            }

            $failed = $this->query($domain)
                ->where('status', AttachmentStatus::Failed->value)
                ->orderBy('id')
                ->limit($limit)
                ->get()
                ->map(fn (Model $attachment) => ['domain' => $domain, 'attachment' => $attachment, 'stale' => false]);

            $candidates = $candidates->concat($failed);

            if ($includeStale && $candidates->count() < $limit) {
                $remaining = $limit - $candidates->count();
                foreach ($this->query($domain)->where('status', AttachmentStatus::Processing->value)->orderBy('id')->cursor() as $attachment) {
                    if (! $this->lifecycle->isProcessingStale($attachment)) {
                        continue;
                    }
                    $candidates->push(['domain' => $domain, 'attachment' => $attachment, 'stale' => true]);
                    if ($candidates->count() >= $limit || --$remaining <= 0) {
                        break;
                    }
                }
            }

            if ($candidates->count() >= $limit && $domainFilter === 'all') {
                break;
            }
        }

        return $candidates->take($limit)->values();
    }

    /**
     * @return array{selected: bool, mutated: bool, reason: string, from: string, to: string|null}
     */
    public function retry(string $domain, Model $attachment, bool $force, bool $stale): array
    {
        $status = $this->status($attachment);
        if (in_array($status, [AttachmentStatus::Ready->value, AttachmentStatus::Quarantined->value], true)) {
            return ['selected' => false, 'mutated' => false, 'reason' => 'terminal_status', 'from' => $status, 'to' => null];
        }

        if ($status === AttachmentStatus::Processing->value && ! $stale) {
            return ['selected' => false, 'mutated' => false, 'reason' => 'processing_not_stale', 'from' => $status, 'to' => null];
        }

        if (! in_array($status, [AttachmentStatus::Failed->value, AttachmentStatus::Processing->value], true)) {
            return ['selected' => false, 'mutated' => false, 'reason' => 'status_not_retryable', 'from' => $status, 'to' => null];
        }

        if (! $force) {
            return ['selected' => true, 'mutated' => false, 'reason' => 'dry_run', 'from' => $status, 'to' => AttachmentStatus::Pending->value];
        }

        $meta = $this->retryMeta($attachment, $domain, $status, $stale);
        $updated = $attachment->newQuery()
            ->whereKey($attachment->getKey())
            ->where('status', $status)
            ->update([
                'status' => AttachmentStatus::Pending->value,
                'processed_at' => null,
                'failed_reason' => null,
                'meta' => $meta,
                'updated_at' => now(),
            ]);

        if ($updated !== 1) {
            return ['selected' => true, 'mutated' => false, 'reason' => 'atomic_update_failed', 'from' => $status, 'to' => null];
        }

        $fresh = $attachment->fresh() ?? $attachment;
        $this->lifecycle->logLifecycle('retry_queued', $domain, $fresh, ['reason' => $stale ? 'operator_retry_stale' : 'operator_retry_failed']);
        FinalizeAttachmentUploadJob::dispatch($domain, (int) $attachment->getKey());

        return ['selected' => true, 'mutated' => true, 'reason' => 'queued', 'from' => $status, 'to' => AttachmentStatus::Pending->value];
    }

    public function terminalExportRows(string $domainFilter, string $statusFilter, ?Carbon $since, ?Carbon $until, int $limit, bool $includePaths = false): array
    {
        $rows = [];
        $statuses = $this->terminalExportStatuses($statusFilter);

        foreach ($this->domains($domainFilter) as $domain) {
            $query = $this->query($domain)
                ->whereIn('status', $statuses)
                ->orderByDesc('updated_at')
                ->orderByDesc('id');

            if ($since) {
                $query->where(function (Builder $builder) use ($since): void {
                    $builder->where('created_at', '>=', $since)
                        ->orWhere('updated_at', '>=', $since);
                });
            }

            if ($until) {
                $query->where(function (Builder $builder) use ($until): void {
                    $builder->where('created_at', '<=', $until)
                        ->orWhere('updated_at', '<=', $until);
                });
            }

            foreach ($query->cursor() as $attachment) {
                $rows[] = $this->terminalExportRow($domain, $attachment, $includePaths);
                if (count($rows) >= $limit) {
                    return $rows;
                }
            }
        }

        return $rows;
    }

    public function describe(Model $attachment): array
    {
        return [
            'id' => $attachment->getKey(),
            'status' => $this->status($attachment),
            'disk' => $attachment->disk ?? null,
            'path' => $attachment->path ?? null,
            'failed_reason' => $attachment->failed_reason ?? null,
        ];
    }

    private function terminalExportRow(string $domain, Model $attachment, bool $includePaths): array
    {
        $meta = is_array($attachment->meta) ? $attachment->meta : [];
        $quarantine = is_array($meta['quarantine'] ?? null) ? $meta['quarantine'] : [];
        $processing = is_array($meta['processing'] ?? null) ? $meta['processing'] : [];
        $retries = is_array($processing['retries'] ?? null) ? $processing['retries'] : [];
        $status = $this->status($attachment);
        $row = [
            'domain' => $domain,
            'attachment_id' => $attachment->getKey(),
            'status' => $status,
            'attachment_type' => $this->scalarValue($attachment->attachment_type ?? null),
            'original_filename' => $attachment->original_filename ?? null,
            'mime_type' => $attachment->mime_type ?? null,
            'size' => isset($attachment->size) ? (int) $attachment->size : null,
            'failed_reason' => $attachment->failed_reason ?? null,
            'quarantine_reason' => $status === AttachmentStatus::Quarantined->value
                ? ($quarantine['quarantine_reason'] ?? $attachment->failed_reason ?? null)
                : null,
            'processed_at' => $this->dateValue($attachment->processed_at ?? null),
            'created_at' => $this->dateValue($attachment->created_at ?? null),
            'updated_at' => $this->dateValue($attachment->updated_at ?? null),
            'retry_attempts' => count($retries),
        ];

        if ($includePaths) {
            $row['disk'] = $attachment->disk ?? null;
            $row['path'] = $attachment->path ?? null;
        }

        return $row;
    }

    private function dateValue(mixed $value): ?string
    {
        if ($value instanceof \DateTimeInterface) {
            return Carbon::instance($value)->toISOString();
        }

        return $value !== null ? (string) $value : null;
    }

    private function scalarValue(mixed $value): mixed
    {
        if ($value instanceof \BackedEnum) {
            return $value->value;
        }

        return $value;
    }

    private function query(string $domain): Builder
    {
        return match ($domain) {
            'core' => CoreAttachment::query(),
            'board' => BoardAttachment::query(),
            'page' => PageAttachment::query(),
            default => throw new \InvalidArgumentException('Unsupported attachment domain: '.$domain),
        };
    }

    private function retryMeta(Model $attachment, string $domain, string $status, bool $stale): array
    {
        $meta = is_array($attachment->meta) ? $attachment->meta : [];
        $processing = is_array($meta['processing'] ?? null) ? $meta['processing'] : [];
        $now = now()->toISOString();
        $reason = $stale ? 'operator_retry_stale' : 'operator_retry_failed';

        if ($status === AttachmentStatus::Failed->value) {
            $processing['failures'][] = [
                'reason' => $attachment->failed_reason,
                'recorded_at' => $now,
                'source' => 'operator_retry_preserve',
            ];
        }

        if ($stale) {
            $processing['failures'][] = [
                'reason' => 'processing_stale',
                'recorded_at' => $now,
                'source' => 'operator_retry_preserve',
            ];
        }

        $processing['retries'][] = [
            'queued_at' => $now,
            'domain' => $domain,
            'previous_status' => $status,
            'previous_failed_reason' => $attachment->failed_reason ?? null,
            'reason' => $reason,
            'worker' => gethostname() ?: php_uname('n') ?: 'unknown',
        ];

        $meta['processing'] = array_replace($processing, [
            'queued_at' => $now,
            'completed_at' => null,
            'last_error' => null,
            'async' => true,
        ]);

        return $meta;
    }

    private function status(Model $attachment): string
    {
        $status = $attachment->status;

        return $status instanceof AttachmentStatus ? $status->value : (string) $status;
    }
}
