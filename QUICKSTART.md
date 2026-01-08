# Quick Start Guide

Get up and running with `create-wails-app` in 5 minutes!

## Prerequisites

Before you begin, make sure you have:

- ✅ **Node.js 18+** - [Download](https://nodejs.org/)
- ✅ **Go 1.18+** - [Download](https://go.dev/dl/)

Platform-specific (auto-checked during setup):
- **Windows**: WebView2 Runtime (usually pre-installed)
- **macOS**: Xcode Command Line Tools
- **Linux**: GTK3 and WebKit2GTK

## Step 1: Run the CLI

Open your terminal and run:

```bash
npx create-wails-app
```

That's it! The interactive wizard will guide you through the rest.

## Step 2: Answer the Questions

The CLI will ask you about:

### Project Basics
- **Project name**: e.g., `my-awesome-app`
- **Output directory**: Leave empty for current directory

### Wails Version
- **Wails 2 (stable)** ← Recommended for production
- **Wails 3 (experimental)** ← For trying new features

### Frontend Framework
- React
- Vue
- Svelte
- Solid
- Vanilla

**Tip**: Choose what you're most comfortable with!

### Frontend Extras
Select from:
- ✅ TypeScript (recommended)
- Tailwind CSS
- Router
- ESLint + Prettier
- GitHub Actions

### App Features
Pick what your app needs:
- System tray
- Single instance lock
- Auto-update
- And more...

### Data & Backend
- SQLite (local database)
- Encrypted storage
- Supabase (cloud backend)

### Testing
- Frontend unit tests (Vitest)
- E2E tests (Playwright)
- Go backend tests

## Step 3: Wait for Setup

The CLI will:
1. ✅ Check/install Wails CLI (if needed)
2. ✅ Generate your project
3. ✅ Apply selected features
4. ✅ Install dependencies

This takes 1-3 minutes depending on your connection.

## Step 4: Start Coding!

Once complete, you'll see:

```bash
✨ Project created successfully!

Next Steps:

  1. Navigate to your project:
     cd my-awesome-app

  2. Start development:
     wails dev

  3. Build for production:
     wails build
```

Follow the instructions and you're ready to go!

## Your First Dev Session

```bash
# Navigate to your project
cd my-awesome-app

# Start the dev server
wails dev
```

Your app will open in a new window with hot-reload enabled. Make changes to the code and see them instantly!

## Common First Steps

### Customize the UI

Edit the main component:
- **React**: `src/App.tsx` or `src/App.jsx`
- **Vue**: `src/App.vue`
- **Svelte**: `src/App.svelte`

### Add Backend Functionality

Edit `app.go` to add Go functions that can be called from the frontend.

### Test Your App

```bash
# Frontend tests
npm test

# Backend tests
go test ./...
```

### Build for Distribution

```bash
wails build
```

Your app will be in `build/bin/`

## Getting Help

### Something Went Wrong?

1. **Wails CLI not found**: The CLI tries to install it automatically. If that fails, see the [installation guide](https://wails.io/docs/gettingstarted/installation)

2. **Build fails**: Check you have all platform requirements:
   - Windows: WebView2
   - macOS: Xcode CLI Tools
   - Linux: GTK3 + WebKit2GTK

3. **TypeScript errors**: Run `npm install` in your project directory

### Need More Help?

- 📖 Read the full [README](README.md)
- 📚 Check [Wails Documentation](https://wails.io/docs)
- 💬 Join [Wails Discord](https://discord.gg/BrRSWTaxRK)
- 🐛 [Report an Issue](https://github.com/yourusername/create-wails-app/issues)

## What's Next?

1. **Explore the Examples**: Check [EXAMPLES.md](EXAMPLES.md) for common use cases
2. **Read Wails Docs**: Learn about the Wails runtime and APIs
3. **Build Something Cool**: Share it with the community!

---

**Pro Tip**: Start with a simple React + TypeScript app to get familiar, then add features as you need them.

Happy coding! 🚀
