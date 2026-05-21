<?php

namespace App\Console\Commands\AttachmentPipeline;

use App\Services\AttachmentPipelineMetricsService;
use Illuminate\Console\Command;

class SummaryAttachmentPipelineCommand extends Command
{
    protected $signature = 'attachment:pipeline:summary
        {--domain=all : core, board, page, or all}
        {--json : Output JSON instead of tables}
        {--limit=500 : Maximum rows scanned for retry/reason/stale metadata per domain}
        {--hours=24 : Throughput window in hours}';

    protected $description = 'Read-only operational summary for async attachment pipeline state.';

    public function handle(AttachmentPipelineMetricsService $metrics): int
    {
        $domain = (string) $this->option('domain');
        $limit = max(1, (int) $this->option('limit'));
        $hours = max(1, (int) $this->option('hours'));

        if (! $metrics->isValidDomain($domain)) {
            $this->error('Invalid --domain. Use core, board, page, or all.');

            return self::FAILURE;
        }

        $summary = $metrics->summary($domain, $hours, $limit);
        if ($this->option('json')) {
            $this->line(json_encode($this->jsonPayload($domain, $hours, $limit, $summary), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

            return self::SUCCESS;
        }

        $this->info('Attachment pipeline summary is read-only.');
        $this->line('Environment: '.config('app.env'));
        $this->line('Stale threshold: '.config('attachment.processing_stale_minutes', 15).' minutes');

        $statusRows = [];
        $typeRows = [];
        $throughputRows = [];
        $reasonRows = [];
        $ageRows = [];

        foreach ($summary as $domainName => $data) {
            foreach ($data['status_counts'] as $status => $count) {
                $statusRows[] = [$domainName, $status, $count];
            }
            $statusRows[] = [$domainName, 'stale_processing', $data['stale_processing']];

            foreach ($data['attachment_type_counts'] as $type => $count) {
                $typeRows[] = [$domainName, $type ?: 'unknown', $count];
            }

            $throughputRows[] = [$domainName, 'last_1h', $data['throughput_1h']['ready'], $data['throughput_1h']['quarantined'], $data['throughput_1h']['failed']];
            $throughputRows[] = [$domainName, 'last_'.$hours.'h', $data['throughput_hours']['ready'], $data['throughput_hours']['quarantined'], $data['throughput_hours']['failed']];
            $throughputRows[] = [$domainName, 'retry_count_scanned', $data['retry_count'], '-', '-'];

            foreach ($data['quarantine_reasons'] as $reason => $count) {
                $reasonRows[] = [$domainName, 'quarantine', $reason, $count];
            }
            foreach ($data['failed_reasons'] as $reason => $count) {
                $reasonRows[] = [$domainName, 'failed', $reason, $count];
            }

            $ageRows[] = [$domainName, 'oldest_pending', $this->formatAge($data['oldest_pending_age_seconds'])];
            $ageRows[] = [$domainName, 'oldest_processing', $this->formatAge($data['oldest_processing_age_seconds'])];
        }

        $this->table(['Domain', 'Status', 'Count'], $statusRows);
        $this->table(['Domain', 'Attachment type', 'Count'], $typeRows ?: [['-', '-', 0]]);
        $this->table(['Domain', 'Window', 'Ready', 'Quarantined', 'Failed'], $throughputRows);
        $this->table(['Domain', 'Kind', 'Reason', 'Count'], $reasonRows ?: [['-', '-', '-', 0]]);
        $this->table(['Domain', 'Metric', 'Age'], $ageRows);

        return self::SUCCESS;
    }

    /**
     * @param  array<string, mixed>  $summary
     * @return array<string, mixed>
     */
    private function jsonPayload(string $domain, int $hours, int $limit, array $summary): array
    {
        $totals = [];
        $stale = [];
        $throughput = [];
        $failures = [];
        $quarantines = [];

        foreach ($summary as $domainName => $data) {
            $totals[$domainName] = array_sum(array_map('intval', $data['status_counts'] ?? []));
            $stale[$domainName] = $data['stale_processing'] ?? 0;
            $throughput[$domainName] = [
                'last_1h' => $data['throughput_1h'] ?? [],
                'window_hours' => $hours,
                'window' => $data['throughput_hours'] ?? [],
            ];
            $failures[$domainName] = $data['failed_reasons'] ?? [];
            $quarantines[$domainName] = $data['quarantine_reasons'] ?? [];
        }

        return [
            'generated_at' => now()->toISOString(),
            'filters' => [
                'domain' => $domain,
                'hours' => $hours,
                'limit' => $limit,
            ],
            'domains' => $summary,
            'totals' => $totals,
            'stale' => $stale,
            'throughput' => $throughput,
            'failures' => $failures,
            'quarantines' => $quarantines,
        ];
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
