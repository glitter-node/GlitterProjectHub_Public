<?php

namespace App\Services;

class AttachmentPipelineJsonContractService
{
    public function assert(string $contract, mixed $payload): array
    {
        $checks = [];
        $this->assertType($checks, $contract, $payload, 'object');
        if (! is_array($payload)) {
            return $checks;
        }

        match ($contract) {
            'scan' => $this->assertScan($checks, $payload),
            'summary' => $this->assertSummary($checks, $payload),
            'queue-health' => $this->assertQueueHealth($checks, $payload),
            'lifecycle-log' => $this->assertLifecycleLog($checks, $payload),
            'logs-prune' => $this->assertLogsPrune($checks, $payload),
            'export-terminal' => $this->assertExportTerminal($checks, $payload),
            'verify-operator-commands' => $this->assertVerifyOperatorCommands($checks, $payload),
            default => $checks[] = ['name' => $contract.'.known_contract', 'passed' => false, 'detail' => 'Unknown JSON contract.'],
        };

        $this->assertNoRawFileContents($checks, $contract, $payload);
        $this->assertNoUnexpectedAbsolutePaths($checks, $contract, $payload, $this->allowedPathKeys($contract));

        return $checks;
    }

    private function assertScan(array &$checks, array $payload): void
    {
        $this->requireKeys($checks, 'scan', $payload, ['generated_at', 'filters', 'domains']);
        $this->assertType($checks, 'scan.generated_at', $payload['generated_at'] ?? null, 'string');
        $this->assertType($checks, 'scan.filters', $payload['filters'] ?? null, 'object');
        $this->assertType($checks, 'scan.domains', $payload['domains'] ?? null, 'object');
        if (is_array($payload['filters'] ?? null)) {
            $this->requireKeys($checks, 'scan.filters', $payload['filters'], ['domain', 'status', 'stale', 'limit']);
        }
    }

    private function assertSummary(array &$checks, array $payload): void
    {
        $this->requireKeys($checks, 'summary', $payload, ['generated_at', 'filters', 'domains', 'totals', 'stale', 'throughput', 'failures', 'quarantines']);
        foreach (['filters', 'domains', 'totals', 'stale', 'throughput', 'failures', 'quarantines'] as $key) {
            $this->assertType($checks, 'summary.'.$key, $payload[$key] ?? null, 'object');
        }
    }

    private function assertQueueHealth(array &$checks, array $payload): void
    {
        $this->requireKeys($checks, 'queue-health', $payload, ['generated_at', 'filters', 'domains', 'queue']);
        foreach (['filters', 'domains', 'queue'] as $key) {
            $this->assertType($checks, 'queue-health.'.$key, $payload[$key] ?? null, 'object');
        }
        if (is_array($payload['queue'] ?? null)) {
            $this->requireKeys($checks, 'queue-health.queue', $payload['queue'], ['connection']);
        }
    }

    private function assertLifecycleLog(array &$checks, array $payload): void
    {
        $this->requireKeys($checks, 'lifecycle-log', $payload, ['generated_at', 'filters', 'events']);
        $this->assertType($checks, 'lifecycle-log.filters', $payload['filters'] ?? null, 'object');
        $this->assertType($checks, 'lifecycle-log.events', $payload['events'] ?? null, 'list');
        if (is_array($payload['events'] ?? null) && isset($payload['events'][0]) && is_array($payload['events'][0])) {
            $this->requireKeys($checks, 'lifecycle-log.events.*', $payload['events'][0], ['logged_at', 'event', 'domain', 'attachment_id', 'status']);
        }
    }

    private function assertLogsPrune(array &$checks, array $payload): void
    {
        $this->requireKeys($checks, 'logs-prune', $payload, ['generated_at', 'dry_run', 'retention_days', 'candidates', 'deleted', 'skipped']);
        $this->assertType($checks, 'logs-prune.dry_run', $payload['dry_run'] ?? null, 'bool');
        $this->assertType($checks, 'logs-prune.retention_days', $payload['retention_days'] ?? null, 'int');
        foreach (['candidates', 'deleted', 'skipped'] as $key) {
            $this->assertType($checks, 'logs-prune.'.$key, $payload[$key] ?? null, 'list');
        }
    }

