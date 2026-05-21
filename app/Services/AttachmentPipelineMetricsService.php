<?php

namespace App\Services;

use App\Enums\AttachmentStatus;
use App\Jobs\FinalizeAttachmentUploadJob;
use App\Models\Attachment as CoreAttachment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Modules\Sirsoft\Board\Models\Attachment as BoardAttachment;
use Modules\Sirsoft\Page\Models\PageAttachment;

class AttachmentPipelineMetricsService
{
    /** @var array<int, string> */
    private const DOMAINS = ['core', 'board', 'page'];

    /** @var array<int, string> */
    private const STATUSES = ['pending', 'processing', 'ready', 'failed', 'quarantined'];

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

    public function isValidDomain(string $domain): bool
    {
        return $domain === 'all' || in_array($domain, self::DOMAINS, true);
    }

    /**
     * @return array<string, mixed>
     */
    public function summary(string $domainFilter, int $hours, int $limit): array
    {
        $summary = [];
        foreach ($this->domains($domainFilter) as $domain) {
            $summary[$domain] = [
                'status_counts' => $this->statusCounts($domain),
                'attachment_type_counts' => $this->attachmentTypeCounts($domain),
                'stale_processing' => $this->staleProcessingCount($domain, $limit),
                'throughput_1h' => $this->throughput($domain, 1),
                'throughput_hours' => $this->throughput($domain, $hours),
                'retry_count' => $this->retryCount($domain, $limit),
                'quarantine_reasons' => $this->reasonCounts($domain, AttachmentStatus::Quarantined->value, $limit),
                'failed_reasons' => $this->reasonCounts($domain, AttachmentStatus::Failed->value, $limit),
                'oldest_pending_age_seconds' => $this->oldestAgeSeconds($domain, AttachmentStatus::Pending->value),
                'oldest_processing_age_seconds' => $this->oldestAgeSeconds($domain, AttachmentStatus::Processing->value),
            ];
        }

        return $summary;
    }

