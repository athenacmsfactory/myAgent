# Developer Manual - Athena CMS Factory (v8.7.1)

## 🏆 The Modular Generation Standard (v8.7)
Since v8.7, the Athena Engine has moved from a monolithic generator to a **Modular Phase-Based Pipeline**. This ensures high reliability, easier debugging, and plugin-based extensibility.

### 1. The Pipeline Phases
The `ProjectGenerator` orchestrates site creation through five specialized phases:
- **InitializePhase**: Directory setup, path resolution, and blueprint validation.
- **DataPhase**: Logical schema generation, context-aware branding, and initial JSON settings.
- **BoilerplatePhase**: Copying base React structures and core logic.
- **ComponentPhase**: Assembling the UI library and generating the dynamic `Section.jsx`.
- **FinalizePhase**: Package management, Vite configuration, SEO, and Quality Checks.

### 2. AST-Based Transformations
To prevent syntax errors common with regex-based code injection, v8.7 introduced **AST Transformations** via `recast` and `babel-parser`.
- **Imports**: Automatically corrected based on component location.
- **Variables**: Replaced safely within string literals and template literals.
- **Conditionals**: Handled via block markers (e.g., `/* {{SHOP_START}} */`), enabling precise code removal or preservation based on site features.

---

## 🎨 Zero-Delay UI & Real-Time Sync
The Athena Dock (v8.7) is optimized for instantaneous feedback, crucial for a high-performance developer experience.

### 1. Decoupled Slider Logic
To eliminate the "One-Step-Behind" delay, all sliders in the Dock use a decoupled event model:
- **`onInput`**: Triggers a debounced `postMessage` to the site preview for immediate visual updates (Live Preview).
- **`onChange`**: Triggers the persistent `saveData` call only when the user finishes the interaction, minimizing API overhead.

### 2. Self-Reporting CSS Bridge
The site-connector (`dock-connector.js`) automatically extracts computed CSS variables from the live site and reports them back to the Dock. This ensures the sidebar always shows the *actual* colors and styles being rendered, even after a full page reload.

### 3. Integrated Google Sheets Sync
A dedicated **Sheet Sync** panel in the Dock sidebar provides one-click synchronization to the cloud, complete with a "Last Sync" timestamp persisted in local storage.

---

## 🏢 Portfolio Management & Health

### 1. Managed Monorepo (pnpm)
Athena uses `pnpm workspaces` to manage dependencies centrally. 
- **Rule**: Always run `pnpm install` from the root.
- **Benefit**: 90% disk space reduction and guaranteed dependency parity across all sites.

### 2. Automated Storage Pruning
To prevent disk bloat on Chromebook hardware, the system includes `storage-prune.js`:
- **Inactive Sites**: Automatically removes `node_modules` from sites not modified in >30 days.
- **Temp Data**: Purges `src/data-temp/` folders older than 21 days.
- **Maintenance**: Orchestrated via `nightly-maintenance.sh`.

### 3. Site Portfolio Reviewer
The `site-reviewer.js` utility provides a centralized audit of the entire portfolio:
- **Status Tracking**: Persists audit history in `output/AUDIT_PROGRESS.json`.
- **Visual Report**: Generates `output/SITES_REVIEW_STATUS.md` for a bird's-eye view of site health.

---

## 🔍 Branding & Identity (LogoGenerator v2.0)
The built-in `LogoGenerator` is now **context-aware**. It analyzes the `siteType` (e.g., webshop, medical, tech) and automatically embeds relevant iconography into the generated SVG logo, providing a professional starting point for every new project.

---

## 📐 Development Guidelines

### 1. Human-Readable Data Rule
All data keys in Google Sheets MUST be in **Dutch** and use natural language (e.g., `bedrijfsnaam` instead of `company_name`). The `TransformationEngine` handles the mapping to code-friendly variables.

### 2. Managed Components
Core UI components (Hero, CTA, Testimonials, etc.) are centralized in `factory/2-templates/shared/components/`. 
- **Migration**: Legacy sites should be updated using the `update-all-sites.js` utility to ensure they use the latest shared standards.

### 3. Data Aggregation
The `DataAggregator` automatically merges individual JSON files into a single `all_data.json` during the Finalize phase. This reduces network requests and significantly improves site load performance.

---
*Manual updated: March 21, 2026 - Athena Architect Team*
