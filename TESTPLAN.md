# Test Plan - create-wails-app v0.2.0

## Overview

Comprehensive test plan to verify all features work correctly with both Wails v2 and v3, including the new main.go patching system and updated package versions.

---

## Test Matrix

### Wails Versions to Test
- ⏭️ Wails v2 (skipped for now - will be tested later)
- ✅ Wails v3 (experimental) - **PRIMARY FOCUS**

### Frontend Frameworks to Test
- ✅ React
- ✅ Vue
- ✅ Svelte
- ✅ Vanilla JS

### Feature Combinations
- Minimum viable (no extras)
- Maximum features (all enabled)
- Common real-world combinations

---

## Pre-Test Checklist

### Environment Setup
- [x] Node.js 18+ installed
- [x] Go 1.22+ installed
- [x] Wails v3 CLI installed: `go install github.com/wailsapp/wails/v3/cmd/wails3@latest`
- [x] Clean workspace (no old test projects)

### Build Verification
```bash
cd create-wails-app
npm run build
```
- [x] Build completes without errors
- [x] TypeScript compilation successful
- [x] No linting errors

---

## Test Scenarios

## Scenario 1: Minimal Setup (Wails v3, React)

**Purpose**: Verify basic project generation works

### Steps:
```bash
cd C:\Users\Ehsan\dev
Remove-Item -Recurse -Force test-minimal -ErrorAction SilentlyContinue
cd create-wails-app
node bin/run.js
```

### User Input:
- Project name: `test-minimal`
- Wails version: `Wails 3`
- Frontend: `React`
- TypeScript: `No`
- Tailwind: `No`
- Router: `No`
- ESLint/Prettier: `No`
- GitHub Actions: `No`
- App Features: `(none)`
- Data Backend: `(none)`
- Testing: `No`
- Confirm: `Yes`

### Verification:
- [x] Project created successfully
- [x] No error messages
- [x] `package.json` exists
- [x] `main.go` exists


### Build & Run:
```bash
cd ..\test-minimal
npm install
wails3 dev
```

- [x] Dependencies install successfully
- [x] Wails3 dev server starts
- [x] Application window opens
- [x] No console errors
- [x] Default UI renders

---

## Scenario 2: Maximum Features (Wails v3, React + TypeScript)

**Purpose**: Verify all features work together and main.go patching works correctly

### Steps:
```bash
cd C:\Users\Ehsan\dev
Remove-Item -Recurse -Force test-maximal -ErrorAction SilentlyContinue
cd create-wails-app
node bin/run.js
```

### User Input:
- Project name: `test-maximal`
- Wails version: `Wails 3`
- Frontend: `React`
- TypeScript: `Yes`
- Tailwind: `Yes`
- Router: `Yes`
- ESLint/Prettier: `Yes`
- GitHub Actions: `Yes`
- App Features: `ALL` (Single Instance, System Tray, Auto Update, Dialogs, Config, Deep Linking, Startup, Clipboard, File Watcher)
- Data Backend: `ALL` (SQLite, Encrypted Storage, Supabase with all options)
- Testing: `Yes` (Frontend Unit, Frontend E2E, Backend)
- Confirm: `Yes`

### Verification - Files Created:
- [ ] `package.json` with all dependencies
- [ ] `main.go` exists
- [ ] `app.go` exists
- [ ] `systray.go` exists
- [ ] `singleinstance.go` exists
- [ ] `autoupdate.go` exists
- [ ] `dialogs.go` exists
- [ ] `config.go` exists
- [ ] `deeplink.go` exists
- [ ] `startup.go` exists
- [ ] `clipboard.go` exists
- [ ] `filewatcher.go` exists
- [ ] `database.go` exists
- [ ] `secure_storage.go` exists
- [ ] `.github/workflows/ci.yml` exists
- [ ] `.github/workflows/release.yml` exists
- [ ] `src/index.css` contains `@import "tailwindcss"`
- [ ] `.eslintrc.json` exists
- [ ] `.prettierrc.json` exists
- [ ] Frontend examples directory exists

