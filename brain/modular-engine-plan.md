# 🏛️ Modular Engine Refactor Plan (TASK-28)

## 🎯 Objective
Deconstruct the monolithic `factory.js` into a plugin-based architecture where each stage of site generation is a self-contained module.

## 🏛️ Proposed Architecture

### 1. Orchestrator (`ProjectGenerator.js`)
Responsible for the lifecycle and state management of the generation process. It executes a sequence of "Phases".

### 2. Specialized Phases (`phases/`)
- **InitializePhase**: Directory creation, path resolution, and blueprint validation.
- **DataPhase**: Schema generation, logo creation, and initial JSON settings.
- **BoilerplatePhase**: Copying base logic, public assets, and core App structures.
- **ComponentPhase**: Assembling essential and custom components, generating `Section.jsx`.
- **FinalizePhase**: Package.json generation, Vite config, SEO (sitemaps/robots), and Quality Checks.

### 3. Core Engine (`TransformationEngine.js`)
Enhanced version of the current engine, utilizing AST for safe code modification and regex only for simple string placeholders.

## 🚀 Migration Strategy
1. **Extract `TransformationEngine`**: Move it to its own file.
2. **Implement Phase Interface**: Define a standard `execute(context)` method for all phases.
3. **Refactor `ProjectGenerator`**: Change it to iterate through an array of phase instances.
4. **Step-by-Step Extraction**: Move logic from `factory.js` into individual phase files.

## 🛠️ Implementation Steps
- [ ] Create `athena-x/factory/5-engine/core/phases/` directory.
- [ ] Extract `TransformationEngine` to `athena-x/factory/5-engine/core/TransformationEngine.js`.
- [ ] Implement `BasePhase.js` (abstract class).
- [ ] Implement `InitializePhase.js` and integrate into the new Orchestrator.
- [ ] ... repeat for other phases.
