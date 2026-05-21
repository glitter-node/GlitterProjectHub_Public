# Changelog

## [0.1.34] - 2026-05-20
- Improved quiet footer link hover and focus affordance with semantic footer tokens while preserving compact footer layout.

## [0.1.33] - 2026-05-20
- Added a dedicated muted-light header logo asset for dark mode and switched raster logo rendering by theme.

All notable changes to this template are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.32] - 2026-05-20

### Changed

- Improved dark-mode header surface hierarchy and logo readability with semantic header and logo visibility tokens.


## [0.1.31] - 2026-05-20

### Changed

- Reduced public footer density and visual dominance with semantic footer classes and quieter footer tokens.


## [0.1.30] - 2026-05-20

### Changed

- Refined activity-flow hierarchy, row focus rhythm, and layered surface continuity for a quieter collaboration stream.


## [0.1.29] - 2026-05-20

### Changed

- Stabilized the accent, card density, activity flow, and footer hierarchy tokens for a quieter collaboration hub interface.


## [0.1.28] - 2026-05-20

### Changed

- Added semantic typography tokens and refined compact activity row hierarchy while preserving the existing surface model.


## [0.1.27] - 2026-05-20

### Changed

- Added a semantic five-level surface token system for the bundled theme and mapped existing template surfaces to the new hierarchy.


## [0.1.26] - 2026-05-19

### Changed

- Added anonymous homepage route-level critical CSS and deferred the full template stylesheet in SEO-rendered homepage output.


## [0.1.25] - 2026-05-19

### Changed

- Reduced anonymous homepage render-blocking template CSS by loading only Font Awesome base and solid icon styles while preserving the restored Font Awesome icon system.


## [0.1.24] - 2026-05-19

### Fixed

- Restored Font Awesome icon rendering and normalized public layout icon names after the Phase 2 local SVG substitution caused generic fallback icons.
- Kept the bundled 320x64 header wordmark asset for public header identity recovery.


## [0.1.23] - 2026-05-19

### Changed

- Replaced the bundled public homepage logo asset with the 320x64 WebP production logo.

### Changed

- Removed the anonymous homepage Font Awesome stylesheet dependency from SEO rendering and replaced template icons with local SVG output.
- Deferred low-priority anonymous homepage board/resource data refreshes until idle time.
- Skipped anonymous homepage auth, notification, and realtime data sources when no auth token is present.
- Replaced the visible logo source with a bundled optimized WebP asset.
- Added a template-scoped realtime pagehide/pageshow lifecycle handler.
- Added explicit intrinsic dimensions to the visible site logo rendering for steadier first paint.
- Condensed the footer legal identity details into one muted metadata line.
- Pointed homepage OpenGraph and Twitter image metadata at the production static OG image.
- Added template head metadata for favicon, Apple touch icon, web manifest, and theme color.
- Kept file uploader image compression on the local bundled import path by disabling runtime CDN worker loading.
- Clarified dark-mode surface hierarchy across the page, hero, homepage panels, and footer without adding gradients or shadows.
- Replaced the compact footer identity text with Glitter legal identity details while preserving the existing footer structure.
- Routed `/page/refund` through the managed static page layout so the published page record is the public source of truth.
- Refined homepage seeded-content signals by hiding repeated editorial prefixes in homepage feeds and prioritizing resource archive highlights before resolved discussion posts.
- Replaced the homepage hero gradient treatment with a flat, low-noise dashboard entrance surface.
- Switched archive highlights to the resources board feed so unanswered Q&A and intro posts do not appear as archive recommendations.
- Refined homepage activity, discovery, archive, and recommended-space previews to surface live collaboration signals from existing board data.
- Redesigned the homepage lower flow into compact activity, question-led discovery, archive highlights, recommended spaces, and a utility entry strip.
- Documented `Section` as a legacy alias for the canonical `SectionLayout` component while intentionally preserving backward compatibility for existing layouts.
- Reduced homepage section overlap by keeping one recent activity block, one primary contribution CTA, and one community space navigation block.
- Tightened homepage hero, activity, onboarding, discovery, and meta section spacing to improve density while preserving the existing calm template identity.

## [0.1.8] - 2026-05-18

### Changed

- Restored selective homepage emphasis for live activity and contribution decisions while keeping secondary sections visually quiet.

## [0.1.7] - 2026-05-18

### Changed

- Reduced homepage secondary panel weight, separator contrast, and metadata emphasis while preserving the primary hero, live activity, and contribution path.

## [0.1.6] - 2026-05-18

### Changed

- Compressed homepage and board copy to reduce repeated operational language while preserving prepared-state meaning.

## [0.1.5] - 2026-05-18

### Changed

- Reframed homepage and board empty states as operationally prepared contribution surfaces without adding simulated activity.

## [0.1.4] - 2026-05-18

### Changed

- Refined homepage structural rhythm with shared section surfaces, softer internal separators, and fewer nested card edges.

## [0.1.3] - 2026-05-18

### Changed

- Compressed secondary homepage surfaces and softened supporting attention weight for calmer operational scanning.

## [0.1.2] - 2026-05-18

### Changed

- Unified homepage sections into connected operational surface groups with consistent rhythm and edges.

## [0.1.1] - 2026-05-18

### Changed

- Refined homepage information priority, scanning rhythm, and primary-to-secondary section hierarchy.

## [0.1.0] - 2026-05-18

### Added

- Established Glitter Project Hub as a clean standalone user template identity.
- Introduced a JSON layout engine structure for project and community platform pages.
- Included DynamicRenderer-based component registration for the `GlitterProjectHub` IIFE bundle.
- Added responsive layouts for home, board, search, profile, authentication, and content pages.
- Added permissions-aware rendering patterns for authenticated and guest user flows.
- Added API-first layout definitions with reusable `data_sources`, bindings, routes, and template assets.
- Added Korean and English i18n support for the bundled template language files.
