<?php

namespace App\Console\Commands\AttachmentPipeline;

use App\Services\AttachmentPipelineJsonContractService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class VerifyOperatorCommandsAttachmentPipelineCommand extends Command
{
    protected $signature = 'attachment:pipeline:verify-operator-commands
        {--json : Output JSON verification report instead of a table}';

    protected $description = 'Run isolated production-safe regression checks for attachment pipeline operator commands.';

    /** @var array<int, array{name: string, passed: bool, detail: string}> */
    private array $checks = [];

    private AttachmentPipelineJsonContractService $contracts;

    public function handle(AttachmentPipelineJsonContractService $contracts): int
    {
        $this->contracts = $contracts;
        $tempDir = sys_get_temp_dir().'/gph-attachment-pipeline-verify-'.Str::random(12);
        $beforeCounts = $this->runtimeCounts();

        try {
            if (! mkdir($tempDir, 0700, true) && ! is_dir($tempDir)) {
                throw new \RuntimeException('Failed to create temp verification directory: '.$tempDir);
            }

            $files = $this->createFakeLogs($tempDir);
            $this->verifyPruneDryRun($tempDir, $files);
            $this->verifyPruneForce($tempDir, $files);
            $this->verifyExportTerminalJsonShape();
            $this->verifyLoadChecks();
            $this->assertRuntimeCountsUnchanged($beforeCounts, $this->runtimeCounts());
        } catch (\Throwable $exception) {
            $this->checks[] = [
                'name' => 'verification_exception',
                'passed' => false,
                'detail' => $exception->getMessage(),
            ];
        } finally {
            $this->removeDirectory($tempDir);
            $this->checks[] = [
                'name' => 'temp_directory_cleanup',
                'passed' => ! is_dir($tempDir),
                'detail' => $tempDir,
            ];
        }

        $passed = collect($this->checks)->every(fn (array $check): bool => $check['passed']);
        $failed = collect($this->checks)->filter(fn (array $check): bool => ! $check['passed'])->count();
        $payload = [
            'generated_at' => now()->toISOString(),
            'passed' => $passed,
            'failed' => $failed,
            'environment' => config('app.env'),
            'cleanup' => [
                'temp_directory' => $tempDir,
                'removed' => ! is_dir($tempDir),
            ],
            'checks' => $this->checks,
        ];
        $this->appendContractChecks('verify-operator-commands', $payload);
        $passed = collect($this->checks)->every(fn (array $check): bool => $check['passed']);
        $failed = collect($this->checks)->filter(fn (array $check): bool => ! $check['passed'])->count();
        $payload['passed'] = $passed;
        $payload['failed'] = $failed;
        $payload['checks'] = $this->checks;

        if ($this->option('json')) {
            $this->line(json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

            return $passed ? self::SUCCESS : self::FAILURE;
        }

        $this->line('Attachment pipeline operator command verification is production-safe and isolated.');
        $this->line('Environment: '.config('app.env'));
        $this->table(['Check', 'Result', 'Detail'], array_map(
            fn (array $check): array => [$check['name'], $check['passed'] ? 'PASS' : 'FAIL', $check['detail']],
            $this->checks
        ));

        return $passed ? self::SUCCESS : self::FAILURE;
    }

    /**
     * @return array<string, string>
     */
    private function createFakeLogs(string $tempDir): array
    {
        $today = Carbon::today();
        $files = [
            'old' => $tempDir.'/attachment-lifecycle-'.$today->copy()->subDays(10)->toDateString().'.log',
            'old_second' => $tempDir.'/attachment-lifecycle-'.$today->copy()->subDays(9)->toDateString().'.log',
            'recent' => $tempDir.'/attachment-lifecycle-'.$today->copy()->subDay()->toDateString().'.log',
            'current' => $tempDir.'/attachment-lifecycle-'.$today->toDateString().'.log',
            'unrelated' => $tempDir.'/unrelated.log',
            'laravel' => $tempDir.'/laravel.log',
            'laravel_daily' => $tempDir.'/laravel-'.$today->copy()->subDays(10)->toDateString().'.log',
        ];

        foreach ($files as $file) {
            file_put_contents($file, 'verification log'.PHP_EOL);
        }

        $this->checks[] = [
            'name' => 'fake_log_setup',
            'passed' => count(glob($tempDir.'/*') ?: []) === count($files),
            'detail' => $tempDir,
        ];

        return $files;
    }

    /**
     * @param  array<string, string>  $files
     */
    private function verifyPruneDryRun(string $tempDir, array $files): void
    {
        $report = $this->callJson('attachment:pipeline:logs:prune', [
            '--days' => 7,
            '--json' => true,
            '--verification-mode' => true,
            '--log-dir' => $tempDir,
        ], 'logs-prune');

        $candidatePaths = array_column($report['candidate_files'] ?? [], 'path');
        $candidateNames = array_map('basename', $candidatePaths);
        $this->checks[] = [
            'name' => 'logs_prune_dry_run_finds_old_fake_logs',
            'passed' => in_array(basename($files['old']), $candidateNames, true) && in_array(basename($files['old_second']), $candidateNames, true),
            'detail' => 'candidate_count='.(string) count($candidatePaths),
        ];
        $this->checks[] = [
            'name' => 'logs_prune_dry_run_deletes_nothing',
            'passed' => collect($files)->every(fn (string $file): bool => file_exists($file)),
            'detail' => 'all fake files still present after dry-run',
        ];
    }

    /**
     * @param  array<string, string>  $files
     */
    private function verifyPruneForce(string $tempDir, array $files): void
    {
        $report = $this->callJson('attachment:pipeline:logs:prune', [
            '--days' => 7,
            '--force' => true,
            '--json' => true,
            '--verification-mode' => true,
            '--log-dir' => $tempDir,
        ], 'logs-prune');

        $deletedPaths = array_column($report['deleted_files'] ?? [], 'path');
        $deletedNames = array_map('basename', $deletedPaths);
        $this->checks[] = [
            'name' => 'logs_prune_force_deletes_only_old_fake_lifecycle_logs',
            'passed' => ! file_exists($files['old'])
                && ! file_exists($files['old_second'])
                && in_array(basename($files['old']), $deletedNames, true)
                && in_array(basename($files['old_second']), $deletedNames, true),
            'detail' => 'deleted_count='.(string) count($deletedPaths),
        ];
        $this->checks[] = [
            'name' => 'logs_prune_force_keeps_current_day_lifecycle_log',
            'passed' => file_exists($files['current']),
            'detail' => basename($files['current']),
        ];
        $this->checks[] = [
            'name' => 'logs_prune_force_keeps_recent_lifecycle_log',
            'passed' => file_exists($files['recent']),
            'detail' => basename($files['recent']),
        ];
        $this->checks[] = [
            'name' => 'logs_prune_force_keeps_unrelated_files',
            'passed' => file_exists($files['unrelated']),
            'detail' => basename($files['unrelated']),
        ];
        $this->checks[] = [
            'name' => 'logs_prune_force_keeps_laravel_style_logs',
            'passed' => file_exists($files['laravel']) && file_exists($files['laravel_daily']),
            'detail' => basename($files['laravel']).', '.basename($files['laravel_daily']),
        ];
    }

    private function verifyExportTerminalJsonShape(): void
    {
        $payload = $this->callJson('attachment:pipeline:export-terminal', [
            '--domain' => 'all',
            '--status' => 'all',
            '--limit' => 5,
            '--json' => true,
        ], 'export-terminal');

        $rows = is_array($payload['rows'] ?? null) ? $payload['rows'] : [];
        $this->checks[] = [
            'name' => 'export_terminal_json_shape_read_only',
            'passed' => true,
            'detail' => 'row_count='.count($rows),
        ];
    }

    private function verifyLoadChecks(): void
    {
        $this->callJson('attachment:pipeline:scan', [
            '--domain' => 'all',
            '--status' => 'all',
            '--limit' => 1,
            '--json' => true,
        ], 'scan');
        $this->checks[] = [
            'name' => 'scan_command_load_check',
            'passed' => true,
            'detail' => 'attachment:pipeline:scan --json completed',
        ];

        $this->callJson('attachment:pipeline:summary', [
            '--domain' => 'all',
            '--limit' => 1,
            '--hours' => 1,
            '--json' => true,
        ], 'summary');
        $this->checks[] = [
            'name' => 'summary_command_load_check',
            'passed' => true,
            'detail' => 'attachment:pipeline:summary --json completed',
        ];

        $this->callJson('attachment:pipeline:queue-health', [
            '--domain' => 'all',
            '--limit' => 1,
            '--json' => true,
        ], 'queue-health');
        $this->checks[] = [
            'name' => 'queue_health_command_load_check',
            'passed' => true,
            'detail' => 'attachment:pipeline:queue-health --json completed',
        ];

        $this->callJson('attachment:pipeline:lifecycle-log', [
            '--limit' => 5,
            '--json' => true,
        ], 'lifecycle-log');
        $this->checks[] = [
            'name' => 'lifecycle_log_command_load_check',
            'passed' => true,
            'detail' => 'attachment:pipeline:lifecycle-log --json completed',
        ];
    }

    /**
     * @param  array<string, mixed>  $parameters
     * @return array<mixed>
     */
    private function callJson(string $command, array $parameters, ?string $contract = null): array
    {
        $exitCode = $this->callCommand($command, $parameters);
        $output = trim(Artisan::output());
        $decoded = json_decode($output, true);

        if ($exitCode !== self::SUCCESS || ! is_array($decoded)) {
            throw new \RuntimeException($command.' did not return decodable JSON. Output: '.$output);
        }

        if ($contract !== null) {
            $this->appendContractChecks($contract, $decoded);
        }

        return $decoded;
    }

    private function appendContractChecks(string $contract, array $payload): void
    {
        foreach ($this->contracts->assert($contract, $payload) as $check) {
            $this->checks[] = [
                'name' => 'json_contract.'.$check['name'],
                'passed' => $check['passed'],
                'detail' => $check['detail'],
            ];
        }
    }

    /**
     * @param  array<string, mixed>  $parameters
     */
    private function callCommand(string $command, array $parameters): int
    {
        $exitCode = Artisan::call($command, $parameters);
        if ($exitCode !== self::SUCCESS) {
            throw new \RuntimeException($command.' failed with exit code '.$exitCode.'. Output: '.trim(Artisan::output()));
        }

        return $exitCode;
    }

    /**
     * @return array<string, int|null>
     */
    private function runtimeCounts(): array
    {
        $tables = ['attachments', 'board_attachments', 'page_attachments', 'jobs', 'failed_jobs'];
        $counts = [];
        foreach ($tables as $table) {
            $counts[$table] = Schema::hasTable($table) ? DB::table($table)->count() : null;
        }

        return $counts;
    }

    /**
     * @param  array<string, int|null>  $before
     * @param  array<string, int|null>  $after
     */
    private function assertRuntimeCountsUnchanged(array $before, array $after): void
    {
        $this->checks[] = [
            'name' => 'no_attachment_rows_or_queue_jobs_mutated',
            'passed' => $before === $after,
            'detail' => 'before='.json_encode($before).'; after='.json_encode($after),
        ];
    }

    private function removeDirectory(string $directory): void
    {
        if (! is_dir($directory)) {
            return;
        }

        $items = scandir($directory) ?: [];
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }

            $path = $directory.DIRECTORY_SEPARATOR.$item;
            if (is_dir($path)) {
                $this->removeDirectory($path);
            } else {
                @unlink($path);
            }
        }

        @rmdir($directory);
    }
}
