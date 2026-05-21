<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CheckBundledLayoutI18nParityCommand extends Command
{
    protected $signature = 'layout:i18n-parity
                            {--json : Output machine-readable JSON}';

    protected $description = 'Check bundled layout $t: references against bundled frontend language files.';

    /** @var array<int, string> */
    private array $locales = ['ko', 'en'];

    /** @var array<string, array<string, mixed>> */
    private array $templateTranslations = [];

    /** @var array<string, array<string, mixed>> */
    private array $extensionTranslations = [];

    public function handle(): int
    {
        $this->loadTranslations();

        $layoutFiles = $this->layoutFiles();
        $missing = [];
        $dynamicPrefixes = [];
        $references = 0;

        foreach ($layoutFiles as $file) {
            $decoded = json_decode((string) file_get_contents($file), true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $missing[] = [
                    'file' => $this->relativePath($file),
                    'path' => '$',
                    'locale' => '*',
                    'key' => '<invalid-json>',
                    'reason' => json_last_error_msg(),
                ];
                continue;
            }

            foreach ($this->extractTranslationRefs($decoded) as $ref) {
                $references++;
                $relative = $this->relativePath($file);

                if ($ref['dynamic']) {
                    $dynamicPrefixes[] = [
                        'file' => $relative,
                        'path' => $ref['path'],
                        'key' => $ref['key'],
                    ];
                    continue;
                }

                foreach ($this->locales as $locale) {
                    $dictionary = $this->dictionaryForLayout($file, $locale);
                    if (! $this->hasTranslationKey($dictionary, $ref['key'])) {
                        $missing[] = [
                            'file' => $relative,
                            'path' => $ref['path'],
                            'locale' => $locale,
                            'key' => $ref['key'],
                            'reason' => 'missing',
                        ];
                    }
                }
            }
        }

        $result = [
            'layout_files' => count($layoutFiles),
            'references' => $references,
            'missing_count' => count($missing),
            'dynamic_prefix_count' => count($dynamicPrefixes),
            'missing' => $missing,
            'dynamic_prefixes' => $dynamicPrefixes,
        ];

        if ($this->option('json')) {
            $this->line(json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        } else {
            $this->components->info("Bundled layout i18n parity: {$result['layout_files']} files, {$references} references");
            $this->components->info("Dynamic prefixes: {$result['dynamic_prefix_count']}");

            if ($missing !== []) {
                $this->components->error("Missing concrete translation keys: {$result['missing_count']}");
                foreach (array_slice($missing, 0, 80) as $item) {
                    $this->line("- {$item['file']} {$item['path']} [{$item['locale']}]: {$item['key']} ({$item['reason']})");
                }
                if (count($missing) > 80) {
                    $this->line('- ... '.(count($missing) - 80).' more');
                }
            } else {
                $this->components->info('Missing concrete translation keys: 0');
            }
        }

        return $missing === [] ? self::SUCCESS : self::FAILURE;
    }

    private function loadTranslations(): void
    {
        foreach ($this->locales as $locale) {
            $this->templateTranslations[$locale] = [];
            foreach ($this->bundledExtensionDirs('templates') as $identifier => $dir) {
                $this->templateTranslations[$locale][$identifier] = $this->loadLanguageFile("{$dir}/lang/{$locale}.json");
            }

            $wrapped = [];
            foreach ($this->bundledExtensionDirs('modules') as $identifier => $dir) {
                $data = $this->loadLanguageFile("{$dir}/resources/lang/{$locale}.json");
                if ($data !== []) {
                    $wrapped[$identifier] = $data;
                }
            }
            foreach ($this->bundledExtensionDirs('plugins') as $identifier => $dir) {
                $data = $this->loadLanguageFile("{$dir}/resources/lang/{$locale}.json");
                if ($data !== []) {
                    $wrapped[$identifier] = $data;
                }
            }
            $this->extensionTranslations[$locale] = $wrapped;
        }
    }

    /** @return array<string, string> */
    private function bundledExtensionDirs(string $type): array
    {
        $root = base_path("{$type}/_bundled");
        if (! is_dir($root)) {
            return [];
        }

        $dirs = [];
        foreach (scandir($root) ?: [] as $entry) {
            if ($entry === '.' || $entry === '..') {
                continue;
            }
            $path = $root.DIRECTORY_SEPARATOR.$entry;
            if (is_dir($path)) {
                $dirs[$entry] = $path;
            }
        }
        ksort($dirs);

        return $dirs;
    }

    /** @return array<int, string> */
    private function layoutFiles(): array
    {
        $roots = [
            base_path('templates/_bundled'),
            base_path('modules/_bundled'),
            base_path('plugins/_bundled'),
        ];
        $files = [];

        foreach ($roots as $root) {
            if (! is_dir($root)) {
                continue;
            }

            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($root, \FilesystemIterator::SKIP_DOTS)
            );

            foreach ($iterator as $file) {
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

    /** @return array<int, array{path: string, key: string, dynamic: bool}> */
    private function extractTranslationRefs(mixed $value, string $path = '$'): array
    {
        if (is_string($value)) {
            return $this->extractFromString($value, $path);
        }

        if (! is_array($value)) {
            return [];
        }

        $refs = [];
        foreach ($value as $key => $child) {
            $childPath = is_int($key) ? "{$path}[{$key}]" : $path.'.'.$key;
            array_push($refs, ...$this->extractTranslationRefs($child, $childPath));
        }

        return $refs;
    }

    /** @return array<int, array{path: string, key: string, dynamic: bool}> */
    private function extractFromString(string $value, string $path): array
    {
        $refs = [];
        preg_match_all('/\$t:(?:defer:)?([a-zA-Z0-9._-]+)(\|(?:(?!\$t:).)+)?/', $value, $matches, PREG_OFFSET_CAPTURE);

        foreach ($matches[0] as $index => $match) {
            $token = $match[0];
            $offset = $match[1];
            $key = $matches[1][$index][0];
            $tail = substr($value, $offset + strlen($token), 2);
            $refs[] = [
                'path' => $path,
                'key' => $key,
                'dynamic' => str_ends_with($key, '.') || $tail === '{{',
            ];
        }

        return $refs;
    }

    /** @return array<string, mixed> */
    private function dictionaryForLayout(string $layoutFile, string $locale): array
    {
        $relative = $this->relativePath($layoutFile);
        $extensions = $this->extensionTranslations[$locale] ?? [];

        if (preg_match('#^templates/_bundled/([^/]+)/#', $relative, $matches)) {
            $template = $this->templateTranslations[$locale][$matches[1]] ?? [];

            return array_merge($template, $extensions);
        }

        $templateUnion = [];
        foreach ($this->templateTranslations[$locale] ?? [] as $templateData) {
            $templateUnion = $this->mergeRecursive($templateUnion, $templateData);
        }

        return array_merge($templateUnion, $extensions);
    }

    /** @return array<string, mixed> */
    private function loadLanguageFile(string $path): array
    {
        if (! is_file($path)) {
            return [];
        }

        $decoded = json_decode((string) file_get_contents($path), true);
        if (! is_array($decoded)) {
            return [];
        }

        return $this->resolveLanguageFragments($decoded, dirname($path));
    }

    /** @return array<string, mixed> */
    private function resolveLanguageFragments(array $data, string $basePath): array
    {
        $resolved = [];
        foreach ($data as $key => $value) {
            if (is_array($value) && isset($value['$partial']) && is_string($value['$partial'])) {
                $fragmentPath = $basePath.DIRECTORY_SEPARATOR.str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $value['$partial']);
                $fragment = json_decode((string) @file_get_contents($fragmentPath), true);
                $resolved[$key] = is_array($fragment)
                    ? $this->resolveLanguageFragments($fragment, dirname($fragmentPath))
                    : [];
                continue;
            }

            $resolved[$key] = is_array($value)
                ? $this->resolveLanguageFragments($value, $basePath)
                : $value;
        }

        return $resolved;
    }

    private function hasTranslationKey(array $dictionary, string $key): bool
    {
        $current = $dictionary;
        foreach (explode('.', $key) as $segment) {
            if (! is_array($current) || ! array_key_exists($segment, $current)) {
                return false;
            }
            $current = $current[$segment];
        }

        return is_string($current);
    }

    /** @return array<string, mixed> */
    private function mergeRecursive(array $base, array $override): array
    {
        foreach ($override as $key => $value) {
            if (isset($base[$key]) && is_array($base[$key]) && is_array($value)) {
                $base[$key] = $this->mergeRecursive($base[$key], $value);
            } else {
                $base[$key] = $value;
            }
        }

        return $base;
    }

    private function relativePath(string $path): string
    {
        $base = base_path().DIRECTORY_SEPARATOR;

        return str_starts_with($path, $base) ? substr($path, strlen($base)) : $path;
    }
}
