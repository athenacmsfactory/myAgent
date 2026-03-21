# 🏗️ Component Migration Plan (TASK-16)

## 🎯 Objective
Centralize the 8 core React components to reduce redundancy and simplify system-wide updates.

## 📍 Current State
- Core components live in `factory/2-templates/components/`.
- Every generated site receives a physical copy of these components in `src/components/`.
- Redundancy is ~100% for these files across 60+ sites.

## 🚀 Proposed Strategy
1. **Source of Truth**: Move all core components from `factory/2-templates/components/` to `factory/2-templates/shared/components/`.
2. **Generator Update**: Update `ProjectGenerator` in `factory.js` to:
   - Continue copying files for "Autonomous" sites (to keep them self-contained).
   - Use a symlink or a specialized "Shared Bridge" for "Docked" sites to save disk space and ensure instant updates.
3. **Template Registry**: Implement a `components.json` registry in `shared/` to track versioning and dependencies.

## 🛠️ Implementation Steps
- [ ] Move files to `shared/components/`.
- [ ] Update `TransformationEngine.fixImports` to handle the new paths.
- [ ] Refactor `ProjectGenerator.copyBoilerplate` to pull from the shared directory.
- [ ] Run a batch update script to replace existing copies in all 63 sites with references to the shared library (where applicable).
