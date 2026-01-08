# Examples & Usage Guide

This guide provides examples of common use cases and workflows with `create-wails-app`.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Common Scenarios](#common-scenarios)
- [Feature Combinations](#feature-combinations)
- [After Generation](#after-generation)
- [Troubleshooting](#troubleshooting)

## Basic Usage

### Create a Simple React App

```bash
npx create-wails-app
```

Then select:
- Project name: `my-wails-app`
- Wails version: `Wails 2 (stable)`
- Frontend: `React`
- Frontend extras: `TypeScript` (default)
- Skip other features
- Confirm

### Create a Vue App with Tailwind

```bash
npx create-wails-app
```

Select:
- Frontend: `Vue`
- Frontend extras: `TypeScript`, `Tailwind CSS`

### Create a Full-Featured Desktop App

```bash
npx create-wails-app
```

Select:
- Frontend: `React`
- Frontend extras: All options
- App features: `System tray`, `Auto update`, `Native dialogs`, `App config`
- Data: `SQLite`
- Testing: All options

## Common Scenarios

### 1. Local-First Desktop App with Database

**Use Case**: Note-taking app, task manager, etc.

**Configuration**:
- Frontend: `React` or `Vue`
- Extras: `TypeScript`, `Tailwind CSS`
- Features: `App config`, `Native dialogs`
- Data: `SQLite`, `Encrypted storage`
- Testing: `Frontend unit`, `Backend tests`

**Result**: App with local database, settings storage, and native file dialogs.

### 2. Cloud-Connected App

**Use Case**: Sync-enabled app with backend

**Configuration**:
- Frontend: `React`
- Extras: `TypeScript`, `Router`
- Features: `Single instance`, `Native dialogs`
- Data: `Supabase` (Auth + Database)
- Testing: `Frontend unit`

**Result**: App with Supabase authentication and cloud database.

### 3. System Utility/Tool

**Use Case**: Background utility, monitoring tool

**Configuration**:
- Frontend: `Vanilla` or `Svelte` (lightweight)
- Extras: `TypeScript`
- Features: `System tray`, `Single instance`, `Startup`, `Clipboard`
- Testing: Basic

**Result**: Lightweight system tray app that starts with system.

### 4. E2E Tested Production App

**Use Case**: Enterprise application with CI/CD

**Configuration**:
- Frontend: `React` or `Vue`
- Extras: All (TypeScript, Tailwind, Router, ESLint, GitHub Actions)
- Features: As needed
- Testing: All options

**Result**: Production-ready app with full testing and CI/CD pipeline.

## Feature Combinations

### TypeScript + Tailwind + Router

A modern SPA with routing and styling:

```
Frontend Extras:
  ✓ TypeScript
  ✓ Tailwind CSS
  ✓ Router
  ✓ ESLint + Prettier
```

**Best for**: Multi-page desktop applications

### System Tray + Single Instance + Auto Update

A professional desktop utility:

```
App Features:
  ✓ Single instance lock
  ✓ System tray
  ✓ Auto update
  ✓ Startup
```

**Best for**: Always-running utilities, monitoring tools

### SQLite + Encrypted Storage + App Config

Secure local data storage:

```
Data & Backend:
  ✓ SQLite (local-first)
  ✓ Encrypted local storage
  
App Features:
  ✓ App config / settings store
```

**Best for**: Privacy-focused apps, offline-first apps

### Supabase Full Stack

Complete backend integration:

```
Data & Backend:
  ✓ Supabase integration
    └─ Auth
    └─ Database
    └─ Storage
```

**Best for**: Cloud-synced apps, collaborative tools

## After Generation

### 1. Navigate to Project

```bash
cd my-wails-app
```

### 2. Review Generated Files

Check what was created:

```bash
# View project structure
ls -la

# Review package.json
cat package.json

# Check Wails config
cat wails.json
```

### 3. Start Development

```bash
# Start dev server with hot reload
wails dev
```

Or for Wails v3:

```bash
wails3 dev
```

### 4. Build for Production

```bash
# Build production binary
wails build
```

Output will be in `build/bin/`

### 5. Set Up Supabase (if selected)

1. Create a Supabase project at https://supabase.com
2. Copy your project URL and anon key
3. Create `.env` file:

```bash
cp .env.example .env
```

4. Edit `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 6. Run Tests (if configured)

```bash
# Frontend unit tests
npm run test

# E2E tests (install browsers first)
npx playwright install
npm run test:e2e

# Backend tests
go test ./...
```

### 7. Set Up GitHub Actions (if selected)

1. Push to GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

2. Create a release:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The release workflow will automatically build for all platforms.

## Troubleshooting

### Wails CLI Not Found

**Problem**: `wails: command not found`

**Solution**: 
The CLI should auto-install. If it fails:

```bash
# For Wails v2
go install github.com/wailsapp/wails/v2/cmd/wails@latest

# For Wails v3
go install github.com/wailsapp/wails/v3/cmd/wails3@latest
```

Make sure `$GOPATH/bin` is in your PATH.

### Build Fails on Windows

**Problem**: Build errors on Windows

**Solution**: Install WebView2:
https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### Build Fails on macOS

**Problem**: Build errors on macOS

**Solution**: Install Xcode Command Line Tools:

```bash
xcode-select --install
```

### Build Fails on Linux

**Problem**: Missing dependencies

**Solution**: Install required packages:

```bash
# Ubuntu/Debian
sudo apt install libgtk-3-dev libwebkit2gtk-4.0-dev

# Fedora
sudo dnf install gtk3-devel webkit2gtk3-devel

# Arch
sudo pacman -S gtk3 webkit2gtk
```

### TypeScript Errors

**Problem**: Type errors in generated code

**Solution**: 
1. Make sure TypeScript is installed: `npm install`
2. Check `tsconfig.json` is present
3. Run: `npm run build`

### Router Not Working

**Problem**: Router navigation doesn't work

**Solution**: Make sure you've imported and set up the router in your main app file. Check the framework-specific router documentation.

### Supabase Connection Fails

**Problem**: Cannot connect to Supabase

**Solution**:
1. Check `.env` file has correct credentials
2. Make sure you're using `VITE_` prefix: `VITE_SUPABASE_URL`
3. Restart dev server after changing `.env`

### GitHub Actions Failing

**Problem**: Workflows fail to build

**Solution**:
1. Check Go and Node versions in workflow files
2. Make sure Wails CLI installation succeeds
3. Check build logs for specific errors

## Advanced Usage

### Custom Templates

You can modify the template selection in `src/decision-mapper.ts` to use your own templates.

### Custom Feature Patches

Add new features by creating methods in `src/feature-patcher.ts`:

```typescript
async applyMyFeature(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding my feature...').start();
  
  try {
    // Your implementation
    spinner.succeed('My feature added');
  } catch (error) {
    spinner.fail('Failed to add my feature');
    throw error;
  }
}
```

### Extending the CLI

The 4-layer architecture makes it easy to extend:

1. **Add prompts**: Edit `prompt-engine.ts`
2. **Add logic**: Edit `decision-mapper.ts`
3. **Add generation**: Edit `generator-engine.ts` or `feature-patcher.ts`
4. **Add UX**: Edit `post-install-ux.ts`

## Tips & Best Practices

1. **Start Simple**: Begin with basic features, add more as needed
2. **Use TypeScript**: Highly recommended for maintainability
3. **Enable ESLint**: Catches errors early
4. **Set Up CI Early**: GitHub Actions helps catch issues
5. **Read Wails Docs**: https://wails.io/docs for platform-specific details
6. **Test Locally First**: Always test generated projects before committing

## Need Help?

- 📚 [Wails Documentation](https://wails.io/docs)
- 💬 [Wails Discord](https://discord.gg/BrRSWTaxRK)
- 🐛 [Report Issues](https://github.com/yourusername/create-wails-app/issues)

---

Happy building! 🚀
