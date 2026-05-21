<?php

namespace App\Console\Commands\AttachmentPipeline;

use App\Services\AttachmentPipelineMetricsService;
use Illuminate\Console\Command;

class QueueHealthAttachmentPipelineCommand extends Command
{
    protected $signature = 'attachment:pipeline:queue-health
        {--domain=all : core, board, page, or all}
        {--json : Output JSON instead of a table}
        {--limit=1000 : Maximum queue rows and processing rows scanned}';

    protected $description = 'Read-only database queue health report for attachment finalization jobs.';

    public function handle(AttachmentPipelineMetricsService $metrics): int
    {
        $domain = (string) $this->option('domain');
        $limit = max(1, (int) $this->option('limit'));

        if (! $metrics->isValidDomain($domain)) {
            $this->error('Invalid --domain. Use core, board, page, or all.');

            return self::FAILURE;
        }

        $health = $metrics->queueHealth($domain, $limit);
        if ($this->option('json')) {
            $this->line(json_encode([
                'generated_at' => now()->toISOString(),
                'filters' => [
                    'domain' => $domain,
                    'limit' => $limit,
                ],
                'queue' => [
                    'connection' => config('queue.default'),
                ],
                'domains' => $health,
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

            return self::SUCCESS;
        }

        $this->info('Attachment pipeline queue health is read-only.');
        $this->line('Queue connection: '.config('queue.default'));

        $rows = [];
        foreach ($health as $domainName => $data) {
            $rows[] = [
                $domainName,
                $data['queued_finalize_jobs'],
                $data['failed_finalize_jobs'],
                $this->formatAge($data['approx_queue_lag_seconds']),
                $data['stale_processing_count'],
                $data['retry_backlog_count'],
            ];
        }

        $this->table(['Domain', 'Queued finalize jobs', 'Failed finalize jobs', 'Approx queue lag', 'Stale processing', 'Retry backlog'], $rows);

        return self::SUCCESS;
    }

    private function formatAge(?int $seconds): string
    {
        if ($seconds === null) {
            return '-';
        }

        if ($seconds < 60) {
            return $seconds.'s';
        }

        if ($seconds < 3600) {
            return intdiv($seconds, 60).'m '.($seconds % 60).'s';
        }

        return intdiv($seconds, 3600).'h '.intdiv($seconds % 3600, 60).'m';
    }
}
