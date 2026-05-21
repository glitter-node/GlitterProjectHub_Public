<?php

namespace App\Console\Commands\AttachmentPipeline;

use App\Services\AttachmentPipelineMetricsService;
use Illuminate\Console\Command;

class LifecycleLogAttachmentPipelineCommand extends Command
{
    protected $signature = 'attachment:pipeline:lifecycle-log
        {--domain=all : core, board, page, or all}
        {--event=all : accepted, queued, processing_started, ready, quarantined, failed, stale_detected, retry_started, retry_queued, or all}
        {--limit=50 : Maximum log entries to show}
        {--since= : Only show events logged since a parseable date/time}
        {--json : Output JSON instead of a table}';

    protected $description = 'Read-only recent lifecycle event report from attachment_lifecycle logs.';

    /** @var array<int, string> */
    private array $events = ['all', 'accepted', 'queued', 'processing_started', 'ready', 'quarantined', 'failed', 'stale_detected', 'retry_started', 'retry_queued'];

    public function handle(AttachmentPipelineMetricsService $metrics): int
    {
        $domain = (string) $this->option('domain');
        $event = (string) $this->option('event');
        $limit = max(1, (int) $this->option('limit'));
        $since = $this->option('since') !== null ? (string) $this->option('since') : null;

        if (! $metrics->isValidDomain($domain)) {
            $this->error('Invalid --domain. Use core, board, page, or all.');

            return self::FAILURE;
        }

        if (! in_array($event, $this->events, true)) {
            $this->error('Invalid --event. Use a known lifecycle event or all.');

            return self::FAILURE;
        }

        $entries = $metrics->lifecycleLog($domain, $event, $limit, $since);
        $entries = array_map(function (array $entry): array {
            $entry['logged_at'] = $entry['logged_at']?->toISOString();

            return $entry;
        }, $entries);

        if ($this->option('json')) {
            $this->line(json_encode([
                'generated_at' => now()->toISOString(),
                'filters' => [
                    'domain' => $domain,
                    'event' => $event,
                    'limit' => $limit,
                    'since' => $since,
                ],
                'events' => $entries,
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

            return self::SUCCESS;
        }

        $rows = [];
        foreach ($entries as $entry) {
            $rows[] = [
                $entry['logged_at'],
                $entry['domain'] ?? '-',
                $entry['event'] ?? '-',
                $entry['attachment_id'] ?? '-',
                $entry['status'] ?? '-',
                $entry['reason'] ?? '-',
                $entry['queue'] ?? '-',
                $entry['worker'] ?? '-',
            ];
        }

        $this->table(['Logged at', 'Domain', 'Event', 'Attachment ID', 'Status', 'Reason', 'Queue', 'Worker'], $rows ?: [['-', '-', '-', '-', '-', '-', '-', '-']]);

        return self::SUCCESS;
    }
}