    /**
     * @return array<string, mixed>
     */
    public function queueHealth(string $domainFilter, int $limit): array
    {
        $queuedJobs = $this->finalizeJobsByDomain('jobs', $limit);
        $failedJobs = $this->finalizeJobsByDomain('failed_jobs', $limit);
        $health = [];

        foreach ($this->domains($domainFilter) as $domain) {
            $stale = $this->staleProcessingCount($domain, $limit);
            $failedRows = $this->query($domain)->where('status', AttachmentStatus::Failed->value)->count();
            $health[$domain] = [
                'queued_finalize_jobs' => $queuedJobs[$domain]['count'] ?? 0,
                'failed_finalize_jobs' => $failedJobs[$domain]['count'] ?? 0,
                'approx_queue_lag_seconds' => $queuedJobs[$domain]['oldest_age_seconds'] ?? null,
                'stale_processing_count' => $stale,
                'retry_backlog_count' => $failedRows + $stale,
            ];
        }

        return $health;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function lifecycleLog(string $domainFilter, string $eventFilter, int $limit, ?string $since): array
    {
        $sinceAt = $since ? Carbon::parse($since) : null;
        $rows = [];

        foreach ($this->lifecycleLogFiles() as $file) {
            foreach ($this->readLogLinesReverse($file) as $line) {
                $entry = $this->parseLifecycleLogLine($line);
                if ($entry === null) {
                    continue;
                }
                if ($sinceAt && $entry['logged_at'] instanceof Carbon && $entry['logged_at']->lt($sinceAt)) {
                    continue;
                }
                if ($domainFilter !== 'all' && ($entry['domain'] ?? null) !== $domainFilter) {
                    continue;
                }
                if ($eventFilter !== 'all' && ($entry['event'] ?? null) !== $eventFilter) {
                    continue;
                }

                $rows[] = $entry;
                if (count($rows) >= $limit) {
                    return $rows;
                }
            }
        }

        return $rows;
    }

    /**
     * @return array<string, int>
     */
    private function statusCounts(string $domain): array
    {
        $counts = array_fill_keys(self::STATUSES, 0);
        $rows = $this->query($domain)
            ->select('status', DB::raw('COUNT(*) as aggregate'))
            ->groupBy('status')
            ->pluck('aggregate', 'status')
            ->all();

        foreach ($rows as $status => $count) {
            $counts[(string) $status] = (int) $count;
        }

        return $counts;
    }

    /**
     * @return array<string, int>
     */
    private function attachmentTypeCounts(string $domain): array
    {
        return $this->query($domain)
            ->select('attachment_type', DB::raw('COUNT(*) as aggregate'))
            ->groupBy('attachment_type')
            ->pluck('aggregate', 'attachment_type')
            ->map(fn ($count) => (int) $count)
            ->all();
    }

    /**
     * @return array<string, int>
     */
    private function throughput(string $domain, int $hours): array
    {
        $base = $this->query($domain)->where('processed_at', '>=', now()->subHours($hours));

        return [
            'ready' => (clone $base)->where('status', AttachmentStatus::Ready->value)->count(),
            'quarantined' => (clone $base)->where('status', AttachmentStatus::Quarantined->value)->count(),
            'failed' => (clone $base)->where('status', AttachmentStatus::Failed->value)->count(),
        ];
    }

    private function staleProcessingCount(string $domain, int $limit): int
    {
        $count = 0;
        foreach ($this->query($domain)->where('status', AttachmentStatus::Processing->value)->orderBy('id')->limit($limit)->cursor() as $attachment) {
            if ($this->lifecycle->isProcessingStale($attachment)) {
                $count++;
            }
        }

        return $count;
    }

    private function retryCount(string $domain, int $limit): int
    {
        $count = 0;
        foreach ($this->query($domain)->orderByDesc('updated_at')->limit($limit)->cursor() as $attachment) {
            $meta = is_array($attachment->meta) ? $attachment->meta : [];
            $processing = is_array($meta['processing'] ?? null) ? $meta['processing'] : [];
            $retries = is_array($processing['retries'] ?? null) ? $processing['retries'] : [];
            $count += count($retries);
        }

        return $count;
    }

    /**
     * @return array<string, int>
     */
    private function reasonCounts(string $domain, string $status, int $limit): array
    {
        $counts = [];
        foreach ($this->query($domain)->where('status', $status)->orderByDesc('updated_at')->limit($limit)->cursor() as $attachment) {
            $reason = $this->reasonFor($attachment, $status);
            $counts[$reason] = ($counts[$reason] ?? 0) + 1;
        }
        ksort($counts);

        return $counts;
    }

    private function reasonFor(Model $attachment, string $status): string
    {
        if ($status === AttachmentStatus::Quarantined->value) {
            $meta = is_array($attachment->meta) ? $attachment->meta : [];
            $quarantine = is_array($meta['quarantine'] ?? null) ? $meta['quarantine'] : [];

            return (string) ($quarantine['quarantine_reason'] ?? $attachment->failed_reason ?? 'unknown');
        }

        return (string) ($attachment->failed_reason ?? 'unknown');
    }

    private function oldestAgeSeconds(string $domain, string $status): ?int
    {
        $attachment = $this->query($domain)->where('status', $status)->orderBy('created_at')->first();
        if (! $attachment) {
            return null;
        }

        $meta = is_array($attachment->meta) ? $attachment->meta : [];
        $processing = is_array($meta['processing'] ?? null) ? $meta['processing'] : [];
        $timestamp = $status === AttachmentStatus::Pending->value
            ? ($processing['queued_at'] ?? $attachment->created_at)
            : ($processing['started_at'] ?? $processing['last_heartbeat_at'] ?? $attachment->updated_at);

        return (int) max(0, Carbon::parse($timestamp)->diffInSeconds(now()));
    }

    /**
     * @return array<string, array{count: int, oldest_age_seconds: ?int}>
     */
    private function finalizeJobsByDomain(string $table, int $limit): array
    {
        if (! Schema::hasTable($table)) {
            return [];
        }

        $rows = DB::table($table)->orderBy('id')->limit($limit)->get();
        $counts = [];
        foreach ($rows as $row) {
            $payload = (string) ($row->payload ?? '');
            if (! str_contains($payload, 'FinalizeAttachmentUploadJob')) {
                continue;
            }
            $domain = $this->domainFromPayload($payload);
            if ($domain === null) {
                continue;
            }

            $createdAt = isset($row->created_at) ? Carbon::createFromTimestamp((int) $row->created_at) : (isset($row->failed_at) ? Carbon::parse($row->failed_at) : now());
            $age = (int) max(0, $createdAt->diffInSeconds(now()));
            $counts[$domain] ??= ['count' => 0, 'oldest_age_seconds' => null];
            $counts[$domain]['count']++;
            $counts[$domain]['oldest_age_seconds'] = $counts[$domain]['oldest_age_seconds'] === null
                ? $age
                : max($counts[$domain]['oldest_age_seconds'], $age);
        }

        return $counts;
    }

    private function domainFromPayload(string $payload): ?string
    {
        if (preg_match('/"domain";s:\d+:"(core|board|page)"/', $payload, $matches) === 1) {
            return $matches[1];
        }

        if (preg_match('/s:\d+:"\\x00[^";]+\\x00domain";s:\d+:"(core|board|page)"/', $payload, $matches) === 1) {
            return $matches[1];
        }

        if (preg_match('/domain.{0,120}?(core|board|page)/', $payload, $matches) === 1) {
            return $matches[1];
        }

        return null;
    }

    /**
     * @return array<int, string>
     */
    private function lifecycleLogFiles(): array
    {
        $files = glob(storage_path('logs/attachment-lifecycle-*.log')) ?: [];
        rsort($files);

        return $files;
    }

    /**
     * @return array<int, string>
     */
    private function readLogLinesReverse(string $file): array
    {
        $lines = @file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];

        return array_reverse($lines);
    }

    /**
     * @return array<string, mixed>|null
     */
    private function parseLifecycleLogLine(string $line): ?array
    {
        if (! str_contains($line, 'attachment.lifecycle.')) {
            return null;
        }

        if (preg_match('/^\[(?<time>[^\]]+)\].*attachment\.lifecycle\.(?<event>[a-z_]+) (?<json>\{.*\})\s*$/', $line, $matches) !== 1) {
            return null;
        }

        $context = json_decode($matches['json'], true);
        if (! is_array($context)) {
            $context = [];
        }

        return [
            'logged_at' => Carbon::parse($matches['time']),
            'event' => $context['event'] ?? $matches['event'],
            'domain' => $context['domain'] ?? null,
            'attachment_id' => $context['attachment_id'] ?? null,
            'status' => $context['status'] ?? null,
            'queue' => $context['queue'] ?? null,
            'worker' => $context['worker'] ?? null,
            'reason' => $context['reason'] ?? null,
        ];
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
}