### Verification - main.go Patching:
```bash
cd ..\test-maximal
Get-Content main.go
```

- [ ] Contains system tray initialization (v3: `SystemTray.New()`)
- [ ] Contains single instance check (`initSingleInstance`)
- [ ] Contains defer cleanup (`releaseSingleInstance`)
- [ ] Contains database initialization (`InitDatabase`)
- [ ] No duplicate code
- [ ] Proper indentation

### Verification - Package Versions:
```bash
Get-Content package.json
```

- [ ] `"eslint": "^9.39.2"`
- [ ] `"prettier": "^3.7.4"`
- [ ] `"tailwindcss": "^4.1.18"`
- [ ] No `autoprefixer` dependency
- [ ] No `postcss` dependency (except if framework requires it)

### Build & Run:
```bash
npm install
wails3 dev
```

- [ ] All npm dependencies install successfully
- [ ] No peer dependency warnings
- [ ] Go dependencies download
- [ ] Wails3 dev server starts
- [ ] Application window opens
- [ ] Tailwind CSS classes work
- [ ] TypeScript compiles without errors
- [ ] ESLint runs without errors
- [ ] No console errors

### Feature Testing in App:
- [ ] System tray icon appears (check system tray)
- [ ] Only one instance can run (try launching twice)
- [ ] Dialog functions work (test native dialogs)
- [ ] Clipboard operations work
- [ ] Config save/load works

---

## Scenario 3: Tailwind v4 Specific (Wails v3, Vue)
[x] - Done all passed

**Purpose**: Verify Tailwind CSS v4 integration works correctly

### Steps:
```bash
cd C:\Users\Ehsan\dev
Remove-Item -Recurse -Force test-tailwind -ErrorAction SilentlyContinue
cd create-wails-app
node bin/run.js
```

### User Input:
- Project name: `test-tailwind`
- Wails version: `Wails 3`
- Frontend: `Vue`
- TypeScript: `Yes`
- Tailwind: `Yes`
- All other features: `No`
- Confirm: `Yes`

### Verification - Tailwind Setup:
```bash
cd ..\test-tailwind
Get-Content frontend\src\index.css
```

- [x] Contains `@import "tailwindcss";` (NOT old directives)
- [x] No `tailwind.config.js` file exists
- [x] No `postcss.config.js` in root (framework might have its own)

```bash
Get-Content package.json
```

- [x] `"tailwindcss": "^4.1.18"`
- [x] No `autoprefixer` in devDependencies
- [x] No `postcss` in devDependencies (standalone)

### Build & Verify:
```bash
npm install
wails3 dev
```

- [x] Tailwind CSS processes correctly
- [x] Utility classes work (add `class="text-3xl font-bold text-blue-500"` to test)
- [x] No build errors related to PostCSS
- [x] CSS generates correctly

---

## Scenario 4: System Tray (Wails v3)
- [x]  Done all passed
**Purpose**: Verify system tray patching works for v3

### Steps:
```bash
cd C:\Users\Ehsan\dev
Remove-Item -Recurse -Force test-tray-v3 -ErrorAction SilentlyContinue
cd create-wails-app
node bin/run.js
```

**Input**:
- Project: `test-tray-v3`
- Wails: `v3`
- Frontend: `React`
- App Features: `System Tray` only
- All others: `No`

**Verify main.go**:
```bash
cd ..\test-tray-v3
Get-Content main.go | Select-String "SystemTray"
```

