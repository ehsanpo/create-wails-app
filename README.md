# create-wails-app

[![npm version](https://badge.fury.io/js/create-wails-app.svg)](https://badge.fury.io/js/create-wails-app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Interactive CLI for scaffolding modern Wails desktop applications**

`create-wails-app` is a project generator that makes it easy to start building desktop applications with [Wails](https://wails.io). It provides an installer-style, question-driven experience similar to `create-next-app` or `create-vite`.

## Features

✨ **Interactive & Modern CLI** - Beautiful prompts with clear options  
🎯 **Wails v2 & v3 Support** - Choose between stable or experimental  
⚛️ **Multiple Frontend Frameworks** - React, Vue, Svelte, Solid, and Vanilla  
🛠️ **Rich Feature Set** - System tray, auto-update, SQLite, and more  
🔧 **Zero Manual Fixes** - Generated projects are ready to run  
📦 **Modular Architecture** - Clean separation of concerns  

## Quick Start

```bash
npx create-wails-app
```

Or install globally:

```bash
npm install -g create-wails-app
create-wails-app
```

## Prerequisites

- **Node.js** 18 or higher
- **Go** 1.18 or higher
- **Wails CLI** (will be installed automatically if missing)

Platform-specific requirements:
- **Windows**: WebView2 runtime
- **macOS**: Xcode Command Line Tools
- **Linux**: gtk3, webkit2gtk

See [Wails Installation Guide](https://wails.io/docs/gettingstarted/installation) for details.

## Usage

### Interactive Mode (Default)

Simply run the command and follow the prompts:

```bash
npx create-wails-app
```

You'll be asked about:

1. **Project name and location**
2. **Wails version** (v2 stable or v3 experimental)
3. **Frontend framework** (React, Vue, Svelte, Solid, Vanilla)
4. **Frontend extras** (TypeScript, Tailwind, Router, ESLint, GitHub Actions)
5. **App features** (System tray, single instance, auto-update, etc.)
6. **Data & backend** (SQLite, encrypted storage, Supabase)
7. **Testing setup** (Vitest, Playwright, Go tests)

### What You Get

A fully configured project with:

- ✅ Wails application scaffolded with official templates
- ✅ Selected frontend framework with TypeScript support (optional)
- ✅ Tailwind CSS configured (optional)
- ✅ Router setup for SPA navigation (optional)
- ✅ ESLint & Prettier for code quality (optional)
- ✅ GitHub Actions workflows for CI/CD (optional)
- ✅ Feature-specific boilerplate and examples
- ✅ All dependencies installed and ready to go

## Supported Features

### Frontend Frameworks

- **React** - With Vite and TypeScript support
- **Vue** - Vue 3 with Composition API
- **Svelte** - Modern reactive framework
- **Solid** - Fine-grained reactivity
- **Vanilla** - Pure JavaScript/TypeScript

### Frontend Extras

- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Router** - SPA routing (framework-specific)
- **ESLint + Prettier** - Code linting and formatting
- **GitHub Actions** - CI/CD workflows

### App Features

- **Single Instance Lock** - Prevent multiple app instances
- **System Tray** - System tray integration
- **Auto Update** - GitHub Releases-based updates
- **Native Dialogs** - File picker, notifications
- **App Config** - Settings and configuration store
- **Deep Linking** - Custom URL protocol support
- **Startup/Auto-launch** - Launch on system startup
- **Clipboard** - Clipboard utilities
- **File Watcher** - File system monitoring

### Data & Backend

- **SQLite** - Local-first database
- **Encrypted Storage** - Secure local storage
- **Supabase** - Backend-as-a-service integration
  - Auth
  - Database
  - Storage

### Testing

- **Vitest** - Frontend unit testing
- **Playwright** - E2E testing
- **Go Tests** - Backend testing with examples

## Architecture

The CLI follows a clean 4-layer architecture:

1. **Prompt Engine** - Collects user preferences (no side effects)
2. **Decision Mapper** - Converts answers to concrete actions
3. **Generator Engine** - Executes Wails CLI and applies patches
4. **Post-Install UX** - Displays next steps and guidance

This design ensures:
- Testable components
- Clear separation of concerns
- Easy to extend with new features

## Wails CLI Management

The tool automatically detects and installs the Wails CLI if needed:

1. Checks if the required version is installed
2. Prompts for permission to install (if missing)
3. Installs using official Go commands
4. Verifies installation success

You maintain full control - no silent installations.

## GitHub Actions Support

When enabled, generates two workflows:

### CI Workflow
- Runs on push/PR
- Lints code (if ESLint enabled)
- Runs tests (if testing enabled)

### Release Workflow
- Triggered on Git tags (e.g., `v1.0.0`)
- Builds for Linux, macOS, and Windows
- Uploads artifacts
- Creates GitHub Release

**Note**: Binary signing and notarization are NOT enabled by default. These require additional setup for production distribution.

## Template Strategy

Instead of maintaining monolithic templates, we use:

- **Base Wails Templates** - Official and community templates
- **Feature Patches** - Composable layers for each feature

This approach:
- Avoids duplication
- Makes updates easier
- Ensures compatibility with official Wails templates

## Development

```bash
# Clone the repository
git clone https://github.com/yourusername/create-wails-app.git
cd create-wails-app

# Install dependencies
npm install

# Build TypeScript
npm run build

# Test locally
node bin/run.js
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Philosophy

Every feature must pass this test:

> "Does this save the user more time than it costs to maintain?"

We prioritize:
- Developer experience
- Long-term maintainability
- Safety (no destructive operations)
- Clarity (helpful error messages)

## License

MIT © E.P.

## Resources

- [Wails Documentation](https://wails.io/docs)
- [Wails Discord](https://discord.gg/BrRSWTaxRK)
- [Wails GitHub](https://github.com/wailsapp/wails)

## Acknowledgments

Built with:
- [oclif](https://oclif.io) - CLI framework
- [inquirer](https://github.com/SBoudrias/Inquirer.js) - Interactive prompts
- [execa](https://github.com/sindresorhus/execa) - Process execution
- [fs-extra](https://github.com/jprichardson/node-fs-extra) - File operations
- [chalk](https://github.com/chalk/chalk) - Terminal styling
- [ora](https://github.com/sindresorhus/ora) - Elegant spinners
