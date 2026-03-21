# 📋 TODO - Athena CMS (Master Plan)

## 🐛 Critical Bugfix & Polish (Urgent)
- [x] **Dock Design Sync**: Zorg dat `DesignControls` (zijbalk) bij het opstarten ook de kleuren uit `style_config.json` inlaadt (nu staan ze op zwart na reload). (Fixed 2026-03-21)
- [x] **Modal Context Awareness**: Verbeter de `SITE_SYNC_RESPONSE` zodat de modal het verschil herkent tussen "geen kleur" (volg globaal) en "zwart". (Fixed 2026-03-21)
- [x] **Button Navigation Fix (De Schaar)**: Onderzoek waarom CTA en Navbar knoppen (behalve Home/Contact) niet scrollen naar de juiste sectie. (Fixed 2026-03-21)
- [x] **One-Step-Behind Prevention**: Finale controle op alle sliders om de 1-frame-delay volledig te elimineren in alle browsers. (Fixed 2026-03-21)
- [ ] **Onboarding Validation**: Execute first live "Digital Strategist" onboarding session via CLI/Dashboard.
- [x] **Operation War Game**: Execute first end-to-end autonomous agent test (CLI simulation). (Done 2026-03-21)
- [ ] **Athena Hub Launch**: Final content polish and live Stripe payment test.
- [x] **Autonomous Reliability**: Configure cronjobs for nightly monitor and storage pruning. (Scripts implemented 2026-03-21)

## 🏢 Operations & Governance
- [x] **Client Onboarding Protocol**: Implement the "Discovery Agent" and automated client technical provisioning. (Skeleton done 2026-03-21)
- [ ] **Infrastructure Migration**: Plan and execute the full transition of GCP and AI services from `karel.test.special@gmail.com` to `athena.cms.factory@gmail.com` once commercial viability is established.
- [ ] **Corporate Entity Setup**: Legal and financial preparation for the Factory as a standalone entity.

## 🤖 AI Tasks (Jules 2.0)
- [x] **Systemic Audit:** Map all redundant components across the factory and site repositories. (Done 2026-03-21)
- [x] **Modular Engine Refactor:** Redesign `factory.js` into a more modular, plugin-based architecture. (Completed 2026-03-21)
- [x] **Shared Component Migration:** Transition sites to use a unified shared component library in `factory/2-templates/shared/`. (Done 2026-03-21)
- [ ] **Advanced Generator**: Explore AST-based or template-based code injection for safer project generation.

## 🛠️ Engine Improvements
- [x] **Migratie: paginastructuur -> navbar (de-schaar-site)**
  - [x] Hernoem `src/data/paginastructuur.json` naar `navbar.json`
  - [x] Update `project-settings/url-sheet.json` (Key & GID mapping)
  - [x] Update `App.jsx` (`navData={data['navbar']}`)
  - [x] Update `Header.jsx` (`cmsBind={{ file: 'navbar', ... }}`)
  - [x] Update `Section.jsx` (Config mapping)
  - [x] Update `src/data/section_settings.json` (ID en titels)
  - [x] Update `src/data/section_order.json`
  - [x] Update `src/data/schema.json`
  - [x] Hernoem tabblad in Google Sheet via API naar 'navbar'
- [x] **Data Gateway**: Replaced legacy 'Sync' with a unified Data Gateway (Cloud Pull/Push + Pull from local input folder).
- [x] **Terminology Unification**: Standardized "Data Bron" (Data Source) for all input folders across the system and documentation.
- [x] Streamline `scavengeAssets` for faster and more reliable asset mapping. (Optimized 2026-03-21)
- [ ] Implement a unified data aggregator for complex sites and MPA structures.
- [ ] Optimize the internal build and dev-server orchestration.
- [x] **Sitetype from Site**: Added functionality to create a new sitetype based on an existing site's structure and components (implemented via `premium-webshop-filter`).

## 🎨 UI/UX (Dock)
- [x] Implement a robust Undo/Redo history engine.
- [x] **Hero & Dock Interaction & Transparency Slider (v8.3)** (Completed)
- [x] **Individual Text Styling (v8.3)** (Completed)
- [x] **Footer Editability (v8.3)** (Completed)
- [ ] Develop a **"Visual Component Library"** extractor for real-time section management. (Metadata Extractor done 2026-03-21)

## 🏗️ Infrastructure & Scalability
- [ ] **Site Portfolio Audit**: Systematisch overlopen van alle 35+ sites via de Site Reviewer (voortgang bijhouden).
- [x] Streamline `scavengeAssets` for faster and more reliable asset mapping. (Optimized 2026-03-21)
