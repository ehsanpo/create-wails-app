# Generated Project Examples

This document shows what generated projects look like with different configurations.

## Example 1: Basic React App

**Configuration**:
- Wails v2
- React
- TypeScript
- No extras

**Generated Structure**:
```
my-wails-app/
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── assets/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── build/
│   └── bin/                  # Built binaries (after build)
├── app.go                    # Go application logic
├── main.go                   # Main entry point
├── wails.json               # Wails configuration
└── go.mod                   # Go dependencies
```

## Example 2: Full-Featured Vue App

**Configuration**:
- Wails v2
- Vue
- TypeScript ✓
- Tailwind CSS ✓
- Router ✓
- ESLint + Prettier ✓
- GitHub Actions ✓
- System Tray ✓
- SQLite ✓
- Vitest ✓

**Generated Structure**:
```
my-app/
├── frontend/
│   ├── src/
│   │   ├── App.vue
│   │   ├── main.ts
│   │   ├── router/
│   │   │   └── index.ts
│   │   ├── components/
│   │   ├── views/
│   │   ├── index.css        # Tailwind imports
│   │   └── assets/
│   ├── tests/               # Vitest tests
│   │   └── App.spec.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .eslintrc.json
│   └── .prettierrc.json
├── .github/
│   └── workflows/
│       ├── ci.yml           # CI workflow
│       └── release.yml      # Release workflow
├── db/
│   └── schema.sql           # SQLite schema
├── build/
│   └── bin/
├── app.go                   # With system tray comments
├── main.go
├── wails.json
└── go.mod
```

## Example 3: Supabase-Connected Svelte App

**Configuration**:
- Wails v2
- Svelte
- TypeScript ✓
- Tailwind CSS ✓
- ESLint + Prettier ✓
- Supabase (Auth + Database) ✓
- Playwright ✓

**Generated Structure**:
```
my-app/
├── frontend/
│   ├── src/
│   │   ├── App.svelte
│   │   ├── main.ts
│   │   ├── lib/
│   │   │   └── supabase.ts  # Supabase client
│   │   ├── index.css
│   │   └── assets/
│   ├── e2e/                 # Playwright tests
│   │   └── example.spec.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── playwright.config.ts
│   ├── tailwind.config.js
│   ├── .eslintrc.json
│   └── .prettierrc.json
├── .env.example             # Supabase config template
├── build/
│   └── bin/
├── app.go
├── main.go
├── wails.json
└── go.mod
```

## Example 4: Production-Ready React App

**Configuration**:
- Wails v2
- React
- All frontend extras ✓
- GitHub Actions ✓
- System tray ✓
- Single instance ✓
- Auto-update ✓
- App config ✓
- SQLite ✓
- All testing ✓

**Generated Structure**:
```
my-production-app/
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── router/
│   │   │   └── index.tsx
│   │   ├── components/
│   │   ├── pages/
│   │   ├── index.css
│   │   └── assets/
│   ├── tests/               # Vitest tests
│   │   └── App.test.tsx
│   ├── e2e/                 # Playwright tests
│   │   └── app.spec.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   ├── playwright.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .eslintrc.json
│   └── .prettierrc.json
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
├── db/
│   └── schema.sql
├── build/
│   └── bin/
├── app.go                   # With all feature comments
├── main.go
├── wails.json
└── go.mod
```

## File Contents Examples

### `package.json` (with TypeScript + Tailwind + Vitest)

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.56.0",
    "postcss": "^8.4.32",
    "prettier": "^3.1.1",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.0",
    "vitest": "^1.1.0",
    "jsdom": "^23.0.1"
  }
}
```

### `tsconfig.json` (TypeScript configuration)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

### `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue,svelte}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.21'
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test
      
      - name: Run Go tests
        run: go test ./...
```

### `.github/workflows/release.yml`

```yaml
name: Build & Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    
    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.21'
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install Wails
        run: go install github.com/wailsapp/wails/v2/cmd/wails@latest
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: wails build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: my-app-${{ matrix.os }}
          path: build/bin/
  
  release:
    needs: build
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/')
    
    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v3
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            my-app-ubuntu-latest/*
            my-app-macos-latest/*
            my-app-windows-latest/*
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### `db/schema.sql` (SQLite)

```sql
-- Example SQLite Schema
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `.env.example` (Supabase)

```env
# Supabase Configuration
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
# Auth enabled
# Database enabled
```

### `src/lib/supabase.ts` (Supabase client)

```typescript
// Supabase Client Configuration
// Install: npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Comments in app.go

When features are selected, helpful comments are added:

```go
package main

import (
    "context"
    "fmt"
)

// App struct
type App struct {
    ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
    return &App{}
}

// startup is called when the app starts
func (a *App) startup(ctx context.Context) {
    a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
    return fmt.Sprintf("Hello %s, It's show time!", name)
}

// System Tray Feature
// Implement system tray functionality here
// See: https://wails.io/docs/guides/systray

// Single Instance Lock
// Implement single instance functionality to prevent multiple app instances
// Consider using: github.com/allan-simon/go-singleinstance

// Auto Update Feature
// Implement auto-update functionality using GitHub Releases
// Consider using: github.com/inconshreveable/go-update

// App Config / Settings Store
// Implement persistent settings storage
// Consider using: github.com/spf13/viper

// SQLite Database
// Local-first database support
// Consider using: github.com/mattn/go-sqlite3 or modernc.org/sqlite
```

## Summary

The CLI generates clean, well-organized projects that:

- ✅ Follow framework best practices
- ✅ Include only selected features
- ✅ Are ready to run immediately
- ✅ Have clear structure
- ✅ Include helpful comments
- ✅ Work out of the box

No manual fixes required!
