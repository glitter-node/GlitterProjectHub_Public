<?php

namespace App\Console\Commands\AttachmentPipeline;

use App\Services\AttachmentPipelineOperatorService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class ExportTerminalAttachmentPipelineCommand extends Command
{
    protected $signature = 'attachment:pipeline:export-terminal
        {--domain=all : core, board, page, or all}
        {--status=all : failed, quarantined, or all}
        {--since= : Only include rows created/updated since a parseable date/time}
        {--until= : Only include rows created/updated until a parseable date/time}
        {--limit= : Maximum rows to export; defaults to config attachment.terminal_export_default_limit}
        {--json : Output JSON instead of a table}
        {--path= : Write JSON export to this file path}
        {--include-paths : Include storage disk/path metadata; never includes public URLs}
        {--force : Required with --include-paths and to overwrite --path output}';

    protected $description = 'Read-only export of failed/quarantined attachment metadata for operators.';

    public function handle(AttachmentPipelineOperatorService $operator): int
    {
        $domain = (string) $this->option('domain');
        $status = (string) $this->option('status');
        $includePaths = (bool) $this->option('include-paths');
        $force = (bool) $this->option('force');
        $path = $this->option('path') !== null ? (string) $this->option('path') : null;
        $limit = $this->resolveLimit();

        if ($limit === null) {
            return self::FAILURE;
        }

        if (! $operator->isValidDomain($domain)) {
            $this->error('Invalid --domain. Use core, board, page, or all.');

            return self::FAILURE;
        }

        if (! $operator->isValidTerminalExportStatus($status)) {
            $this->error('Invalid --status. Use failed, quarantined, or all.');

            return self::FAILURE;
        }

        if ($includePaths && ! $force) {
            $this->error('--include-paths requires --force acknowledgement.');

            return self::FAILURE;
        }

        if ($path !== null && file_exists($path) && ! $force) {
            $this->error('--path target already exists. Re-run with --force to overwrite.');

            return self::FAILURE;
        }

        try {
            $since = $this->option('since') !== null ? Carbon::parse((string) $this->option('since')) : null;
            $until = $this->option('until') !== null ? Carbon::parse((string) $this->option('until')) : null;
        } catch (\Throwable $exception) {
            $this->error('Invalid --since or --until date/time: '.$exception->getMessage());

            return self::FAILURE;
        }

        if ($since && $until && $since->gt($until)) {
            $this->error('--since must be earlier than or equal to --until.');

            return self::FAILURE;
        }

        $rows = $operator->terminalExportRows($domain, $status, $since, $until, $limit, $includePaths);
        $payload = [
            'generated_at' => now()->toISOString(),
            'filters' => [
                'domain' => $domain,
                'status' => $status,
                'since' => $since?->toISOString(),
                'until' => $until?->toISOString(),
                'limit' => $limit,
            ],
            'redaction' => [
                'paths_included' => $includePaths,
                'public_urls_included' => false,
            ],
            'rows' => $rows,
        ];

        if ($path !== null) {
            $directory = dirname($path);
            if (! is_dir($directory) || ! is_writable($directory)) {
                $this->error('--path directory is not writable: '.$directory);

                return self::FAILURE;
            }

            $encoded = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            if ($encoded === false || file_put_contents($path, $encoded.PHP_EOL) === false) {
                $this->error('Failed to write export file: '.$path);

                return self::FAILURE;
            }

            $this->info('Export file written: '.$path);
        }

        if ($this->option('json')) {
            $this->line(json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

            return self::SUCCESS;
        }

        $this->line('Attachment terminal export is read-only.');
        $this->line($includePaths ? 'Storage path metadata included by explicit --force acknowledgement.' : 'Storage paths redacted; public URLs are never exported.');
        $this->table($this->tableHeaders($includePaths), $this->tableRows($rows, $includePaths));

        return self::SUCCESS;
    }

    private function resolveLimit(): ?int
    {
        $value = $this->option('limit');
        $limit = $value === null || $value === ''
            ? (int) config('attachment.terminal_export_default_limit', 100)
            : (int) $value;

        if ($limit < 1) {
            $this->error('--limit must be at least 1.');

            return null;
        }

        return min($limit, 5000);
    }

    /**
     * @return array<int, string>
     */
    private function tableHeaders(bool $includePaths): array
    {
        $headers = ['Domain', 'ID', 'Status', 'Type', 'Filename', 'MIME', 'Size', 'Failed reason', 'Quarantine reason', 'Processed at', 'Created at', 'Updated at', 'Retries'];

        if ($includePaths) {
            $headers[] = 'Disk';
            $headers[] = 'Path';
        }

        return $headers;
    }

    /**
     * @param  array<int, array<string, mixed>>  $rows
     * @return array<int, array<int, mixed>>
     */
    private function tableRows(array $rows, bool $includePaths): array
    {
        $tableRows = [];
        foreach ($rows as $row) {
            $tableRow = [
                $row['domain'],
                $row['attachment_id'],
                $row['status'],
                $row['attachment_type'],
                $row['original_filename'],
                $row['mime_type'],
                $row['size'],
                $row['failed_reason'],
                $row['quarantine_reason'],
                $row['processed_at'],
                $row['created_at'],
                $row['updated_at'],
                $row['retry_attempts'],
            ];

            if ($includePaths) {
                $tableRow[] = $row['disk'] ?? null;
                $tableRow[] = $row['path'] ?? null;
            }

            $tableRows[] = $tableRow;
        }

        if ($tableRows !== []) {
            return $tableRows;
        }

        $empty = ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'];
        if ($includePaths) {
            $empty[] = '-';
            $empty[] = '-';
        }

        return [$empty];
    }
}
