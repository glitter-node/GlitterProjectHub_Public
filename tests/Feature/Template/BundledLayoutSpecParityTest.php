<?php

namespace Tests\Feature\Template;

use App\Rules\ValidLayoutStructure;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class BundledLayoutSpecParityTest extends TestCase
{
    public function test_bundled_layout_payloads_are_accepted_by_backend_layout_validator(): void
    {
        $files = $this->bundledLayoutJsonFiles();

        $this->assertNotEmpty($files, 'No bundled layout JSON files were found.');

        $rule = new ValidLayoutStructure;
        $failures = [];
        $validatedPayloads = 0;

        foreach ($files as $file) {
            $relativePath = $this->relativePath($file);
            $decoded = json_decode(File::get($file), true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                $failures[] = "{$relativePath}: invalid JSON - ".json_last_error_msg();
                continue;
            }

            foreach ($this->layoutPayloads($decoded, $relativePath) as $label => $payload) {
                $validatedPayloads++;
                $messages = [];

                $rule->validate('layout', $payload, function ($message) use (&$messages): void {
                    $messages[] = (string) $message;
                });

                if ($messages !== []) {
                    $failures[] = "{$relativePath} [{$label}]: ".implode(' | ', $messages);
                }
            }
        }

        $this->assertGreaterThan(0, $validatedPayloads, 'No bundled layout payloads were discovered.');
        $this->assertSame([], $failures, "Bundled layout validator parity failures:\n".implode("\n", $failures));
    }

    /**
     * @return array<int, string>
     */
    private function bundledLayoutJsonFiles(): array
    {
        $roots = [
            base_path('templates/_bundled'),
            base_path('modules/_bundled'),
            base_path('plugins/_bundled'),
        ];

        $files = [];

        foreach ($roots as $root) {
            if (! File::isDirectory($root)) {
                continue;
            }

            foreach (File::allFiles($root) as $file) {
                $path = $file->getPathname();

                if ($file->getExtension() !== 'json') {
                    continue;
                }

                if (str_contains($path, DIRECTORY_SEPARATOR.'node_modules'.DIRECTORY_SEPARATOR)) {
                    continue;
                }

                if (! str_contains($path, DIRECTORY_SEPARATOR.'layouts'.DIRECTORY_SEPARATOR)
                    && ! str_contains($path, DIRECTORY_SEPARATOR.'extensions'.DIRECTORY_SEPARATOR)) {
                    continue;
                }

                $files[] = $path;
            }
        }

        sort($files);

        return $files;
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private function layoutPayloads(array $decoded, string $relativePath): array
    {
        $payloads = [];

        if (isset($decoded['version'], $decoded['layout_name'])) {
            $payloads['layout'] = $decoded;
        }

        if ($this->isComponentDefinition($decoded)) {
            $payloads['component-root'] = $this->syntheticLayout([$decoded], $relativePath, 'component-root');
        }

        foreach ($this->componentCollections($decoded) as $label => $components) {
            $payloads[$label] = $this->syntheticLayout($components, $relativePath, $label);
        }

        return $payloads;
    }

    /**
     * @return array<string, array<int, array<string, mixed>>>
     */
    private function componentCollections(array $decoded): array
    {
        $collections = [];

        if (isset($decoded['components']) && is_array($decoded['components']) && $this->looksLikeComponentList($decoded['components'])) {
            $collections['components'] = $decoded['components'];
        }

        if (isset($decoded['slots']) && is_array($decoded['slots'])) {
            foreach ($decoded['slots'] as $slotName => $slotComponents) {
                if (is_array($slotComponents) && $this->looksLikeComponentList($slotComponents)) {
                    $collections["slots.{$slotName}"] = $slotComponents;
                }
            }
        }

        if (isset($decoded['modals']) && is_array($decoded['modals'])) {
            foreach ($decoded['modals'] as $index => $modal) {
                if (! is_array($modal)) {
                    continue;
                }

                if (isset($modal['components']) && is_array($modal['components']) && $this->looksLikeComponentList($modal['components'])) {
                    $collections["modals.{$index}.components"] = $modal['components'];
                } elseif ($this->isComponentDefinition($modal)) {
                    $collections["modals.{$index}"] = [$modal];
                }
            }
        }

        if (isset($decoded['injections']) && is_array($decoded['injections'])) {
            foreach ($decoded['injections'] as $index => $injection) {
                if (is_array($injection)
                    && isset($injection['components'])
                    && is_array($injection['components'])
                    && $this->looksLikeComponentList($injection['components'])) {
                    $collections["injections.{$index}.components"] = $injection['components'];
                }
            }
        }

        return $collections;
    }

    private function isComponentDefinition(array $value): bool
    {
        return (isset($value['type']) && is_string($value['type']))
            || (isset($value['partial']) && is_string($value['partial']))
            || (isset($value['$partial']) && is_string($value['$partial']))
            || (isset($value['slot']) && is_string($value['slot']));
    }

    /**
     * @param array<mixed> $components
     */
    private function looksLikeComponentList(array $components): bool
    {
        if ($components === []) {
            return true;
        }

        foreach ($components as $component) {
            if (! is_array($component) || ! $this->isComponentDefinition($component)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param array<int, array<string, mixed>> $components
     * @return array<string, mixed>
     */
    private function syntheticLayout(array $components, string $relativePath, string $label): array
    {
        return [
            'version' => '1.0.0',
            'layout_name' => '__bundled_spec_parity__/'.str_replace(['\\', '/'], '_', $relativePath).'_'.$label,
            'components' => $components,
        ];
    }

    private function relativePath(string $path): string
    {
        $basePath = base_path().DIRECTORY_SEPARATOR;

        return str_starts_with($path, $basePath)
            ? substr($path, strlen($basePath))
            : $path;
    }
}
