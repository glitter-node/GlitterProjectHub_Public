<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CheckBundledLayoutActionDataParityCommand extends Command
{
    protected $signature = 'layout:action-data-parity
                            {--json : Output machine-readable JSON}';

    protected $description = 'Check bundled layout action and data_source shapes against runtime contracts.';

    /** @var array<int, string> */
    private array $builtinHandlers = [
        'navigate',
        'navigateBack',
        'navigateForward',
        'openWindow',
        'replaceUrl',
        'apiCall',
        'login',
        'logout',
        'setState',
        'setError',
        'openModal',
        'closeModal',
        'showAlert',
        'toast',
        'switch',
        'conditions',
        'sequence',
        'parallel',
        'showErrorPage',
        'loadScript',
        'callExternal',
        'callExternalEmbed',
        'saveToLocalStorage',
        'loadFromLocalStorage',
        'scrollIntoView',
        'ensureIdentityVerified',
        'resolveIdentityChallenge',
        'startInterval',
        'stopInterval',
        'refetchDataSource',
        'appendDataSource',
        'updateDataSource',
        'reloadExtensions',
        'reloadRoutes',
        'refresh',
        'remount',
        'reloadTranslations',
        'reloadModuleHandlers',
        'reloadPluginHandlers',
        'emitEvent',
        'updateProductField',
        'updateOptionField',
        'setLocale',
        'suppress',
    ];

    /** @var array<int, string> */
    private array $dataSourceTypes = ['api', 'static', 'route_params', 'query_params', 'websocket'];

    /** @var array<int, string> */
    private array $httpMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

    /** @var array<int, string> */
    private array $authModes = ['required', 'optional', 'none'];

    /** @var array<int, string> */
    private array $loadingStrategies = ['blocking', 'progressive', 'background'];

    /** @var array<int, string> */
    private array $channelTypes = ['public', 'private', 'presence'];

    /** @var array<int, string> */
    private array $knownDataSourceFields = [
        'id',
        'type',
        'endpoint',
        'method',
        'auto_fetch',
        'auth_required',
        'auth_mode',
        'loading_strategy',
        'contentType',
        'params',
        'data',
        'initLocal',
        'initGlobal',
        'initIsolated',
        'refetchOnMount',
        'headers',
        'if',
        'conditions',
        'channel',
        'event',
        'channel_type',
        'target_source',
        'onReceive',
        'fallback',
        'errorHandling',
        'errorCondition',
        'onError',
        'onSuccess',
        'depends_on',
    ];

    public function handle(): int
    {
        $files = $this->layoutFiles();
        $customHandlers = $this->discoverCustomHandlers();
        $issues = [];
        $handlerCounts = [];
        $dataSourceFieldCounts = [];
        $actionCount = 0;
        $dataSourceCount = 0;

        foreach ($files as $file) {
            $decoded = json_decode((string) file_get_contents($file), true);
            $relative = $this->relativePath($file);

            if (json_last_error() !== JSON_ERROR_NONE || ! is_array($decoded)) {
                $issues[] = $this->issue('error', $relative, '$', 'invalid_json', json_last_error_msg());
                continue;
            }

            $modalIds = $this->collectModalIds($decoded);
            $dataSourceIds = $this->collectDataSourceIds($decoded);

            foreach ($this->collectDataSources($decoded) as $sourceInfo) {
                $dataSourceCount++;
                $source = $sourceInfo['value'];
                $path = $sourceInfo['path'];
                if (! is_array($source)) {
                    $issues[] = $this->issue('error', $relative, $path, 'data_source_shape', 'data_source must be an object.');
                    continue;
                }

                foreach (array_keys($source) as $field) {
                    $dataSourceFieldCounts[$field] = ($dataSourceFieldCounts[$field] ?? 0) + 1;
                }

                $issues = array_merge($issues, $this->validateDataSource($source, $relative, $path, $dataSourceIds));
            }

            foreach ($this->collectActions($decoded) as $actionInfo) {
                $actionCount++;
                $action = $actionInfo['value'];
                $path = $actionInfo['path'];

                if (! is_array($action)) {
                    $issues[] = $this->issue('error', $relative, $path, 'action_shape', 'Action must be an object.');
                    continue;
                }

                $handler = $action['handler'] ?? null;
                if (is_string($handler)) {
                    $handlerCounts[$handler] = ($handlerCounts[$handler] ?? 0) + 1;
                }

                $issues = array_merge(
                    $issues,
                    $this->validateAction($action, $relative, $path, $modalIds, $dataSourceIds, $customHandlers)
                );
            }
        }

        ksort($handlerCounts);
        ksort($dataSourceFieldCounts);
        $errors = array_values(array_filter($issues, fn (array $issue): bool => $issue['severity'] === 'error'));
        $warnings = array_values(array_filter($issues, fn (array $issue): bool => $issue['severity'] === 'warning'));
        $infos = array_values(array_filter($issues, fn (array $issue): bool => $issue['severity'] === 'info'));

        $result = [
            'layout_files' => count($files),
            'actions' => $actionCount,
            'data_sources' => $dataSourceCount,
            'handlers' => $handlerCounts,
            'data_source_fields' => $dataSourceFieldCounts,
            'custom_handlers' => $customHandlers,
            'error_count' => count($errors),
            'warning_count' => count($warnings),
            'info_count' => count($infos),
            'issues' => $issues,
        ];

        if ($this->option('json')) {
            $this->line(json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        } else {
            $this->components->info("Bundled layout action/data parity: {$result['layout_files']} files, {$actionCount} actions, {$dataSourceCount} data_sources.");
            $this->components->info("Errors: {$result['error_count']}, warnings: {$result['warning_count']}, info: {$result['info_count']}");
            foreach (array_slice($issues, 0, 100) as $issue) {
                $this->line("- [{$issue['severity']}] {$issue['file']} {$issue['path']} {$issue['type']}: {$issue['message']}");
            }
            if (count($issues) > 100) {
                $this->line('- ... '.(count($issues) - 100).' more');
            }
        }

        return $errors === [] ? self::SUCCESS : self::FAILURE;
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

    /** @return array<int, array{path: string, value: mixed}> */
    private function collectActions(mixed $value, string $path = '$'): array
    {
        if (! is_array($value)) {
            return [];
        }

        $actions = [];
        if ($this->looksLikeAction($value)) {
            $actions[] = ['path' => $path, 'value' => $value];
        }

        foreach ($value as $key => $child) {
            $childPath = is_int($key) ? "{$path}[{$key}]" : "{$path}.{$key}";
            array_push($actions, ...$this->collectActions($child, $childPath));
        }

        return $actions;
    }

    private function looksLikeAction(array $value): bool
    {
        return isset($value['handler']) || isset($value['actionRef']);
    }

    /** @return array<int, array{path: string, value: mixed}> */
    private function collectDataSources(mixed $value, string $path = '$'): array
    {
        if (! is_array($value)) {
            return [];
        }

        $sources = [];
        foreach ($value as $key => $child) {
            $childPath = is_int($key) ? "{$path}[{$key}]" : "{$path}.{$key}";
            if ($key === "data_sources" && is_array($child) && $this->looksLikeDataSourceList($child)) {
                foreach ($child as $index => $source) {
                    $sources[] = ['path' => "{$childPath}[{$index}]", 'value' => $source];
                }
            }
            array_push($sources, ...$this->collectDataSources($child, $childPath));
        }

        return $sources;
    }

    /** @return array<int, string> */
    private function collectDataSourceIds(array $layout): array
    {
        $ids = [];
        foreach ($this->collectDataSources($layout) as $sourceInfo) {
            $source = $sourceInfo['value'];
            if (is_array($source) && isset($source['id']) && is_string($source['id'])) {
                $ids[] = $source['id'];
            }
        }

        return $ids;
    }

    /** @return array<int, string> */
    private function collectModalIds(array $layout): array
    {
        $ids = [];
        $modals = $layout['modals'] ?? [];
        if (is_array($modals)) {
            foreach ($modals as $modal) {
                if (is_array($modal) && isset($modal['id']) && is_string($modal['id'])) {
                    $ids[] = $modal['id'];
                }
            }
        }

        return array_values(array_unique($ids));
    }



    private function looksLikeDataSourceList(array $items): bool
    {
        if ($items === []) {
            return true;
        }

        foreach ($items as $item) {
            if (! is_array($item)) {
                return false;
            }
            if (! array_key_exists("id", $item) && ! array_key_exists("endpoint", $item) && ! array_key_exists("type", $item)) {
                return false;
            }
        }

        return true;
    }

    /** @return array<int, array<string, string>> */
    private function validateAction(array $action, string $file, string $path, array $modalIds, array $dataSourceIds, array $customHandlers): array
    {
        $issues = [];

        if (isset($action['actionRef'])) {
            if (! is_string($action['actionRef']) || $action['actionRef'] === '') {
                $issues[] = $this->issue('error', $file, $path.'.actionRef', 'action_ref_shape', 'actionRef must be a non-empty string.');
            }
            if (! isset($action['handler'])) {
                return $issues;
            }
        }

        $handler = $action['handler'] ?? null;
        if (! is_string($handler) || $handler === '') {
            $issues[] = $this->issue('error', $file, $path, 'action_handler_missing', 'Action handler must be a non-empty string.');

            return $issues;
        }

        if (! in_array($handler, $this->builtinHandlers, true) && ! in_array($handler, $customHandlers, true)) {
            if (str_contains($handler, '{{')) {
                $issues[] = $this->issue('info', $file, $path.'.handler', 'dynamic_handler', "Dynamic handler cannot be proven statically: {$handler}");
            } else {
                $issues[] = $this->issue('error', $file, $path.'.handler', 'unknown_handler', "No runtime built-in or bundled custom handler named {$handler} was found.");
            }
        }

        if (isset($action['auth_required'])) {
            $issues[] = $this->issue('warning', $file, $path.'.auth_required', 'deprecated_field', 'auth_required is runtime-supported for apiCall but auth_mode is preferred.');
        }

        if (isset($action['auth_mode']) && ! in_array($action['auth_mode'], $this->authModes, true)) {
            $issues[] = $this->issue('error', $file, $path.'.auth_mode', 'invalid_auth_mode', 'auth_mode must be one of required, optional, none.');
        }

        if (isset($action['onSuccess'])) {
            $issues = array_merge($issues, $this->validateActionContainer($action['onSuccess'], $file, $path.'.onSuccess', $modalIds, $dataSourceIds, $customHandlers));
        }
        if (isset($action['onError'])) {
            $issues = array_merge($issues, $this->validateActionContainer($action['onError'], $file, $path.'.onError', $modalIds, $dataSourceIds, $customHandlers));
        }
        if (isset($action['errorHandling']) && is_array($action['errorHandling'])) {
            foreach ($action['errorHandling'] as $code => $handlerAction) {
                $issues = array_merge($issues, $this->validateActionContainer($handlerAction, $file, "{$path}.errorHandling.{$code}", $modalIds, $dataSourceIds, $customHandlers));
            }
        }

        $nestedActions = $action["actions"] ?? $action["params"]["actions"] ?? null;
        if (($handler === "sequence" || $handler === "parallel") && (! is_array($nestedActions) || $nestedActions === [])) {
            $issues[] = $this->issue('error', $file, $path.'.actions', 'required_action_params', "{$handler} requires an actions array.");
        }

        if ($handler === 'switch' && (! isset($action['cases']) || ! is_array($action['cases']))) {
            $issues[] = $this->issue('error', $file, $path.'.cases', 'required_action_params', 'switch requires a cases object.');
        }

        if ($handler === 'conditions' && (! isset($action['conditions']) || ! is_array($action['conditions']))) {
            $issues[] = $this->issue('error', $file, $path.'.conditions', 'required_action_params', 'conditions requires a conditions array.');
        }

        if ($handler === 'apiCall') {
            $target = $action['target'] ?? null;
            if (! is_string($target) || $target === '') {
                $issues[] = $this->issue('error', $file, $path.'.target', 'required_action_params', 'apiCall requires target because ActionDispatcher passes target to handleApiCall.');
            } elseif ($this->looksMalformedEndpoint($target)) {
                $issues[] = $this->issue('error', $file, $path.'.target', 'malformed_endpoint', "apiCall target looks malformed: {$target}");
            } elseif ($this->isDynamic($target)) {
                $issues[] = $this->issue('info', $file, $path.'.target', 'dynamic_endpoint', "Dynamic apiCall target cannot be proven statically: {$target}");
            }

            $method = $action['params']['method'] ?? 'GET';
            if (is_string($method) && $this->isDynamic($method)) {
                $issues[] = $this->issue("info", $file, $path.".params.method", "dynamic_http_method", "Dynamic apiCall method cannot be proven statically: {$method}");
            } elseif (is_string($method) && ! in_array(strtoupper($method), array_merge($this->httpMethods, ["HEAD"]), true)) {
                $issues[] = $this->issue('error', $file, $path.'.params.method', 'invalid_http_method', "Unsupported apiCall method: {$method}");
            }
        }

        if ($handler === 'navigate') {
            $target = $action['params']['path'] ?? $action['target'] ?? null;
            if (! is_string($target) || $target === '') {
                $issues[] = $this->issue('error', $file, $path, 'required_action_params', 'navigate requires params.path or target.');
            } elseif ($this->looksMalformedPath($target)) {
                $issues[] = $this->issue('warning', $file, $path, 'malformed_path', "navigate path looks malformed: {$target}");
            } elseif ($this->isDynamic($target)) {
                $issues[] = $this->issue('info', $file, $path, 'dynamic_path', "Dynamic navigate path cannot be proven statically: {$target}");
            }
        }

        if ($handler === 'openModal') {
            $target = $action['target'] ?? null;
            if (! is_string($target) || $target === '') {
                $issues[] = $this->issue('error', $file, $path.'.target', 'required_action_params', 'openModal requires target; params.id is not used by ActionDispatcher.');
            } elseif ($this->isDynamic($target)) {
                $issues[] = $this->issue('info', $file, $path.'.target', 'dynamic_modal_ref', "Dynamic modal target cannot be proven statically: {$target}");
            } elseif ($modalIds !== [] && ! in_array($target, $modalIds, true)) {
                $issues[] = $this->issue('warning', $file, $path.'.target', 'missing_modal_ref', "Modal target {$target} is not declared in this file's top-level modals array; it may be supplied by inheritance or a partial.");
            }
        }

        foreach (['refetchDataSource', 'appendDataSource', 'updateDataSource'] as $dataHandler) {
            if ($handler === $dataHandler) {
                $dataSourceId = $action['params']['dataSourceId'] ?? null;
                if (! is_string($dataSourceId) || $dataSourceId === '') {
                    $issues[] = $this->issue('error', $file, $path.'.params.dataSourceId', 'required_action_params', "{$dataHandler} requires params.dataSourceId.");
                } elseif ($this->isDynamic($dataSourceId)) {
                    $issues[] = $this->issue('info', $file, $path.'.params.dataSourceId', 'dynamic_data_source_ref', "Dynamic dataSourceId cannot be proven statically: {$dataSourceId}");
                } elseif ($dataSourceIds !== [] && ! in_array($dataSourceId, $dataSourceIds, true)) {
                    $issues[] = $this->issue('warning', $file, $path.'.params.dataSourceId', 'missing_data_source_ref', "Data source {$dataSourceId} is not declared in this file; it may be supplied by an inherited base layout.");
                }
            }
        }

        return $issues;
    }

    /** @return array<int, array<string, string>> */
    private function validateActionContainer(mixed $value, string $file, string $path, array $modalIds, array $dataSourceIds, array $customHandlers): array
    {
        if (is_array($value) && $this->isList($value)) {
            $issues = [];
            foreach ($value as $index => $action) {
                if (! is_array($action)) {
                    $issues[] = $this->issue('error', $file, "{$path}[{$index}]", 'action_shape', 'Nested action must be an object.');
                    continue;
                }
                $issues = array_merge($issues, $this->validateAction($action, $file, "{$path}[{$index}]", $modalIds, $dataSourceIds, $customHandlers));
            }

            return $issues;
        }

        if (is_array($value)) {
            return $this->validateAction($value, $file, $path, $modalIds, $dataSourceIds, $customHandlers);
        }

        return [$this->issue('error', $file, $path, 'action_shape', 'Nested action container must be an action object or action array.')];
    }

    /** @return array<int, array<string, string>> */
    private function validateDataSource(array $source, string $file, string $path, array $dataSourceIds): array
    {
        $issues = [];

        foreach (array_keys($source) as $field) {
            if (! in_array($field, $this->knownDataSourceFields, true)) {
                $issues[] = $this->issue('warning', $file, "{$path}.{$field}", 'unknown_data_source_field', "Field {$field} is not in DataSourceManager's documented DataSource interface.");
            }
        }

        if (! isset($source['id']) || ! is_string($source['id']) || $source['id'] === '') {
            $issues[] = $this->issue('error', $file, $path.'.id', 'data_source_id_missing', 'data_source id must be a non-empty string.');
        }

        if (isset($source['id']) && is_string($source['id']) && count(array_keys($dataSourceIds, $source['id'], true)) > 1) {
            $issues[] = $this->issue('warning', $file, $path.'.id', 'duplicate_data_source_id', "Duplicate data_source id {$source['id']} appears in this layout payload. Runtime condition filtering may intentionally choose the first matching source.");
        }

        $type = $source['type'] ?? 'api';
        if (! is_string($type) || ! in_array($type, $this->dataSourceTypes, true)) {
            $issues[] = $this->issue('error', $file, $path.'.type', 'invalid_data_source_type', 'data_source type must be one of api, static, route_params, query_params, websocket.');
        }

        if (isset($source['auth_required'])) {
            $issues[] = $this->issue('warning', $file, $path.'.auth_required', 'deprecated_field', 'auth_required is runtime-supported but auth_mode is preferred.');
        }

        if (isset($source['depends_on'])) {
            $issues[] = $this->issue('warning', $file, $path.'.depends_on', 'unsupported_or_ignored_field', 'depends_on appears in bundled layouts but was not found in DataSourceManager runtime code; it is likely ignored.');
            if (is_array($source['depends_on'])) {
                foreach ($source['depends_on'] as $index => $dependency) {
                    if (! is_string($dependency) || $dependency === '') {
                        $issues[] = $this->issue('error', $file, "{$path}.depends_on[{$index}]", 'invalid_depends_on', 'depends_on entries must be non-empty strings.');
                    }
                }
            } else {
                $issues[] = $this->issue('error', $file, $path.'.depends_on', 'invalid_depends_on', 'depends_on must be an array when present.');
            }
        }

        if (isset($source['auth_mode']) && ! in_array($source['auth_mode'], $this->authModes, true)) {
            $issues[] = $this->issue('error', $file, $path.'.auth_mode', 'invalid_auth_mode', 'auth_mode must be one of required, optional, none.');
        }

        if (isset($source['loading_strategy']) && ! in_array($source['loading_strategy'], $this->loadingStrategies, true)) {
            $issues[] = $this->issue('error', $file, $path.'.loading_strategy', 'invalid_loading_strategy', 'loading_strategy must be one of blocking, progressive, background.');
        }

        if (isset($source['method']) && (! is_string($source['method']) || ! in_array(strtoupper($source['method']), $this->httpMethods, true))) {
            $issues[] = $this->issue('error', $file, $path.'.method', 'invalid_http_method', 'data_source method must be one of GET, POST, PUT, PATCH, DELETE.');
        }

        if ($type === 'api') {
            if (! isset($source['endpoint']) || ! is_string($source['endpoint']) || $source['endpoint'] === '') {
                $issues[] = $this->issue('error', $file, $path.'.endpoint', 'required_data_source_field', 'api data_source requires endpoint.');
            } elseif ($this->looksMalformedEndpoint($source['endpoint'])) {
                $issues[] = $this->issue('error', $file, $path.'.endpoint', 'malformed_endpoint', "data_source endpoint looks malformed: {$source['endpoint']}");
            } elseif ($this->isDynamic($source['endpoint'])) {
                $issues[] = $this->issue('info', $file, $path.'.endpoint', 'dynamic_endpoint', "Dynamic endpoint cannot be proven statically: {$source['endpoint']}");
            }
        }

        if ($type === 'static' && ! array_key_exists('data', $source)) {
            $issues[] = $this->issue('error', $file, $path.'.data', 'required_data_source_field', 'static data_source requires data.');
        }

        if ($type === 'websocket') {
            foreach (['channel', 'event'] as $field) {
                if (! isset($source[$field]) || ! is_string($source[$field]) || $source[$field] === '') {
                    $issues[] = $this->issue('error', $file, "{$path}.{$field}", 'required_data_source_field', "websocket data_source requires {$field}.");
                } elseif ($this->isDynamic($source[$field])) {
                    $issues[] = $this->issue('info', $file, "{$path}.{$field}", 'dynamic_websocket_ref', "Dynamic websocket {$field} cannot be proven statically: {$source[$field]}");
                }
            }
            if (isset($source['channel_type']) && ! in_array($source['channel_type'], $this->channelTypes, true)) {
                $issues[] = $this->issue('error', $file, $path.'.channel_type', 'invalid_channel_type', 'channel_type must be one of public, private, presence.');
            }
            if (isset($source['target_source']) && is_string($source['target_source']) && ! $this->isDynamic($source['target_source']) && ! in_array($source['target_source'], $dataSourceIds, true)) {
                $issues[] = $this->issue('warning', $file, $path.'.target_source', 'missing_data_source_ref', "target_source {$source['target_source']} is not declared in this file.");
            }
        }

        foreach (['onSuccess', 'onError', 'onReceive'] as $field) {
            if (isset($source[$field])) {
                $issues = array_merge($issues, $this->validateActionContainer($source[$field], $file, "{$path}.{$field}", [], $dataSourceIds, $this->discoverCustomHandlers()));
            }
        }

        return $issues;
    }

    /** @return array<int, string> */
    private function discoverCustomHandlers(): array
    {
        $handlers = [];
        $roots = [
            base_path('templates/_bundled'),
            base_path('modules/_bundled'),
            base_path('plugins/_bundled'),
        ];

        foreach ($roots as $root) {
            if (! is_dir($root)) {
                continue;
            }

            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($root, \FilesystemIterator::SKIP_DOTS)
            );

            foreach ($iterator as $file) {
                $path = $file->getPathname();
                if (! in_array($file->getExtension(), ['ts', 'tsx', 'js'], true)) {
                    continue;
                }
                if (str_contains($path, DIRECTORY_SEPARATOR.'node_modules'.DIRECTORY_SEPARATOR)
                    || str_contains($path, DIRECTORY_SEPARATOR.'dist'.DIRECTORY_SEPARATOR)
                    || str_contains($path, DIRECTORY_SEPARATOR.'__tests__'.DIRECTORY_SEPARATOR)) {
                    continue;
                }
                if (! str_contains($path, DIRECTORY_SEPARATOR.'handlers'.DIRECTORY_SEPARATOR.'index.')) {
                    continue;
                }

                $content = (string) file_get_contents($path);
                if (! str_contains($content, 'handlerMap') && ! str_contains($content, 'handlers')) {
                    continue;
                }

                if (preg_match_all('/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:\s*[A-Za-z_][A-Za-z0-9_]*/m', $content, $matches)) {
                    foreach ($matches[1] as $name) {
                        $handlers[] = $this->customHandlerNameForPath($path, $name);
                    }
                }
            }
        }

        $handlers = array_values(array_unique(array_filter($handlers)));
        sort($handlers);

        return $handlers;
    }

    private function customHandlerNameForPath(string $path, string $name): string
    {
        $relative = $this->relativePath($path);
        if (preg_match('#^plugins/_bundled/([^/]+)/#', $relative, $matches)) {
            return "{$matches[1]}.{$name}";
        }

        return $name;
    }

    private function looksMalformedEndpoint(string $endpoint): bool
    {
        if ($this->isDynamic($endpoint)) {
            return false;
        }

        return str_contains($endpoint, ' ')
            || preg_match('#^https?://#i', $endpoint) === 1
            || ($endpoint !== '' && ! str_starts_with($endpoint, '/'));
    }

    private function looksMalformedPath(string $path): bool
    {
        if ($this->isDynamic($path)) {
            return false;
        }

        return str_contains($path, ' ') || preg_match('#^https?://#i', $path) === 1;
    }

    private function isDynamic(mixed $value): bool
    {
        return is_string($value) && str_contains($value, '{{');
    }

    private function isList(array $value): bool
    {
        return array_is_list($value);
    }

    /** @return array<string, string> */
    private function issue(string $severity, string $file, string $path, string $type, string $message): array
    {
        return [
            'severity' => $severity,
            'file' => $file,
            'path' => $path,
            'type' => $type,
            'message' => $message,
        ];
    }

    private function relativePath(string $path): string
    {
        $base = base_path().DIRECTORY_SEPARATOR;

        return str_starts_with($path, $base) ? substr($path, strlen($base)) : $path;
    }
}
