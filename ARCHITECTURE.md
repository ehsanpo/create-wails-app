# Architecture

This document explains the internal architecture of `create-wails-app`.

## Overview

The CLI is built on a strict **4-layer architecture** that separates concerns and makes the codebase maintainable and testable.

```
┌─────────────────────────────────────────────────────────────┐
│                         User Input                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Prompt Engine (prompt-engine.ts)                  │
│  ─────────────────────────────────────────                  │
│  • Collects user preferences via interactive prompts        │
│  • No side effects - pure data collection                   │
│  • Returns: AllAnswers object                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: Decision Mapper (decision-mapper.ts)              │
│  ──────────────────────────────────────────                 │
│  • Converts user answers to concrete configuration          │
│  • Selects appropriate templates                            │
│  • Maps features to patches                                 │
│  • Returns: GeneratorConfig object                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Generator Engine (generator-engine.ts)            │
│  ────────────────────────────────────────                   │
│  • Executes Wails CLI commands                              │
│  • Applies feature patches via FeaturePatcher               │
│  • Installs dependencies                                    │
│  • Modifies files safely                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: Post-Install UX (post-install-ux.ts)              │
│  ──────────────────────────────────────────                 │
│  • Displays success message                                 │
│  • Shows next steps                                         │
│  • Provides helpful resources                               │
│  • Warns about platform-specific requirements               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Generated Project                        │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Prompt Engine (`prompt-engine.ts`)

**Responsibility**: Collect user input through interactive prompts

**Key Methods**:
- `collect()`: Orchestrates the entire prompt flow
- `promptProjectBasics()`: Project name and directory
- `promptWailsVersion()`: Wails v2 or v3
- `promptFrontend()`: Framework selection
- `promptFrontendExtras()`: TypeScript, Tailwind, etc.
- `promptAppFeatures()`: System tray, auto-update, etc.
- `promptDataBackend()`: SQLite, Supabase, etc.
- `promptTesting()`: Testing frameworks
- `promptConfirmation()`: Final review and confirmation

**Design Principles**:
- No side effects
- Pure data collection
- Clear, friendly prompts
- Logical flow order

### 2. Decision Mapper (`decision-mapper.ts`)

**Responsibility**: Transform user answers into executable configuration

**Key Methods**:
- `map(answers)`: Main mapping function
- `resolveProjectPath()`: Determine project location
- `selectTemplate()`: Choose appropriate template
- `getTemplateMap()`: Template registry

**Design Principles**:
- No I/O operations
- Pure transformation logic
- Template selection based on version + framework
- Feature flags from user selections

### 3. Generator Engine (`generator-engine.ts`)

**Responsibility**: Execute the actual project generation

**Key Methods**:
- `generate(config)`: Main generation orchestrator
- `checkDirectory()`: Verify target doesn't exist
- `initializeWailsProject()`: Run Wails CLI
- `applyFeatures()`: Apply all selected patches
- `installDependencies()`: npm install

**Dependencies**:
- `FeaturePatcher`: Handles individual feature implementations
- `WailsCLIManager`: Manages Wails CLI installation

**Design Principles**:
- Fail fast on errors
- Clear progress indication (spinners)
- Safe file operations
- Rollback on failure (future)

### 4. Feature Patcher (`feature-patcher.ts`)

**Responsibility**: Apply individual feature modifications

**Each feature has its own method**:
- `applyTypeScript()`: Add TypeScript configuration
- `applyTailwind()`: Add Tailwind CSS setup
- `applyGitHubActions()`: Generate CI/CD workflows
- `applySQLite()`: Add database support
- `applySupabase()`: Add Supabase integration
- ... and many more

**Design Principles**:
- One method per feature
- Idempotent when possible
- Never destructively modify code
- Add only, never remove
- Clear error messages

### 5. Wails CLI Manager (`wails-cli-manager.ts`)

**Responsibility**: Detect and install Wails CLI

**Key Methods**:
- `detect(version)`: Check if CLI is installed
- `promptInstallation()`: Ask user permission
- `install(version)`: Install via Go
- `getManualInstallInstructions()`: Fallback help

**Design Principles**:
- Never install without permission
- Clear communication
- Verify after installation
- Provide manual fallback

### 6. Post-Install UX (`post-install-ux.ts`)

**Responsibility**: Guide user after generation

**Key Methods**:
- `show(config)`: Display success and next steps
- `showError(error)`: Handle and explain errors
- `checkDependencies()`: Verify required tools
- `showNextSteps()`: Guide user forward

**Design Principles**:
- Celebrate success
- Clear actionable steps
- Helpful resource links
- Warning about edge cases

## Data Flow

```
User Input (inquirer)
      │
      ▼
