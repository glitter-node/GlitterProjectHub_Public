<?php

namespace App\Console\Commands\AttachmentPipeline;

use App\Services\AttachmentPipelineOperatorService;
use Illuminate\Console\Command;

class ScanAttachmentPipelineCommand extends Command
{
    protected $signature = 'attachment:pipeline:scan
        {--domain=all : core, board, page, or all}
        {--status=all : pending, processing, ready, failed, quarantined, or all}
        {--stale : Report only stale processing counts}
        {--limit=50 : Limit stale processing rows scanned per domain when --stale is used}
        {--json : Output JSON instead of a table}';

    protected $description = 'Read-only scan of async attachment pipeline lifecycle state.';

    public function handle(AttachmentPipelineOperatorService $operator): int
    {
        $domain = (string) $this->option('domain');
        $status = (string) $this->option('status');
        $limit = max(1, (int) $this->option('limit'));
        $staleOnly = (bool) $this->option('stale');

        if (! $operator->isValidDomain($domain)) {
            $this->error('Invalid --domain. Use core, board, page, or all.');

            return self::FAILURE;
        }

        if (! $operator->isValidStatus($status)) {
            $this->error('Invalid --status. Use pending, processing, ready, failed, quarantined, or all.');

            return self::FAILURE;
        }

        if ($staleOnly) {
            $counts = $operator->staleCounts($domain, $limit);
            if ($this->option('json')) {
                $this->line(json_encode($this->jsonPayload($domain, $status, $staleOnly, $limit, $counts), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

                return self::SUCCESS;
            }

            $this->info('Attachment pipeline scan is read-only.');
            $this->line('Environment: '.config('app.env'));
            $this->line('Stale threshold: '.config('attachment.processing_stale_minutes', 15).' minutes');

            $rows = [];
            foreach ($counts as $domainName => $count) {
                $rows[] = [$domainName, $count, $limit];
            }
            $this->table(['Domain', 'Stale processing', 'Scan limit'], $rows);

            return self::SUCCESS;
        }

        $counts = $operator->statusCounts($domain, $status);
        if ($this->option('json')) {
            $this->line(json_encode($this->jsonPayload($domain, $status, $staleOnly, $limit, $counts), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

            return self::SUCCESS;
        }

        $this->info('Attachment pipeline scan is read-only.');
        $this->line('Environment: '.config('app.env'));
        $this->line('Stale threshold: '.config('attachment.processing_stale_minutes', 15).' minutes');

        $rows = [];
        foreach ($counts as $domainName => $domainCounts) {
            foreach ($domainCounts as $statusName => $count) {
                $rows[] = [$domainName, $statusName, $count];
            }
        }
        $this->table(['Domain', 'Status', 'Count'], $rows);

        return self::SUCCESS;
    }

    /**
     * @param  array<string, mixed>  $domains
     * @return array<string, mixed>
     */
    private function jsonPayload(string $domain, string $status, bool $staleOnly, int $limit, array $domains): array
    {
        return [
            'generated_at' => now()->toISOString(),
            'filters' => [
                'domain' => $domain,
                'status' => $status,
                'stale' => $staleOnly,
                'limit' => $limit,
            ],
            'domains' => $domains,
        ];
    }
}
