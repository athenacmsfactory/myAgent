# 📋 AI Employee Task Queue

## 🛠️ Infrastructure (Done)
- [x] TASK-1: Initialize the brain-md skill.
- [x] TASK-2: Implement the AfterAgent loop hook.
- [x] TASK-3: Configure the Systemd user service.

## 🏗️ Project: Athena-X Autonomy
- [x] TASK-4: Analyze `athena-x/README.md` and `GEMINI.md` to identify the core build commands. (Priority: High)
- [x] TASK-5: Create a new site entry in `athena-x/input/sites/` to trigger a build. (Priority: High)
- [x] TASK-6: Execute the `athena-x` build process autonomously using the employee loop. (Priority: High)
- [x] TASK-7: Log the build result and any visual output in `brain/logs.md`. (Priority: Medium)
## 🚀 Next Steps (Priority: High)
- [x] TASK-8: Fix `dirk-de-witte-kappers` data resolution error (missing `basisgegevens.json`).
- [x] TASK-9: Fix `cloud-architects-cyberpunk` and other sites failing Tailwind v4 build.
- [x] TASK-10: Implement a site-wide sanity check for `index.html` paths to avoid build regressions.
- [x] TASK-11: Generate a `SITES_BUILD_STATUS.md` report as a build artifact.
## 🔱 Factory Excellence (Priority: Medium)
- [x] TASK-12: Perform System-Wide Quality Audit & Redundant Component Mapping.
- [x] TASK-13: Investigate Dock Design Sync issue (colors resetting to black on reload).
- [x] TASK-14: Audit `scavengeAssets` for performance and reliability improvements.
- [x] TASK-15: Clean up corrupted JSON files (2-3 bytes) across the monorepo.
- [x] TASK-16: Propose a migration plan for shared components to `factory/2-templates/shared/`.
## 🛠️ Implementation Phase (Priority: High)
- [x] TASK-17: Patch `dock-connector.js` to send computed CSS variables to the Dock.
- [x] TASK-18: Update `DesignControls.jsx` to handle incoming computed styles for sidebar hydration.
- [x] TASK-19: Implement the Shared Component migration (`factory/2-templates/shared/`).
- [x] TASK-20: Fix the `ProjectGenerator` import logic bug in `standard-layout-generator.js`.
## 🔧 Advanced Refinement (Priority: Medium)
- [x] TASK-21: Improve `SITE_SYNC_RESPONSE` for Modal Context Awareness (distinguish 'no color' vs 'black').
- [x] TASK-22: Fix Button Navigation issues in `de-schaar-site` (CTA/Navbar scrolling).
- [x] TASK-23: Implement `scavengeAssets` performance improvements (caching/registry).
## ⚡ Operational Excellence (Priority: High)
- [x] TASK-24: Investigate and fix 'One-Step-Behind' slider delay across all browsers.
- [x] TASK-25: Implement `storage-prune` script and configure cronjob for nightly maintenance.
- [x] TASK-26: Begin Site Portfolio Audit (automated check for common failures).
- [x] TASK-27: Explore AST-based code injection for safer project generation (`Advanced Generator`).
## 🏛️ Architectural Refactoring (Priority: High)
- [x] TASK-28: Modular Engine Refactor - Split `factory.js` into logical phases.
- [x] TASK-29: Implement AST-based Variable Replacement in `TransformationEngine`.
- [x] TASK-30: Optimize Header/Footer components for dynamic coloring across all templates.
- [x] TASK-31: Develop a 'Commercial Value Tracking' performance report utility.
## 🚀 Strategic Goal: Google Sheets Integration (Priority: High)
- [x] TASK-32: Implement 'Sync to Google Sheets' button in Athena Dock sidebar.
- [x] TASK-33: Add visual sync status indicator to the Dock UI.
## 🧹 Deep Polish & Audit (Priority: Medium)
- [x] TASK-34: Audit all sliders in `VisualEditor.jsx` for 'One-Step-Behind' delay.
- [x] TASK-35: Execute a follow-up System-Wide Quality Audit using the new modular engine.
## 🤖 Autonomous Expansion (Priority: Medium)
- [x] TASK-36: Implement 'Discovery Agent' skeleton for automated client provisioning.
- [x] TASK-37: Develop 'Visual Component Library' metadata extractor.
- [x] TASK-38: Configure 'Digital Strategist' onboarding session script.
## 🧹 Legacy Site Cleanup (Priority: Medium)
- [x] TASK-39: Fix broken relative imports in `Section.jsx` for `ai-consultant-smartbe`, `jets-archive`, and `portfolio-kbm`.
- [x] TASK-40: Investigate sites with missing `src/data` (`gentse-dakwerken`, `lex-justitia`, `pure-bloom-floral`, `urban-brew-bite`) and migrate to `sites-external` if they are static.
- [x] TASK-41: Re-hydrate `sites-modular-test` to verify full build cycle.
## 🔧 Data & UI Refinement (Priority: Medium)
- [x] TASK-42: Update Master Plan (_TODO.md) with latest progress.
- [x] TASK-43: Implement Unified Data Aggregator (`all_data.json`) logic.
- [x] TASK-44: Final fix for 'One-Step-Behind' delay in `DockFrame.jsx` sliders.
- [x] TASK-45: Integration of Discovery Dossier into `ProjectGenerator` (Initialize & Data phases).
## ⚡ Performance & Scalability (Priority: Medium)
- [x] TASK-46: Optimize internal build and dev-server orchestration (multi-site management).
- [x] TASK-47: Implement automated 'Site Portfolio' visual screenshots utility.
## 🔗 Strategic Expansion (Priority: Medium)
- [x] TASK-48: Research AthenaGateway for automated site creation from email.
- [x] TASK-49: Implement 'Sheet Poll Listener' (`sheet-poll-listener.js`) for automated rebuilds.
- [x] TASK-50: Execute Global Update across all sites to roll out modular logic and components.
- [x] TASK-51: Final Monorepo Integrity Check (Global Build).
## 💎 Final Refinement & Documentation (Priority: High)
- [x] TASK-52: Final deep-dive on slider delay (debouncing/throttling) in Dock UI.
- [x] TASK-53: Enhance `DataAggregator.js` to support Multi-Page Application (MPA) structures.
- [x] TASK-54: Implement automated 'Site Portfolio Audit' progress tracker.
- [x] TASK-55: Update `athena-x/docs/core/DEVELOPER_MANUAL.md` with Modular Engine v2.1 details.
## 🚑 Portfolio Recovery (Priority: High)
- [x] TASK-56: Mass-fix all 2-byte JSON files by standardizing with pretty-printed empty structures (`[]` or `{}`).
- [x] TASK-57: Restore missing `src/data` directories for static sites by copying minimal structural defaults.
## 🤖 Simulation & Testing (Priority: Medium)
- [x] TASK-58: Implement 'Mock Mode' in `ai-engine.js` for testing without live API keys.
- [x] TASK-59: Execute 'Operation War Game' - End-to-end autonomous creation-to-build test.
- [x] TASK-60: Final Site Reviewer run to confirm 100% Portfolio PASS status.

## 🚀 Future Autonomous expansion (Priority: Medium)
- [ ] TASK-61: Execute first live "Digital Strategist" onboarding session for a new mock client.
- [ ] TASK-62: Research and prototype Antigravity Browser integration for E2E site auditing.
- [ ] TASK-63: Investigate functional testing (Shift+Click) issues in Reviewer iframe context.
- [ ] TASK-64: Implement "Agent-to-Mail" response logic (SMTP) in Gateway.js.