AllAnswers (types.ts)
      │
      ▼
GeneratorConfig (types.ts)
      │
      ▼
File System Changes
      │
      ▼
Generated Project
```

## Type System

All layers communicate through well-defined TypeScript interfaces:

- `AllAnswers`: Raw user input from prompts
- `GeneratorConfig`: Processed configuration for generation
- `TemplateInfo`: Template metadata
- `FeaturePatch`: Feature modification specification

## Error Handling Strategy

Every layer handles errors differently:

1. **Prompt Engine**: Validates input, re-prompts on invalid
2. **Decision Mapper**: Throws on impossible configurations
3. **Generator Engine**: Catches and wraps errors with context
4. **Post-Install UX**: Displays errors with helpful guidance

## Extension Points

The architecture makes it easy to extend:

### Adding a New Feature

1. Add prompt in `prompt-engine.ts`
2. Add property to `AllAnswers` in `types.ts`
3. Map to `GeneratorConfig` in `decision-mapper.ts`
4. Create `apply*()` method in `feature-patcher.ts`
5. Call it in `generator-engine.ts`

### Adding a New Framework

1. Add template to `getTemplateMap()` in `decision-mapper.ts`
2. Update framework-specific patches if needed
3. Test thoroughly

### Adding a New Wails Version

1. Update `WailsVersionAnswer` type
2. Add detection in `wails-cli-manager.ts`
3. Update template selection logic
4. Add version-specific handling

## Testing Strategy

Each layer can be tested independently:

- **Prompt Engine**: Snapshot tests for prompts
- **Decision Mapper**: Unit tests for mappings
- **Generator Engine**: Integration tests with mocked FS
- **Feature Patcher**: Unit tests per feature

## Design Principles

1. **Separation of Concerns**: Each layer has one responsibility
2. **No Magic**: All operations are explicit and traceable
3. **Fail Loudly**: Errors are caught and explained clearly
4. **User Safety**: Never destroy user code or data
5. **Extensibility**: Easy to add new features/frameworks
6. **Maintainability**: Clear structure, well-documented

## Dependencies

### Runtime Dependencies
- `inquirer`: Interactive prompts
- `execa`: Process execution
- `fs-extra`: File operations
- `chalk`: Terminal colors
- `ora`: Loading spinners

### Why These Choices?
- **inquirer**: Industry standard for CLI prompts
- **execa**: Better than child_process, promise-based
- **fs-extra**: Adds useful utilities to fs
- **chalk**: Simple, reliable terminal styling
- **ora**: Beautiful spinners for feedback

## Future Improvements

- [ ] Add dry-run mode
- [ ] Add configuration file support (non-interactive)
- [ ] Add rollback on failure
- [ ] Add telemetry (opt-in)
- [ ] Add plugin system
- [ ] Add automated tests
- [ ] Add template versioning
- [ ] Add update checker

## Performance Considerations

- Template downloads happen once via Wails CLI
- NPM install is the slowest part (unavoidable)
- File operations use async I/O
- No unnecessary file reads/writes
- Spinners provide feedback during long operations

## Security Considerations

- No code is executed during prompts
- Wails CLI is installed from official source only
- Templates come from official/vetted sources
- No credentials are stored or transmitted
- `.env.example` files for sensitive config

---

This architecture ensures `create-wails-app` is:
- ✅ Maintainable
- ✅ Testable
- ✅ Extensible
- ✅ User-friendly
- ✅ Safe
