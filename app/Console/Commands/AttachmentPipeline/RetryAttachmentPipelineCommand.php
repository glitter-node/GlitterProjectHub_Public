<?php

namespace App\Console\Commands\AttachmentPipeline;

use App\Services\AttachmentPipelineOperatorService;
use Illuminate\Console\Command;

class RetryAttachmentPipelineCommand extends Command
{
    protected $signature = 'attachment:pipeline:retry
        {--domain=all : core, board, page, or all}
        {--id= : Attachment id within the selected domain}
        {--stale : Include stale processing rows}
        {--limit=50 : Maximum candidate rows to inspect/requeue}
        {--force : Actually transition selected rows to pending and dispatch finalize jobs}';

    protected $description = 'Safely retry failed or stale async attachment finalization jobs.';

    public function handle(AttachmentPipelineOperatorService $operator): int
    {
        $domain = (string) $this->option('domain');
        $id = $this->option('id') !== null ? (int) $this->option('id') : null;
        $includeStale = (bool) $this->option('stale');
        $limit = max(1, (int) $this->option('limit'));
        $force = (bool) $this->option('force');

        if (! $operator->isValidDomain($domain)) {
            $this->error('Invalid --domain. Use core, board, page, or all.');

            return self::FAILURE;
        }

        if ($id !== null && $domain === 'all') {
            $this->error('--id requires --domain=core, --domain=board, or --domain=page.');

            return self::FAILURE;
        }

        $this->line($force ? 'Mutation mode: --force enabled.' : 'Dry-run mode: no rows will be mutated and no jobs will be dispatched.');
        $this->line('Retryable statuses: failed'.($includeStale ? ', stale processing' : ''));
        $this->line('Terminal statuses never retried: ready, quarantined');

        $rows = [];
        $mutated = 0;
        $selected = 0;
        $skipped = 0;

        foreach ($operator->retryCandidates($domain, $id, $includeStale, $limit) as $candidate) {
            $attachment = $candidate['attachment'];
            $domainName = $candidate['domain'];
            $result = $operator->retry($domainName, $attachment, $force, (bool) $candidate['stale']);
            $description = $operator->describe($attachment);

            if ($result['selected']) {
                $selected++;
            } else {
                $skipped++;
            }
            if ($result['mutated']) {
                $mutated++;
            }

            $rows[] = [
                $domainName,
                $description['id'],
                $result['from'],
                $result['to'] ?? '-',
                $candidate['stale'] ? 'yes' : 'no',
                $result['reason'],
                $description['failed_reason'] ?? '-',
            ];
        }

        if ($rows === []) {
            $this->warn('No candidate attachments found.');
        } else {
            $this->table(['Domain', 'ID', 'From', 'To', 'Stale', 'Result', 'Previous reason'], $rows);
        }

        $this->info("Selected: {$selected}; Mutated: {$mutated}; Skipped: {$skipped}");
        if (! $force) {
            $this->warn('Re-run with --force to apply these transitions.');
        }

        return self::SUCCESS;
    }
}