    private function assertExportTerminal(array &$checks, array $payload): void
    {
        $this->requireKeys($checks, 'export-terminal', $payload, ['generated_at', 'filters', 'redaction', 'rows']);
        $this->assertType($checks, 'export-terminal.filters', $payload['filters'] ?? null, 'object');
        $this->assertType($checks, 'export-terminal.redaction', $payload['redaction'] ?? null, 'object');
        $this->assertType($checks, 'export-terminal.rows', $payload['rows'] ?? null, 'list');
        if (is_array($payload['redaction'] ?? null)) {
            $this->requireKeys($checks, 'export-terminal.redaction', $payload['redaction'], ['paths_included', 'public_urls_included']);
        }
        if (is_array($payload['rows'] ?? null) && isset($payload['rows'][0]) && is_array($payload['rows'][0])) {
            $this->requireKeys($checks, 'export-terminal.rows.*', $payload['rows'][0], ['domain', 'attachment_id', 'status', 'attachment_type', 'original_filename', 'mime_type', 'size', 'failed_reason', 'quarantine_reason', 'processed_at', 'created_at', 'updated_at', 'retry_attempts']);
        }
    }

    private function assertVerifyOperatorCommands(array &$checks, array $payload): void
    {
        $this->requireKeys($checks, 'verify-operator-commands', $payload, ['generated_at', 'passed', 'failed', 'cleanup', 'checks']);
        $this->assertType($checks, 'verify-operator-commands.passed', $payload['passed'] ?? null, 'bool');
        $this->assertType($checks, 'verify-operator-commands.failed', $payload['failed'] ?? null, 'int');
        $this->assertType($checks, 'verify-operator-commands.cleanup', $payload['cleanup'] ?? null, 'object');
        $this->assertType($checks, 'verify-operator-commands.checks', $payload['checks'] ?? null, 'list');
    }

    private function requireKeys(array &$checks, string $name, array $payload, array $keys): void
    {
        $missing = array_values(array_filter($keys, fn (string $key): bool => ! array_key_exists($key, $payload)));
        $checks[] = ['name' => $name.'.required_keys', 'passed' => $missing === [], 'detail' => $missing === [] ? 'required keys present' : 'missing: '.implode(', ', $missing)];
    }

    private function assertType(array &$checks, string $name, mixed $value, string $type): void
    {
        $passed = match ($type) {
            'object' => is_array($value) && ! array_is_list($value),
            'list' => is_array($value) && array_is_list($value),
            'string' => is_string($value),
            'int' => is_int($value),
            'bool' => is_bool($value),
            default => false,
        };
        $checks[] = ['name' => $name.'.type', 'passed' => $passed, 'detail' => 'expected '.$type.', got '.$this->typeName($value)];
    }

    private function assertNoRawFileContents(array &$checks, string $contract, mixed $payload): void
    {
        $bad = [];
        foreach ($this->flattenStrings($payload) as $path => $value) {
            if (strlen($value) > 8192 || str_contains($value, chr(10)."[") || str_contains($value, 'attachment.lifecycle.')) {
                $bad[] = $path;
            }
        }
        $checks[] = ['name' => $contract.'.no_raw_file_contents', 'passed' => $bad === [], 'detail' => $bad === [] ? 'no raw file-like payloads detected' : 'suspicious strings: '.implode(', ', $bad)];
    }

    private function assertNoUnexpectedAbsolutePaths(array &$checks, string $contract, mixed $payload, array $allowedKeys): void
    {
        $bad = [];
        foreach ($this->flattenStrings($payload) as $path => $value) {
            if (! $this->looksLikeAbsolutePath($value)) {
                continue;
            }
            $leaf = basename(str_replace('.', '/', $path));
            if (! in_array($leaf, $allowedKeys, true)) {
                $bad[] = $path;
            }
        }
        $checks[] = ['name' => $contract.'.no_unexpected_absolute_paths', 'passed' => $bad === [], 'detail' => $bad === [] ? 'no unexpected absolute paths detected' : 'unexpected paths: '.implode(', ', $bad)];
    }

    private function allowedPathKeys(string $contract): array
    {
        return match ($contract) {
            'logs-prune', 'verify-operator-commands' => ['path', 'log_directory', 'detail', 'temp_directory'],
            default => [],
        };
    }

    private function flattenStrings(mixed $value, string $prefix = 'root'): array
    {
        if (is_string($value)) {
            return [$prefix => $value];
        }
        if (! is_array($value)) {
            return [];
        }
        $strings = [];
        foreach ($value as $key => $item) {
            $strings += $this->flattenStrings($item, $prefix.'.'.(string) $key);
        }
        return $strings;
    }

    private function looksLikeAbsolutePath(string $value): bool
    {
        return str_starts_with($value, chr(47))
            || (strlen($value) > 2 && ctype_alpha($value[0]) && $value[1] === chr(58) && in_array($value[2], [chr(92), chr(47)], true));
    }

    private function typeName(mixed $value): string
    {
        return is_array($value) ? (array_is_list($value) ? 'list' : 'object') : get_debug_type($value);
    }
}
