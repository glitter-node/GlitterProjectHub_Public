<?php

namespace App\Console\Commands\AttachmentPipeline;

use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class PruneLifecycleLogsAttachmentPipelineCommand extends Command
{
    protected $signature = 'attachment:pipeline:logs:prune
        {--days= : Retention days; defaults to config attachment.lifecycle_log_retention_days}
        {--force : Delete candidate files instead of dry-run}
        {--json : Output JSON instead of a table}
        {--verification-mode : Allow a guarded temporary log directory for command-level verification}
        {--log-dir= : Verification-only lifecycle log directory; requires --verification-mode and must be under sys_get_temp_dir()}';

    protected $description = 'Safely prune old attachment_lifecycle daily log files.';

    public function handle(): int
    {
        $days = $this->resolveDays();
        $logDirectory = $this->resolveLogDirectory();
        if ($days === null || $logDirectory === null) {
            return self::FAILURE;
        }

        $force = (bool) $this->option('force');
        $today = Carbon::today();
        $cutoff = $today->copy()->subDays($days);
        $report = [
            'generated_at' => now()->toISOString(),
            'dry_run' => ! $force,
            'verification_mode' => (bool) $this->option('verification-mode'),
            'log_directory' => $logDirectory,
            'retention_days' => $days,
            'cutoff_date' => $cutoff->toDateString(),
            'candidate_files' => [],
            'total_size' => 0,
            'deleted_files' => [],
            'skipped_files' => [],
        ];

        foreach ($this->lifecycleLogFiles($logDirectory) as $file) {
            $date = $this->dateFromLifecycleLogFile($file);
            $size = is_file($file) ? (int) filesize($file) : 0;
            $entry = [
                'path' => $file,
                'date' => $date?->toDateString(),
                'size' => $size,
            ];

            if ($date === null) {
                $report['skipped_files'][] = $entry + ['reason' => 'unrecognized_lifecycle_log_name'];
                continue;
            }

            if ($date->isSameDay($today)) {
                $report['skipped_files'][] = $entry + ['reason' => 'current_day_never_deleted'];
                continue;
            }

            if ($date->gte($cutoff)) {
                $report['skipped_files'][] = $entry + ['reason' => 'within_retention'];
                continue;
            }

            $report['candidate_files'][] = $entry;
            $report['total_size'] += $size;

            if (! $force) {
                continue;
            }

            if (@unlink($file)) {
                $report['deleted_files'][] = $entry;
            } else {
                $report['skipped_files'][] = $entry + ['reason' => 'delete_failed'];
            }
        }

        $report['candidates'] = $report['candidate_files'];
        $report['deleted'] = $report['deleted_files'];
        $report['skipped'] = $report['skipped_files'];

        if ($this->option('json')) {
            $this->line(json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

            return self::SUCCESS;
        }

        $this->line($force ? 'Prune mode: --force enabled.' : 'Dry-run mode: no log files will be deleted.');
        $this->line('Retention days: '.$days);
        $this->line('Log directory: '.$logDirectory);
        $this->line('Total candidate size: '.$report['total_size'].' bytes');
        $this->table(['Type', 'Date', 'Size', 'Path', 'Reason'], $this->tableRows($report));

        return self::SUCCESS;
    }

    private function resolveDays(): ?int
    {
        $value = $this->option('days');
        $days = $value === null || $value === ''
            ? (int) config('attachment.lifecycle_log_retention_days', 14)
            : (int) $value;

        if ($days < 1) {
            $this->error('--days must be at least 1.');

            return null;
        }

        return $days;
    }

    private function resolveLogDirectory(): ?string
    {
        $logDir = $this->option('log-dir');
        $verificationMode = (bool) $this->option('verification-mode');

        if ($logDir !== null && $logDir !== '' && ! $verificationMode) {
            $this->error('--log-dir is only available with --verification-mode.');

            return null;
        }

        if ($verificationMode) {
            if ($logDir === null || $logDir === '') {
                $this->error('--verification-mode requires --log-dir.');

                return null;
            }

            $realLogDir = realpath((string) $logDir);
            $realTempDir = realpath(sys_get_temp_dir());
            if ($realLogDir === false || $realTempDir === false || ! is_dir($realLogDir) || ! is_writable($realLogDir)) {
                $this->error('--log-dir must be an existing writable directory under sys_get_temp_dir().');

                return null;
            }

            if ($realLogDir === $realTempDir || ! str_starts_with($realLogDir.DIRECTORY_SEPARATOR, $realTempDir.DIRECTORY_SEPARATOR)) {
                $this->error('--log-dir verification directory must be a subdirectory of sys_get_temp_dir().');

                return null;
            }

            return $realLogDir;
        }

        $path = (string) config('logging.channels.attachment_lifecycle.path', storage_path('logs/attachment-lifecycle.log'));

        return dirname($path);
    }

    /**
     * @return array<int, string>
     */
    private function lifecycleLogFiles(string $directory): array
    {
        $filename = basename((string) config('logging.channels.attachment_lifecycle.path', storage_path('logs/attachment-lifecycle.log')), '.log');
        $files = glob($directory.'/'.$filename.'-*.log') ?: [];
        sort($files);

        return array_values(array_filter($files, fn (string $file): bool => basename($file) !== 'laravel.log'));
    }

    private function dateFromLifecycleLogFile(string $file): ?Carbon
    {
        $path = (string) config('logging.channels.attachment_lifecycle.path', storage_path('logs/attachment-lifecycle.log'));
        $filename = preg_quote(basename($path, '.log'), '/');

        if (preg_match('/^'.$filename.'-(\d{4}-\d{2}-\d{2})\.log$/', basename($file), $matches) !== 1) {
            return null;
        }

        return Carbon::createFromFormat('Y-m-d', $matches[1])->startOfDay();
    }

    /**
     * @param  array<string, mixed>  $report
     * @return array<int, array<int, string|int|null>>
     */
    private function tableRows(array $report): array
    {
        $rows = [];

        foreach ($report['candidate_files'] as $file) {
            $rows[] = ['candidate', $file['date'], $file['size'], $file['path'], '-'];
        }

        foreach ($report['deleted_files'] as $file) {
            $rows[] = ['deleted', $file['date'], $file['size'], $file['path'], '-'];
        }

        foreach ($report['skipped_files'] as $file) {
            $rows[] = ['skipped', $file['date'], $file['size'], $file['path'], $file['reason']];
        }

        return $rows ?: [['-', '-', 0, '-', 'no lifecycle log files found']];
    }
}
