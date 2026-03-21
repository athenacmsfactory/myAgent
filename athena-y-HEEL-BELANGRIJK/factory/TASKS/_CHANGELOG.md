# Changelog - Athena CMS Factory

## [8.7.1] - 2026-03-21
### 🛡️ AST STABILITY & ENGINE REFINEMENT
- **Robust AST Parsing**: Fixed a critical issue where JSX files would fail AST transformation due to incorrect parser configuration. Integrated `recast/parsers/babel.js` as the default for JS/JSX files.
- **Template Literal Support**: Expanded `TransformationEngine` to support variable replacement within template literals (\`${VAR}\`) using AST nodes.
- **Discovery Agent Inbox**: Standardized `gateway_inbox.json` as the unified entry point for automated provisioning.

## [8.7.0] - 2026-03-21
### 🏆 ARCHITECTURE MILESTONE: MODULAR ENGINE & AST TRANSFORMS
- **Modular Phase-Based Engine**: Refactored the monolithic `factory.js` into a sequence of specialized phases (`Initialize`, `Data`, `Boilerplate`, `Component`, `Finalize`). This enables plugin-based extensions and easier maintenance.
- **AST-Based Code Manipulation**: Upgraded `TransformationEngine.js` to use `recast` and `babel-parser` for JS/JSX files. This replaces fragile regex-based templates with safe, syntax-aware node injection.
- **Context-Aware Logo Generator (v2.0)**: The `LogoGenerator` now recognizes business types (Webshop, Tech, Medical, etc.) and automatically embeds relevant iconography into the generated site logos.
- **Integrated Sheet Sync**: Added a dedicated "Sync to Google Sheets" button and status indicator directly into the Athena Dock sidebar, closing the "Last Mile" loop for autonomous content management.
- **Performance Optimized Scavenger**: Implemented static caching and intelligent directory skipping in `AssetScavenger.js`, reducing monorepo build times by avoiding redundant file indexing.
- **Zero-Delay Sliders**: Fixed the "One-Step-Behind" UI lag in `DesignControls.jsx` by decoupling live preview events from persistent disk-save operations.

## [8.5.0] - 2026-03-08
... (rest of file)