- [x] Contains `systray := app.SystemTray.New()`
- [x] Contains `systray.SetLabel`
- [x] Does NOT contain `OnSystemTrayReady` (that's v2 only)
- [x] Proper formatting and indentation

**Verify systray.go exists**:
```bash
Get-Content systray.go
```

- [x] File exists
- [x] Contains tray menu setup functions
- [x] Contains `OnTrayIconLeftClick` handler
- [x] Contains `OnTrayIconRightClick` handler

**Build & Test**:
```bash
npm install
wails3 dev
```

- [x] Builds successfully
- [x] App launches
- [x] System tray icon appears
- [x] Left click shows/hides window
- [x] Right click shows menu

---

## Scenario 5: Single Instance Lock (Wails v3)
[x] - Done all passed
**Purpose**: Verify single instance lock is properly initialized

### Steps:
```bash
cd C:\Users\Ehsan\dev
Remove-Item -Recurse -Force test-single-v3 -ErrorAction SilentlyContinue
cd create-wails-app
node bin/run.js
```

**Input**:
- Project: `test-single-v3`
- Wails: `v3`
- App Features: `Single Instance` only

**Verify main.go**:
```bash
cd ..\test-single-v3
Get-Content main.go
```

- [x] Contains `if err := appInstance.initSingleInstance()`
- [x] Contains `defer appInstance.releaseSingleInstance()`
- [x] Code appears BEFORE `app.Run()`
- [x] Proper error handling (`os.Exit(1)`)
- [x] Proper indentation with tabs

**Verify singleinstance.go exists**:
```bash
Get-Content singleinstance.go
```

- [x] File exists
- [x] Contains lock file creation logic
- [x] Contains release function
- [x] Project name is correctly replaced in lock file path

**Test Runtime**:
```bash
npm install
wails3 build
Start-Process .\build\bin\test-single-v3.exe
Start-Sleep -Seconds 2
Start-Process .\build\bin\test-single-v3.exe  # Second instance
```

- [x] First instance starts successfully
- [x] Second instance shows error message and exits
- [x] Lock file created in temp directory
- [x] Lock file removed on exit

---

## Scenario 6: SQLite Database (Wails v3)
[x] - Done all passed
**Purpose**: Verify database initialization is properly patched

### Steps:
```bash
cd C:\Users\Ehsan\dev
Remove-Item -Recurse -Force test-db-v3 -ErrorAction SilentlyContinue
cd create-wails-app
node bin/run.js
```

**Input**:
- Project: `test-db-v3`
- Wails: `v3`
- Data Backend: `SQLite` only

**Verify main.go**:
```bash
cd ..\test-db-v3
Get-Content main.go | Select-String "InitDatabase"
```

- [x] Contains `InitDatabase()`
- [x] Code appears AFTER app creation
- [x] Error handling present
- [x] Proper indentation

**Verify database.go exists**:
```bash
Get-Content database.go
```

- [x] File exists
- [x] Contains `InitDatabase` function (standalone, not a method)
- [x] Contains example CRUD functions
- [x] Database path uses project name
- [x] go-sqlite3 import present
- [x] Contains CGO requirement note

**Verify schema.sql exists**:
```bash
Get-Content db\schema.sql
```

- [x] File exists in db/ directory
- [x] Contains example table schema

**Verify go.mod note**:
```bash
Get-Content go.mod | Select-String "sqlite"
```

- [x] Contains comment about adding go-sqlite3 dependency

**Build & Test**:
```bash
npm install
go get github.com/mattn/go-sqlite3@latest
wails3 dev
```

- [x] Database initializes (Note: CGO stub warning during dev is normal)
- [x] DatabaseService is bound to frontend
- [x] Frontend can call AddUser and ListUsers
- [x] UI displays database test section with user list
- [x] Can add users through the UI (will work in production build with CGO)

**Note About CGO**: SQLite requires CGO (C compiler) to work:
- During `wails3 dev`: CGO is disabled by default → Database shows stub errors (expected)
- For production builds on Windows: Requires GCC (MinGW-w64 or TDM-GCC)
  - Install MinGW-w64 from: https://winlibs.com/ (recommended) or https://www.mingw-w64.org/
  - Extract to `C:\mingw64\`
  - Add to PATH permanently: `[Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path", "User") + ";C:\mingw64\bin", "User")`
  - Restart terminal/VS Code for PATH to take effect
  - Build with: `$env:Path += ";C:\mingw64\bin"; $env:CGO_ENABLED="1"; wails3 task windows:build`
  - Run: `.\bin\test-db-v3.exe`

**Alternative**: Use a pure Go database like `modernc.org/sqlite` which doesn't require CGO.

**Production Build Test**:
- [x] MinGW-w64 GCC installed (version 15.2.0)
- [x] Added to system PATH
- [x] Build with CGO_ENABLED=1 completes successfully
- [x] Executable runs without CGO stub errors
- [x] Database can be tested in production build

**Frontend Testing**:
- [x] `database-example.js` file created in `frontend/src/`
- [x] Contains helper functions (addUser, getAllUsers)
- [x] Example UI added to App.jsx showing:
  - Form to add new users
  - List of all users from database
  - Warning message about CGO requirement
  - Helpful error handling for CGO errors

---

## Scenario 7: ESLint & Prettier (Wails v3)

**Purpose**: Verify linting and formatting work with latest versions

```bash
cd C:\Users\Ehsan\dev
Remove-Item -Recurse -Force test-lint -ErrorAction SilentlyContinue
cd create-wails-app
node bin/run.js
```

**Input**:
- Project: `test-lint`
- Wails: `v3`
- Frontend: `React`
- TypeScript: `Yes`
- ESLint/Prettier: `Yes`

**Verify**:
```bash
cd ..\frontend\test-lint
npm install

# Check versions
npm list eslint prettier
```

- [x] ESLint version is 9.39.2
- [x] Prettier version is 3.7.4

```bash
# Test linting
npx eslint .
```

- [x] ESLint runs successfully (with 0 or expected errors)
- [x] No "module not found" errors
- [x] Works with TypeScript files

```bash
# Test formatting
npx prettier --check .
```

- [x] Prettier runs successfully
- [x] No fatal errors
- [x] Formats TypeScript files correctly

---

## Scenario 8: Multiple Features Combination (Wails v3)

**Purpose**: Verify features don't conflict when combined

### Combination Tests:

#### Test 8A: System Tray + Single Instance + Database
```bash
cd C:\Users\Ehsan\dev
Remove-Item -Recurse -Force test-combo-a -ErrorAction SilentlyContinue
cd create-wails-app
node bin/run.js
```

**Input**:
- Project: `test-combo-a`
- Wails: `v3`
- App Features: `System Tray`, `Single Instance`
- Data Backend: `SQLite`

**Verify main.go**:
```bash
cd ..\test-combo-a
Get-Content main.go
```

- [ ] All three features initialize correctly
- [ ] No duplicate code
- [ ] Proper initialization order:
  1. Single instance check (before app creation)
  2. Database init (after app creation)
  3. System tray (after app creation)
- [ ] All defer statements present
- [ ] Proper indentation throughout

#### Test 8B: TypeScript + Tailwind + ESLint (Wails v3)
```bash
cd C:\Users\Ehsan\dev
Remove-Item -Recurse -Force test-combo-b -ErrorAction SilentlyContinue
cd create-wails-app
node bin/run.js
```

**Input**:
- Project: `test-combo-b`
- Wails: `v3`
- Frontend: `React`
- TypeScript: `Yes`
- Tailwind: `Yes`
- ESLint/Prettier: `Yes`

**Verify**:
- [x] TypeScript compiles successfully
- [x] Tailwind CSS processes with TypeScript
- [x] ESLint works with TypeScript files
- [x] No configuration conflicts
- [x] All packages install cleanly

**Build Test**:
```bash
cd ..\test-combo-b
npm install
wails3 dev
```

- [x] No build errors
- [x] TypeScript compilation succeeds
- [x] Tailwind utilities work
- [x] ESLint passes

---

## Scenario 9: Different Frontend Frameworks (Wails v3)

### Test Each Framework:

#### 9A: React + TypeScript
```bash
cd C:\Users\Ehsan\dev
Remove-Item -Recurse -Force test-react -ErrorAction SilentlyContinue
cd create-wails-app
node bin/run.js
```

**Input**:
- Project: `test-react`
- Wails: `v3`
- Frontend: `React`
- TypeScript: `Yes`
- Tailwind: `Yes`
- Router: `Yes`

**Verify**:
```bash
cd ..\test-react
npm install
wails3 dev
```

- [ ] Project generates
- [ ] TypeScript option works
- [ ] Tailwind integrates correctly
- [ ] Router integrates correctly
- [ ] Dev server runs
- [ ] React components render

#### 9B: Vue + TypeScript
```bash
cd C:\Users\Ehsan\dev
Remove-Item -Recurse -Force test-vue -ErrorAction SilentlyContinue
cd create-wails-app
node bin/run.js
```

**Input**:
- Project: `test-vue`
- Wails: `v3`
- Frontend: `Vue`
- TypeScript: `Yes`
- Tailwind: `Yes`
- Router: `Yes`

**Verify**:
```bash
cd ..\test-vue
npm install
wails3 dev
```

- [ ] Project generates
- [ ] TypeScript option works
- [ ] Tailwind integrates correctly
- [ ] Vue Router integrates correctly
- [ ] Dev server runs
- [ ] Vue components render

#### 9C: Svelte + TypeScript
```bash
cd C:\Users\Ehsan\dev
Remove-Item -Recurse -Force test-svelte -ErrorAction SilentlyContinue
cd create-wails-app
node bin/run.js
```

**Input**:
- Project: `test-svelte`
- Wails: `v3`
- Frontend: `Svelte`
- TypeScript: `Yes`
- Tailwind: `Yes`
- Router: `Yes`

**Verify**:
```bash
cd ..\test-svelte
npm install
wails3 dev
```

- [ ] Project generates
- [ ] TypeScript option works
- [ ] Tailwind integrates correctly
- [ ] Svelte Router integrates correctly
- [ ] Dev server runs
- [ ] Svelte components render

#### 9D: Vanilla + TypeScript
```bash
cd C:\Users\Ehsan\dev
Remove-Item -Recurse -Force test-vanilla -ErrorAction SilentlyContinue
cd create-wails-app
node bin/run.js
```

**Input**:
- Project: `test-vanilla`
- Wails: `v3`
- Frontend: `Vanilla`
- TypeScript: `Yes`
- Tailwind: `Yes`

**Verify**:
```bash
cd ..\test-vanilla
npm install
wails3 dev
```

- [ ] Project generates
- [ ] TypeScript option works
- [ ] Tailwind integrates correctly
- [ ] Dev server runs
- [ ] Basic JS/TS works

---

## Scenario 10: GitHub Actions (Wails v3)

**Purpose**: Verify CI/CD workflows are created correctly for v3

```bash
cd C:\Users\Ehsan\dev
Remove-Item -Recurse -Force test-actions -ErrorAction SilentlyContinue
cd create-wails-app
node bin/run.js
```

**Input**:
- Project: `test-actions`
- Wails: `v3`
- GitHub Actions: `Yes`

**Verify**:
```bash
cd ..\test-actions
Get-ChildItem .github\workflows
```

- [ ] `ci.yml` exists
- [ ] `release.yml` exists

```bash
Get-Content .github\workflows\ci.yml
```

- [ ] Contains correct Go version (1.22+)
- [ ] Contains correct Node.js version (18+)
- [ ] Contains `wails3` CLI installation (not `wails`)
- [ ] Platform matrix includes Windows, macOS, Linux
- [ ] Uses correct build command for v3

```bash
Get-Content .github\workflows\release.yml
```

- [ ] Configured for v3 build process
- [ ] Correct artifact naming
- [ ] Release automation works

---

## Edge Cases & Error Handling

### Test 11: Existing Directory
```bash
cd C:\Users\Ehsan\dev
mkdir test-exists
cd create-wails-app
node bin/run.js
```

**Input**: Project name `test-exists`

- [ ] Shows error about existing directory
- [ ] Exits gracefully
- [ ] Does not overwrite existing files

### Test 12: Invalid Project Name
- [ ] Test with spaces: `my project`
- [ ] Test with special chars: `my@project`
- [ ] Verify proper validation or sanitization

### Test 13: Cancelled Generation
- [ ] Start project generation
- [ ] Select `No` at confirmation
- [ ] Verify no files created
- [ ] Clean exit

### Test 14: Wails v3 CLI Not Installed
- [ ] Temporarily rename Wails3 CLI
- [ ] Run generator and select Wails 3
- [ ] Verify helpful error message
- [ ] Verify installation instructions shown
- [ ] Instructions mention `wails3` specifically

---

## Performance Tests

### Test 15: Generation Speed
- [ ] Time minimal project generation (should be < 30 seconds)
- [ ] Time maximal project generation (should be < 2 minutes)
- [ ] No hanging or freezing

### Test 16: Build Performance
- [ ] Minimal project builds in reasonable time
- [ ] Maximal project builds in reasonable time
- [ ] No excessive CPU/memory usage

---

## Documentation Verification

### Test 17: Generated Documentation
For a project with multiple features:

- [ ] README files created for enabled features
- [ ] SYSTEM_TRAY.md exists (if selected)
- [ ] DATABASE.md exists (if selected)
- [ ] CONFIG.md exists (if selected)
- [ ] Documentation is accurate and helpful

---

## Regression Tests

### Test 18: Previous Version Compatibility
- [ ] Projects generated with old version still build (if applicable)
- [ ] Migration path documented (if breaking changes)

---

## Post-Test Cleanup

```bash
cd C:\Users\Ehsan\dev
Remove-Item -Recurse -Force test-* -ErrorAction SilentlyContinue
```

---

## Success Criteria

### Must Pass (Wails v3 Only):
- ✅ All Scenario 1-10 tests pass for Wails v3
- ✅ Wails v3 works correctly with all features
- ✅ main.go patching works for all v3 features
- ✅ Tailwind v4 integration works
- ✅ Latest package versions install correctly
- ✅ No TypeScript compilation errors
- ✅ No runtime errors in generated projects

### Should Pass:
- ✅ Edge cases handled gracefully
- ✅ Documentation is accurate
- ✅ Performance is acceptable

### Nice to Have:
- ✅ All frontend frameworks tested with v3
- ✅ Complex feature combinations work
- ✅ Cross-platform testing (Windows/macOS/Linux)

### Deferred (Wails v2):
- ⏭️ Wails v2 testing will be done in a future phase
- ⏭️ v2-specific features will be validated separately

---

## Bug Reporting Template

If a test fails, document:

```markdown
### Bug: [Short Description]

**Test Scenario**: [Scenario number and name]
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**:


**Actual Result**:


**Error Messages**:
```
[paste error]
```

**Environment**:
- OS: 
- Node.js: 
- Go: 
- Wails: 

**Files to Review**:
- 
```

---

## Quick Test Script

For rapid testing, use this PowerShell script:

```powershell
# quick-test.ps1
$scenarios = @(
    @{name="minimal-v3"; features="none"},
    @{name="maximal-v3"; features="all"},
    @{name="tailwind-v3"; features="tailwind-only"}
)

foreach ($scenario in $scenarios) {
    Write-Host "Testing: $($scenario.name)" -ForegroundColor Cyan
    cd C:\Users\Ehsan\dev
    Remove-Item -Recurse -Force "test-$($scenario.name)" -ErrorAction SilentlyContinue
    
    cd create-wails-app
    # Run node bin/run.js with automated inputs
    # (requires expect-like tool or manual testing)
    
    cd ..\test-$($scenario.name)
    npm install
    
    if ($?) {
        Write-Host "✅ $($scenario.name) PASSED" -ForegroundColor Green
    } else {
        Write-Host "❌ $($scenario.name) FAILED" -ForegroundColor Red
    }
}
```

---

## Test Results Template

```markdown
# Test Results - [Date]

**Tester**: 
**Version**: v0.2.0
**Duration**: 

## Summary
- Total Tests: 
- Passed: ✅
- Failed: ❌
- Skipped: ⏭️

## Details

| Scenario | Status | Notes |
|----------|--------|-------|
| 1. Minimal v2 | ✅ | |
| 2. Maximal v3 | ✅ | |
| 3. Tailwind v4 | ✅ | |
| ... | | |

## Issues Found
1. 
2. 

## Recommendations
1. 
2. 
```
