# Glitter Project Hub

Glitter Project Hub is an independent collaborative infrastructure hub for project and community platforms. It provides a JSON layout based starting point for spaces, member pages, search, authentication, policies, and community hub pages.

## Key Features

- Standalone interface ID: `glitter-project_hub`
- Frontend IIFE global: `GlitterProjectHub`
- API-first layout definitions with `routes.json`, `components.json`, and JSON layouts
- DynamicRenderer-compatible component bundle
- Responsive user layouts for desktop and mobile
- Permissions-aware rendering for guest, member, and protected flows
- Korean and English i18n support

## Requirements

- Host runtime compatible with the version declared in `template.json`
- Bundled module dependencies declared in `template.json`
- Node dependencies from this package for rebuilding frontend assets
- PHP CLI executed with `/usr/local/bin/php83`

## Installation and Lifecycle

Run lifecycle commands from the project root:

```bash
/usr/local/bin/php83 artisan template:update glitter-project_hub
/usr/local/bin/php83 artisan template:activate glitter-project_hub
```

Bundled source changes must be made in `templates/_bundled/glitter-project_hub` and applied through the lifecycle commands.

## Build

Run frontend verification from the bundled source directory:

```bash
npm install
npm run build
npm run type-check
npm run test:run
```

The build emits static assets under `dist/`, including `dist/js/components.iife.js` and `dist/css/components.css`.

## Layout Structure

- `template.json`: interface identity, assets, dependencies, and metadata
- `routes.json`: route-to-layout mapping
- `components.json`: component registry metadata
- `layouts/`: API-first JSON layout definitions
- `lang/`: Korean and English translation entry points and partials
- `src/`: React components, handlers, types, and styles

## i18n

Visible layout text should use translation keys. Korean and English strings are provided through `lang/ko.json`, `lang/en.json`, and their partial files.

## License

MIT
