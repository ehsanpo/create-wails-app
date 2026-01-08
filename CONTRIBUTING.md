# Contributing to create-wails-app

Thank you for your interest in contributing to create-wails-app! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/create-wails-app.git
   cd create-wails-app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Test locally:
   ```bash
   node bin/run.js
   ```

## Project Structure

```
create-wails-app/
├── src/
│   ├── index.ts              # Main CLI entry point
│   ├── types.ts              # TypeScript type definitions
│   ├── prompt-engine.ts      # Layer 1: Collects user input
│   ├── decision-mapper.ts    # Layer 2: Maps answers to config
│   ├── generator-engine.ts   # Layer 3: Executes scaffolding
│   ├── feature-patcher.ts    # Applies feature patches
│   ├── wails-cli-manager.ts  # Manages Wails CLI installation
│   ├── post-install-ux.ts    # Layer 4: Shows next steps
│   └── utils.ts              # Utility functions
├── bin/
│   └── run.js                # CLI executable
├── dist/                     # Compiled JavaScript (generated)
└── package.json
```

## Architecture

The CLI follows a strict 4-layer architecture:

1. **Prompt Engine** - Collects user preferences (pure, no side effects)
2. **Decision Mapper** - Converts answers to concrete configuration
3. **Generator Engine** - Executes Wails CLI and applies patches
4. **Post-Install UX** - Displays guidance and next steps

Each layer should be isolated and testable.

## Development Workflow

### Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes
3. Build and test:
   ```bash
   npm run build
   node bin/run.js
   ```

4. Commit your changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

5. Push and create a pull request

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Adding New Features

When adding a new feature:

1. **Update the Prompt Engine** (`prompt-engine.ts`)
   - Add new questions in the appropriate section
   - Follow the existing prompt flow

2. **Update Types** (`types.ts`)
   - Add new properties to relevant interfaces
   - Update `GeneratorConfig` if needed

3. **Update Decision Mapper** (`decision-mapper.ts`)
   - Map new answers to configuration

4. **Create Feature Patch** (`feature-patcher.ts`)
   - Add a new `apply*` method
   - Use the existing patterns (spinners, error handling)
   - Never destructively modify user code

5. **Update Generator** (`generator-engine.ts`)
   - Call your new patch method in `applyFeatures()`

6. **Update Documentation**
   - Add feature to README.md
   - Update this file if needed

### Adding New Templates

To add support for a new framework template:

1. Research the official or community template
2. Add it to the template map in `decision-mapper.ts`
3. Test thoroughly
4. Document any special requirements

## Feature Guidelines

Every feature must pass this test:

> "Does this save the user more time than it costs to maintain?"

If not, it should not be added.

### Feature Principles

- **Safety First**: Never destructively modify user code
- **Official Tools**: Prefer official Wails and framework tools
- **Clear Errors**: Every error must explain what, why, and how to fix
- **No Magic**: Make operations visible and understandable
- **Composable**: Features should work independently

## Testing

### Manual Testing

1. Test the complete flow:
   ```bash
   npm run build
   node bin/run.js
   ```

2. Try different combinations:
   - Different Wails versions
   - Different frameworks
   - Different feature combinations

3. Verify the generated project:
   ```bash
   cd generated-project
   npm install
   wails dev  # or wails3 dev
   ```

### Automated Testing

(To be implemented)

- Unit tests for each layer
- Snapshot tests for prompts
- Integration tests with mocked filesystem

## Commit Messages

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Example:
```
feat: add support for Solid.js framework
fix: correct TypeScript config generation
docs: update README with new feature
```

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the CHANGELOG.md (if exists) with a description of changes
3. The PR will be merged once reviewed and approved

## Questions?

If you have questions:

1. Check existing issues and discussions
2. Read the Wails documentation
3. Ask in the pull request or create an issue

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in the project README.

---

Thank you for contributing to create-wails-app! 🎉
