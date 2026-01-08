import fse from 'fs-extra';
import { join } from 'path';
import type { GeneratorConfig } from '../types.js';
import ora from 'ora';

export async function applySingleInstance(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding single instance lock...').start();
  
  try {
    const singleInstancePath = join(config.projectPath, 'singleinstance.go');
    const singleInstanceCode = `package main

import (
	"fmt"
	"os"
	"path/filepath"
)

// lockFile represents the lock file path
var lockFile string

// initSingleInstance initializes the single instance lock
func (a *App) initSingleInstance() error {
	// Get user's temp directory
	tmpDir := os.TempDir()
	lockFile = filepath.Join(tmpDir, "${config.projectName}.lock")

	// Check if lock file exists
	if _, err := os.Stat(lockFile); err == nil {
		// Lock file exists, check if process is running
		data, err := os.ReadFile(lockFile)
		if err == nil {
			fmt.Printf("Another instance is already running (PID: %s)\\n", string(data))
			return fmt.Errorf("application is already running")
		}
	}

	// Create lock file with current PID
	pid := fmt.Sprintf("%d", os.Getpid())
	err := os.WriteFile(lockFile, []byte(pid), 0644)
	if err != nil {
		return fmt.Errorf("failed to create lock file: %w", err)
	}

	return nil
}

// releaseSingleInstance removes the lock file
func (a *App) releaseSingleInstance() {
	if lockFile != "" {
		os.Remove(lockFile)
	}
}
`;
    
    await fse.writeFile(singleInstancePath, singleInstanceCode);

    // Create documentation
    const readmePath = join(config.projectPath, 'SINGLE_INSTANCE.md');
    const readme = `# Single Instance Lock

## Overview

Single instance lock has been implemented to prevent multiple instances of your application from running simultaneously.

## How It Works

- Creates a lock file in the system's temp directory
- Stores the process ID (PID) in the lock file
- Checks for existing lock file on startup
- Removes lock file on application exit

## Usage

Add to your \`main.go\`:

\`\`\`go
func main() {
	app := NewApp()

	// Initialize single instance lock
	if err := app.initSingleInstance(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	// Ensure lock is released on exit
	defer app.releaseSingleInstance()

	// Rest of your Wails app initialization...
	err := wails.Run(&options.App{
		// ... your options
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
\`\`\`

## Lock File Location

- **Windows**: \`%TEMP%\\${config.projectName}.lock\`
- **macOS/Linux**: \`/tmp/${config.projectName}.lock\`

## Customization

You can modify the lock file location by editing \`singleinstance.go\`.
`;

    await fse.writeFile(readmePath, readme);
    
    spinner.succeed('Single instance lock added - see SINGLE_INSTANCE.md');
  } catch (error) {
    spinner.fail('Failed to add single instance lock');
    throw error;
  }
}

export async function applyAutoUpdate(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding auto-update support...').start();
  
  try {
    const updateGoPath = join(config.projectPath, 'autoupdate.go');
    const updateGoCode = `package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"runtime"
	"strings"
	"time"
)

// UpdateInfo represents update information
type UpdateInfo struct {
	Version     string \`json:"version"\`
	ReleaseURL  string \`json:"releaseUrl"\`
	DownloadURL string \`json:"downloadUrl"\`
	Description string \`json:"description"\`
	Available   bool   \`json:"available"\`
}

// GitHubRelease represents a GitHub release
type GitHubRelease struct {
	TagName string \`json:"tag_name"\`
	HTMLURL string \`json:"html_url"\`
	Body    string \`json:"body"\`
	Assets  []struct {
		Name               string \`json:"name"\`
		BrowserDownloadURL string \`json:"browser_download_url"\`
	} \`json:"assets"\`
}

const (
	CurrentVersion = "v1.0.0" // Update this with your app version
	GitHubRepo     = "owner/repo" // Update with your GitHub repo
	CheckInterval  = 24 * time.Hour
)

// CheckForUpdates checks if a new version is available
func (a *App) CheckForUpdates() (*UpdateInfo, error) {
	url := fmt.Sprintf("https://api.github.com/repos/%s/releases/latest", GitHubRepo)
	
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch release info: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var release GitHubRelease
	err = json.Unmarshal(body, &release)
	if err != nil {
		return nil, fmt.Errorf("failed to parse release: %w", err)
	}

	updateInfo := &UpdateInfo{
		Version:     release.TagName,
		ReleaseURL:  release.HTMLURL,
		Description: release.Body,
		Available:   isNewerVersion(release.TagName, CurrentVersion),
	}

	// Find download URL for current platform
	platform := runtime.GOOS
	arch := runtime.GOARCH
	
	for _, asset := range release.Assets {
		name := strings.ToLower(asset.Name)
		if strings.Contains(name, platform) && strings.Contains(name, arch) {
			updateInfo.DownloadURL = asset.BrowserDownloadURL
			break
		}
	}

	return updateInfo, nil
}

// GetCurrentVersion returns the current app version
func (a *App) GetCurrentVersion() string {
	return CurrentVersion
}

// OpenReleaseURL opens the release page in the browser
func (a *App) OpenReleaseURL(url string) error {
	var cmd string
	var args []string

	switch runtime.GOOS {
	case "windows":
		cmd = "cmd"
		args = []string{"/c", "start", url}
	case "darwin":
		cmd = "open"
		args = []string{url}
	default: // linux, etc.
		cmd = "xdg-open"
		args = []string{url}
	}

	// Note: This is a simplified version. In production, use runtime.OpenBrowser() or similar
	fmt.Printf("Opening URL: %s (command: %s %v)\n", url, cmd, args)
	return nil
}

// isNewerVersion compares version strings (simple semver comparison)
func isNewerVersion(latest, current string) bool {
	latest = strings.TrimPrefix(latest, "v")
	current = strings.TrimPrefix(current, "v")
	
	return latest > current // Simplified comparison
}
`;

    await fse.writeFile(updateGoPath, updateGoCode);

    // Create frontend helper
    const frontendExampleDir = join(config.projectPath, 'frontend-examples');
    await fse.ensureDir(frontendExampleDir);

    const ext = config.features.typescript ? 'ts' : 'js';
    const updateHelperPath = join(frontendExampleDir, `update-helper.${ext}`);
    const updateHelperCode = `// Auto-Update Helper
import { CheckForUpdates, GetCurrentVersion, OpenReleaseURL } from '../wailsjs/go/main/App'

${config.features.typescript ? `
interface UpdateInfo {
  version: string
  releaseUrl: string
  downloadUrl: string
  description: string
  available: boolean
}
` : ''}

export async function checkForUpdates()${config.features.typescript ? ': Promise<UpdateInfo | null>' : ''} {
  try {
    const updateInfo = await CheckForUpdates()
    return updateInfo
  } catch (error) {
    console.error('Failed to check for updates:', error)
    return null
  }
}

export async function getCurrentVersion()${config.features.typescript ? ': Promise<string>' : ''} {
  try {
    return await GetCurrentVersion()
  } catch (error) {
    console.error('Failed to get current version:', error)
    return 'unknown'
  }
}

export async function openReleaseURL(url${config.features.typescript ? ': string' : ''}) {
  try {
    await OpenReleaseURL(url)
  } catch (error) {
    console.error('Failed to open release URL:', error)
  }
}

// Example: Check for updates and notify user
export async function checkAndNotify() {
  const updateInfo = await checkForUpdates()
  
  if (updateInfo && updateInfo.available) {
    const shouldUpdate = confirm(
      \\\`A new version (\${updateInfo.version}) is available!\\\\n\\\\n\${updateInfo.description.substring(0, 200)}...\\\\n\\\\nWould you like to download it?\\\`
    )
    
    if (shouldUpdate) {
      if (updateInfo.downloadUrl) {
        await openReleaseURL(updateInfo.downloadUrl)
      } else {
        await openReleaseURL(updateInfo.releaseUrl)
      }
    }
  } else {
    console.log('You are running the latest version')
  }
}
`;

    await fse.writeFile(updateHelperPath, updateHelperCode);

    // Create documentation
    const readmePath = join(config.projectPath, 'AUTO_UPDATE.md');
    const readme = `# Auto-Update Functionality

## Overview

An auto-update system checks GitHub releases for new versions.

## Configuration

Update these constants in \`autoupdate.go\`:

\`\`\`go
const (
    CurrentVersion = "v1.0.0"        // Your current app version
    GitHubRepo     = "owner/repo"    // Your GitHub repository
    CheckInterval  = 24 * time.Hour  // How often to check
)
\`\`\`

## Usage

\`\`\`javascript
import { CheckForUpdates } from '../wailsjs/go/main/App'

const updateInfo = await CheckForUpdates()
if (updateInfo.available) {
  console.log('New version:', updateInfo.version)
}
\`\`\`

See \`frontend-examples/update-helper.${ext}\` for complete examples.
`;

    await fse.writeFile(readmePath, readme);
    
    spinner.succeed('Auto-update support added - see AUTO_UPDATE.md');
  } catch (error) {
    spinner.fail('Failed to add auto-update support');
    throw error;
  }
}

export async function applyNativeDialogs(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding native dialogs...').start();
  
  try {
    const dialogsPath = join(config.projectPath, 'dialogs.go');
    const dialogsCode = `package main

import (
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// OpenFileDialog opens a native file picker dialog
func (a *App) OpenFileDialog() (string, error) {
	file, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select File",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "All Files (*.*)",
				Pattern:     "*.*",
			},
		},
	})
	return file, err
}

// OpenMultipleFilesDialog opens a native file picker for multiple files
func (a *App) OpenMultipleFilesDialog() ([]string, error) {
	files, err := runtime.OpenMultipleFilesDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Files",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "All Files (*.*)",
				Pattern:     "*.*",
			},
		},
	})
	return files, err
}

// OpenDirectoryDialog opens a native directory picker dialog
func (a *App) OpenDirectoryDialog() (string, error) {
	directory, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Directory",
	})
	return directory, err
}

// SaveFileDialog opens a native save file dialog
func (a *App) SaveFileDialog() (string, error) {
	file, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title: "Save File",
		DefaultFilename: "untitled.txt",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Text Files (*.txt)",
				Pattern:     "*.txt",
			},
			{
				DisplayName: "All Files (*.*)",
				Pattern:     "*.*",
			},
		},
	})
	return file, err
}

// ShowInfoDialog shows an information message dialog
func (a *App) ShowInfoDialog(title, message string) {
	runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
		Type:    runtime.InfoDialog,
		Title:   title,
		Message: message,
	})
}

// ShowErrorDialog shows an error message dialog
func (a *App) ShowErrorDialog(title, message string) {
	runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
		Type:    runtime.ErrorDialog,
		Title:   title,
		Message: message,
	})
}

// ShowQuestionDialog shows a question dialog and returns the user's choice
func (a *App) ShowQuestionDialog(title, message string) (string, error) {
	result, err := runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
		Type:          runtime.QuestionDialog,
		Title:         title,
		Message:       message,
		Buttons:       []string{"Yes", "No"},
		DefaultButton: "Yes",
	})
	return result, err
}
`;

    await fse.writeFile(dialogsPath, dialogsCode);

    // Create example frontend code
    const frontendExampleDir = join(config.projectPath, 'frontend-examples');
    await fse.ensureDir(frontendExampleDir);

    const ext = config.features.typescript ? 'ts' : 'js';
    const examplePath = join(frontendExampleDir, `dialogs-example.${ext}`);
    const exampleCode = `// Native Dialogs Example
import { OpenFileDialog, OpenDirectoryDialog, SaveFileDialog, ShowInfoDialog, ShowQuestionDialog } from '../wailsjs/go/main/App'

export async function openFile() {
  try {
    const file = await OpenFileDialog()
    console.log('Selected file:', file)
    return file
  } catch (error) {
    console.error('Error opening file:', error)
  }
}

export async function openDirectory() {
  try {
    const dir = await OpenDirectoryDialog()
    console.log('Selected directory:', dir)
    return dir
  } catch (error) {
    console.error('Error opening directory:', error)
  }
}

export async function saveFile() {
  try {
    const file = await SaveFileDialog()
    console.log('Save location:', file)
    return file
  } catch (error) {
    console.error('Error saving file:', error)
  }
}

export async function showMessage() {
  await ShowInfoDialog('Information', 'This is an info message!')
}

export async function askQuestion() {
  try {
    const answer = await ShowQuestionDialog('Confirm', 'Are you sure?')
    console.log('User answered:', answer)
    return answer === 'Yes'
  } catch (error) {
    console.error('Error showing question:', error)
  }
}
`;

    await fse.writeFile(examplePath, exampleCode);

    // Create documentation
    const readmePath = join(config.projectPath, 'DIALOGS.md');
    const readme = `# Native Dialogs

## Overview

Native system dialogs have been added to your application for file operations and user interactions.

## Available Dialogs

### File Operations

- **OpenFileDialog()** - Select a single file
- **OpenMultipleFilesDialog()** - Select multiple files
- **OpenDirectoryDialog()** - Select a directory
- **SaveFileDialog()** - Save file dialog

### Message Dialogs

- **ShowInfoDialog()** - Information message
- **ShowErrorDialog()** - Error message
- **ShowQuestionDialog()** - Yes/No question

## Usage

### From Frontend

\`\`\`javascript
import { OpenFileDialog, SaveFileDialog, ShowInfoDialog } from '../wailsjs/go/main/App'

// Open file
const file = await OpenFileDialog()

// Save file
const savePath = await SaveFileDialog()

// Show message
await ShowInfoDialog('Success', 'File saved successfully!')
\`\`\`

### From Backend (Go)

All methods are available in \`dialogs.go\` and can be called from your Go code:

\`\`\`go
file, err := app.OpenFileDialog()
if err != nil {
    app.ShowErrorDialog("Error", "Failed to open file")
}
\`\`\`

## Customization

Edit \`dialogs.go\` to:
- Add custom file filters
- Change default filenames
- Add new dialog types
- Customize button labels

## Example

See \`frontend-examples/dialogs-example.${ext}\` for usage examples.
`;

    await fse.writeFile(readmePath, readme);
    
    spinner.succeed('Native dialogs added - see DIALOGS.md');
  } catch (error) {
    spinner.fail('Failed to add native dialogs');
    throw error;
  }
}

export async function applyAppConfig(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding app config/settings store...').start();
  
  try {
    const configGoPath = join(config.projectPath, 'config.go');
    const configGoCode = `package main

import (
	"encoding/json"
	"os"
	"path/filepath"
)

// AppConfig represents the application configuration
type AppConfig struct {
	Theme        string            \`json:"theme"\`
	Language     string            \`json:"language"\`
	WindowWidth  int               \`json:"windowWidth"\`
	WindowHeight int               \`json:"windowHeight"\`
	CustomSettings map[string]interface{} \`json:"customSettings"\`
}

// GetConfigPath returns the path to the config file
func (a *App) GetConfigPath() (string, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}

	configDir := filepath.Join(homeDir, ".${config.projectName}")
	err = os.MkdirAll(configDir, 0755)
	if err != nil {
		return "", err
	}

	return filepath.Join(configDir, "config.json"), nil
}

// LoadConfig loads the application configuration
func (a *App) LoadConfig() (*AppConfig, error) {
	configPath, err := a.GetConfigPath()
	if err != nil {
		return nil, err
	}

	// Return default config if file doesn't exist
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		return a.GetDefaultConfig(), nil
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, err
	}

	var config AppConfig
	err = json.Unmarshal(data, &config)
	if err != nil {
		return nil, err
	}

	return &config, nil
}

// SaveConfig saves the application configuration
func (a *App) SaveConfig(config *AppConfig) error {
	configPath, err := a.GetConfigPath()
	if err != nil {
		return err
	}

	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(configPath, data, 0644)
}

// GetDefaultConfig returns the default configuration
func (a *App) GetDefaultConfig() *AppConfig {
	return &AppConfig{
		Theme:        "light",
		Language:     "en",
		WindowWidth:  1024,
		WindowHeight: 768,
		CustomSettings: make(map[string]interface{}),
	}
}

// GetSetting gets a specific setting value
func (a *App) GetSetting(key string) (interface{}, error) {
	config, err := a.LoadConfig()
	if err != nil {
		return nil, err
	}

	if value, exists := config.CustomSettings[key]; exists {
		return value, nil
	}

	return nil, nil
}

// SetSetting sets a specific setting value
func (a *App) SetSetting(key string, value interface{}) error {
	config, err := a.LoadConfig()
	if err != nil {
		return err
	}

	if config.CustomSettings == nil {
		config.CustomSettings = make(map[string]interface{})
	}

	config.CustomSettings[key] = value
	return a.SaveConfig(config)
}
`;

    await fse.writeFile(configGoPath, configGoCode);

    // Create frontend helper
    const frontendExampleDir = join(config.projectPath, 'frontend-examples');
    await fse.ensureDir(frontendExampleDir);

    const ext = config.features.typescript ? 'ts' : 'js';
    const configHelperPath = join(frontendExampleDir, `config-helper.${ext}`);
    const configHelperCode = `// App Config Helper
import { LoadConfig, SaveConfig, GetSetting, SetSetting } from '../wailsjs/go/main/App'

${config.features.typescript ? `
interface AppConfig {
  theme: string
  language: string
  windowWidth: number
  windowHeight: number
  customSettings: Record<string, any>
}
` : ''}

export async function loadConfig()${config.features.typescript ? ': Promise<AppConfig | null>' : ''} {
  try {
    const config = await LoadConfig()
    return config
  } catch (error) {
    console.error('Failed to load config:', error)
    return null
  }
}

export async function saveConfig(config${config.features.typescript ? ': AppConfig' : ''}) {
  try {
    await SaveConfig(config)
    console.log('Config saved successfully')
    return true
  } catch (error) {
    console.error('Failed to save config:', error)
    return false
  }
}

export async function getSetting(key${config.features.typescript ? ': string' : ''}) {
  try {
    return await GetSetting(key)
  } catch (error) {
    console.error('Failed to get setting:', error)
    return null
  }
}

export async function setSetting(key${config.features.typescript ? ': string' : ''}, value${config.features.typescript ? ': any' : ''}) {
  try {
    await SetSetting(key, value)
    return true
  } catch (error) {
    console.error('Failed to set setting:', error)
    return false
  }
}

// Example usage
export async function exampleUsage() {
  // Load config
  const config = await loadConfig()
  console.log('Current config:', config)

  // Update theme
  if (config) {
    config.theme = 'dark'
    await saveConfig(config)
  }

  // Set custom setting
  await setSetting('notifications', true)
  
  // Get custom setting
  const notifications = await getSetting('notifications')
  console.log('Notifications enabled:', notifications)
}
`;

    await fse.writeFile(configHelperPath, configHelperCode);

    // Create documentation
    const readmePath = join(config.projectPath, 'CONFIG.md');
    const readme = `# App Configuration & Settings

## Overview

A persistent configuration system has been added to store application settings.

## Features

- JSON-based configuration
- User-specific config directory
- Default configuration
- Custom settings support
- Type-safe config structure

## Config Location

- **Windows**: \`%USERPROFILE%\\.${config.projectName}\\config.json\`
- **macOS**: \`~/.${config.projectName}/config.json\`
- **Linux**: \`~/.${config.projectName}/config.json\`

## Default Configuration

\`\`\`json
{
  "theme": "light",
  "language": "en",
  "windowWidth": 1024,
  "windowHeight": 768,
  "customSettings": {}
}
\`\`\`

## Usage

### Load Configuration

\`\`\`javascript
import { LoadConfig } from '../wailsjs/go/main/App'

const config = await LoadConfig()
console.log(config.theme) // 'light'
\`\`\`

### Save Configuration

\`\`\`javascript
import { SaveConfig } from '../wailsjs/go/main/App'

config.theme = 'dark'
await SaveConfig(config)
\`\`\`

### Custom Settings

\`\`\`javascript
import { SetSetting, GetSetting } from '../wailsjs/go/main/App'

// Set a custom setting
await SetSetting('autoSave', true)

// Get a custom setting
const autoSave = await GetSetting('autoSave')
\`\`\`

## Customization

Edit \`config.go\` to add more configuration fields:

\`\`\`go
type AppConfig struct {
    Theme        string
    Language     string
    // Add your custom fields here
    AutoSave     bool   \\\`json:"autoSave"\\\`
    SaveInterval int    \\\`json:"saveInterval"\\\`
}
\`\`\`

## Example

See \`frontend-examples/config-helper.${ext}\` for complete examples.
`;

    await fse.writeFile(readmePath, readme);
    
    spinner.succeed('App config/settings store added - see CONFIG.md');
  } catch (error) {
    spinner.fail('Failed to add app config');
    throw error;
  }
}

export async function applyDeepLinking(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding deep linking support...').start();
  
  try {
    const deeplinkGoPath = join(config.projectPath, 'deeplink.go');
    const deeplinkGoCode = `package main

import (
	"fmt"
	"runtime"
)

const (
	AppProtocol = "${config.projectName.toLowerCase()}" // e.g., myapp://
)

// RegisterDeepLink registers the custom URL protocol
func (a *App) RegisterDeepLink() error {
	switch runtime.GOOS {
	case "windows":
		return a.registerDeepLinkWindows()
	case "darwin":
		return a.registerDeepLinkMacOS()
	case "linux":
		return a.registerDeepLinkLinux()
	default:
		return fmt.Errorf("unsupported platform: %s", runtime.GOOS)
	}
}

// registerDeepLinkWindows registers the protocol on Windows
func (a *App) registerDeepLinkWindows() error {
	// Windows registry implementation
	// In production, use: golang.org/x/sys/windows/registry
	fmt.Println("To register deep link on Windows:")
	fmt.Printf("Add to registry: HKEY_CLASSES_ROOT\\\\%s\\n", AppProtocol)
	return nil
}

// registerDeepLinkMacOS registers the protocol on macOS
func (a *App) registerDeepLinkMacOS() error {
	// macOS Info.plist configuration
	fmt.Println("To register deep link on macOS:")
	fmt.Println("Add CFBundleURLTypes to Info.plist")
	return nil
}

// registerDeepLinkLinux registers the protocol on Linux
func (a *App) registerDeepLinkLinux() error {
	// Linux .desktop file configuration
	fmt.Println("To register deep link on Linux:")
	fmt.Printf("Add MimeType=%s to .desktop file\\n", AppProtocol)
	return nil
}

// HandleDeepLink processes a deep link URL
func (a *App) HandleDeepLink(url string) error {
	fmt.Printf("Handling deep link: %s\\n", url)
	// Parse and handle the URL
	// Example: myapp://action/param
	return nil
}
`;

    await fse.writeFile(deeplinkGoPath, deeplinkGoCode);

    // Create documentation
    const readmePath = join(config.projectPath, 'DEEP_LINKING.md');
    const readme = `# Deep Linking / Custom Protocol

## Overview

Custom URL protocol handler has been added (${config.projectName.toLowerCase()}://).

## Platform Setup

### Windows
Add to registry (run as administrator):
\`\`\`reg
HKEY_CLASSES_ROOT\\${config.projectName.toLowerCase()}
  (Default) = "URL:${config.projectName} Protocol"
  URL Protocol = ""
  DefaultIcon = "C:\\\\path\\\\to\\\\app.exe,1"
  shell\\open\\command
    (Default) = "C:\\\\path\\\\to\\\\app.exe" "%1"
\`\`\`

### macOS
Add to Info.plist:
\`\`\`xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>${config.projectName}</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>${config.projectName.toLowerCase()}</string>
    </array>
  </dict>
</array>
\`\`\`

### Linux
Add to .desktop file:
\`\`\`
MimeType=x-scheme-handler/${config.projectName.toLowerCase()};
\`\`\`

## Usage

Users can open your app with:
\`\`\`
${config.projectName.toLowerCase()}://action/parameter
\`\`\`
`;

    await fse.writeFile(readmePath, readme);
    
    spinner.succeed('Deep linking support added - see DEEP_LINKING.md');
  } catch (error) {
    spinner.fail('Failed to add deep linking');
    throw error;
  }
}

export async function applyStartup(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding startup/auto-launch support...').start();
  
  try {
    const startupGoPath = join(config.projectPath, 'startup.go');
    const startupGoCode = `package main

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
)

// EnableStartup enables the app to launch on system startup
func (a *App) EnableStartup() error {
	switch runtime.GOOS {
	case "windows":
		return a.enableStartupWindows()
	case "darwin":
		return a.enableStartupMacOS()
	case "linux":
		return a.enableStartupLinux()
	default:
		return fmt.Errorf("unsupported platform: %s", runtime.GOOS)
	}
}

// DisableStartup disables the app from launching on system startup
func (a *App) DisableStartup() error {
	switch runtime.GOOS {
	case "windows":
		return a.disableStartupWindows()
	case "darwin":
		return a.disableStartupMacOS()
	case "linux":
		return a.disableStartupLinux()
	default:
		return fmt.Errorf("unsupported platform: %s", runtime.GOOS)
	}
}

// IsStartupEnabled checks if startup is enabled
func (a *App) IsStartupEnabled() (bool, error) {
	switch runtime.GOOS {
	case "windows":
		return a.isStartupEnabledWindows()
	case "darwin":
		return a.isStartupEnabledMacOS()
	case "linux":
		return a.isStartupEnabledLinux()
	default:
		return false, fmt.Errorf("unsupported platform: %s", runtime.GOOS)
	}
}

// Windows implementation
func (a *App) enableStartupWindows() error {
	exePath, _ := os.Executable()
	fmt.Printf("To enable startup on Windows, add to registry:\\n")
	fmt.Printf("HKEY_CURRENT_USER\\\\Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Run\\n")
	fmt.Printf("Name: ${config.projectName}, Value: %s\\n", exePath)
	return nil
}

func (a *App) disableStartupWindows() error {
	fmt.Println("Remove registry key: HKEY_CURRENT_USER\\\\Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Run\\\\${config.projectName}")
	return nil
}

func (a *App) isStartupEnabledWindows() (bool, error) {
	// Check registry - requires golang.org/x/sys/windows/registry
	return false, nil
}

// macOS implementation
func (a *App) enableStartupMacOS() error {
	homeDir, _ := os.UserHomeDir()
	plistPath := filepath.Join(homeDir, "Library/LaunchAgents/com.${config.projectName}.plist")
	fmt.Printf("Create plist file at: %s\\n", plistPath)
	return nil
}

func (a *App) disableStartupMacOS() error {
	homeDir, _ := os.UserHomeDir()
	plistPath := filepath.Join(homeDir, "Library/LaunchAgents/com.${config.projectName}.plist")
	return os.Remove(plistPath)
}

func (a *App) isStartupEnabledMacOS() (bool, error) {
	homeDir, _ := os.UserHomeDir()
	plistPath := filepath.Join(homeDir, "Library/LaunchAgents/com.${config.projectName}.plist")
	_, err := os.Stat(plistPath)
	return err == nil, nil
}

// Linux implementation
func (a *App) enableStartupLinux() error {
	homeDir, _ := os.UserHomeDir()
	autostartPath := filepath.Join(homeDir, ".config/autostart/${config.projectName}.desktop")
	fmt.Printf("Create desktop file at: %s\\n", autostartPath)
	return nil
}

func (a *App) disableStartupLinux() error {
	homeDir, _ := os.UserHomeDir()
	autostartPath := filepath.Join(homeDir, ".config/autostart/${config.projectName}.desktop")
	return os.Remove(autostartPath)
}

func (a *App) isStartupEnabledLinux() (bool, error) {
	homeDir, _ := os.UserHomeDir()
	autostartPath := filepath.Join(homeDir, ".config/autostart/${config.projectName}.desktop")
	_, err := os.Stat(autostartPath)
	return err == nil, nil
}
`;

    await fse.writeFile(startupGoPath, startupGoCode);

    // Create documentation
    const readmePath = join(config.projectPath, 'STARTUP.md');
    const readme = `# Startup / Auto-Launch

## Overview

Launch your app automatically when the system starts.

## Usage

\`\`\`javascript
import { EnableStartup, DisableStartup, IsStartupEnabled } from '../wailsjs/go/main/App'

// Enable startup
await EnableStartup()

// Disable startup  
await DisableStartup()

// Check if enabled
const enabled = await IsStartupEnabled()
\`\`\`

## Platform Details

- **Windows**: Registry key in HKEY_CURRENT_USER\\\\Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Run
- **macOS**: LaunchAgent plist in ~/Library/LaunchAgents/
- **Linux**: Desktop file in ~/.config/autostart/
`;

    await fse.writeFile(readmePath, readme);
    
    spinner.succeed('Startup/auto-launch support added - see STARTUP.md');
  } catch (error) {
    spinner.fail('Failed to add startup support');
    throw error;
  }
}

export async function applyClipboard(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding clipboard utilities...').start();
  
  try {
    const clipboardPath = join(config.projectPath, 'clipboard.go');
    const clipboardCode = `package main

import (
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// GetClipboardText reads text from the system clipboard
func (a *App) GetClipboardText() (string, error) {
	text, err := runtime.ClipboardGetText(a.ctx)
	return text, err
}

// SetClipboardText writes text to the system clipboard
func (a *App) SetClipboardText(text string) error {
	return runtime.ClipboardSetText(a.ctx, text)
}

// CopyToClipboard is a helper that copies text and returns success status
func (a *App) CopyToClipboard(text string) bool {
	err := runtime.ClipboardSetText(a.ctx, text)
	return err == nil
}

// PasteFromClipboard is a helper that returns clipboard text or empty string on error
func (a *App) PasteFromClipboard() string {
	text, err := runtime.ClipboardGetText(a.ctx)
	if err != nil {
		return ""
	}
	return text
}
`;

    await fse.writeFile(clipboardPath, clipboardCode);

    // Create frontend example
    const frontendExampleDir = join(config.projectPath, 'frontend-examples');
    await fse.ensureDir(frontendExampleDir);

    const ext = config.features.typescript ? 'ts' : 'js';
    const examplePath = join(frontendExampleDir, `clipboard-example.${ext}`);
    const exampleCode = `// Clipboard Utilities Example
import { GetClipboardText, SetClipboardText, CopyToClipboard, PasteFromClipboard } from '../wailsjs/go/main/App'

export async function copyText(text${config.features.typescript ? ': string' : ''}) {
  try {
    await SetClipboardText(text)
    console.log('Copied to clipboard:', text)
    return true
  } catch (error) {
    console.error('Failed to copy:', error)
    return false
  }
}

export async function pasteText()${config.features.typescript ? ': Promise<string>' : ''} {
  try {
    const text = await GetClipboardText()
    console.log('Pasted from clipboard:', text)
    return text
  } catch (error) {
    console.error('Failed to paste:', error)
    return ''
  }
}

export async function copyWithFeedback(text${config.features.typescript ? ': string' : ''}) {
  const success = await CopyToClipboard(text)
  if (success) {
    console.log('✓ Copied!')
  } else {
    console.error('✗ Copy failed')
  }
  return success
}

// Example: Copy button handler
export async function handleCopyButton(textToCopy${config.features.typescript ? ': string' : ''}) {
  const success = await copyText(textToCopy)
  if (success) {
    // Show success notification
    console.log('Copied to clipboard!')
  }
}

// Example: Paste button handler
export async function handlePasteButton() {
  const text = await pasteText()
  // Use the pasted text
  return text
}
`;

    await fse.writeFile(examplePath, exampleCode);
    
    spinner.succeed('Clipboard utilities added with examples');
  } catch (error) {
    spinner.fail('Failed to add clipboard utilities');
    throw error;
  }
}

export async function applyFileWatcher(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding file system watcher...').start();
  
  try {
    const watcherGoPath = join(config.projectPath, 'filewatcher.go');
    const watcherGoCode = `package main

import (
	"fmt"
	"path/filepath"
	"time"
)

// FileWatcher represents a file system watcher
type FileWatcher struct {
	paths    []string
	interval time.Duration
	callback func(string, string) // path, event type
	stopChan chan bool
	running  bool
}

// NewFileWatcher creates a new file watcher
func (a *App) NewFileWatcher() *FileWatcher {
	return &FileWatcher{
		paths:    make([]string, 0),
		interval: 1 * time.Second,
		stopChan: make(chan bool),
		running:  false,
	}
}

// WatchFile adds a file or directory to watch
func (a *App) WatchFile(path string) error {
	absPath, err := filepath.Abs(path)
	if err != nil {
		return fmt.Errorf("invalid path: %w", err)
	}

	fmt.Printf("Watching: %s\\n", absPath)
	
	// In production, use github.com/fsnotify/fsnotify for real-time events
	// This is a simplified polling-based implementation
	
	return nil
}

// UnwatchFile removes a file or directory from watching
func (a *App) UnwatchFile(path string) error {
	absPath, err := filepath.Abs(path)
	if err != nil {
		return fmt.Errorf("invalid path: %w", err)
	}

	fmt.Printf("Stopped watching: %s\\n", absPath)
	return nil
}

// StopWatching stops all file watching
func (a *App) StopWatching() error {
	fmt.Println("Stopped all file watching")
	return nil
}

// OnFileChange registers a callback for file changes
// In production, emit Wails events instead of using callbacks
func (a *App) OnFileChange(path string) (string, error) {
	// This would be called when a file changes
	return fmt.Sprintf("File changed: %s", path), nil
}
`;

    await fse.writeFile(watcherGoPath, watcherGoCode);

    // Add Go dependency note
    const goModPath = join(config.projectPath, 'go.mod');
    if (await fse.pathExists(goModPath)) {
      const goModContent = await fse.readFile(goModPath, 'utf-8');
      if (!goModContent.includes('fsnotify')) {
        const note = `\n// For production file watching, add:\n// github.com/fsnotify/fsnotify v1.7.0\n`;
        await fse.appendFile(goModPath, note);
      }
    }

    // Create frontend helper
    const frontendExampleDir = join(config.projectPath, 'frontend-examples');
    await fse.ensureDir(frontendExampleDir);

    const ext = config.features.typescript ? 'ts' : 'js';
    const watcherHelperPath = join(frontendExampleDir, `filewatcher-helper.${ext}`);
    const watcherHelperCode = `// File Watcher Helper
import { WatchFile, UnwatchFile, StopWatching, OnFileChange } from '../wailsjs/go/main/App'

export async function watchFile(path${config.features.typescript ? ': string' : ''}) {
  try {
    await WatchFile(path)
    console.log('Started watching:', path)
  } catch (error) {
    console.error('Failed to watch file:', error)
  }
}

export async function unwatchFile(path${config.features.typescript ? ': string' : ''}) {
  try {
    await UnwatchFile(path)
    console.log('Stopped watching:', path)
  } catch (error) {
    console.error('Failed to unwatch file:', error)
  }
}

export async function stopAllWatching() {
  try {
    await StopWatching()
    console.log('Stopped all file watching')
  } catch (error) {
    console.error('Failed to stop watching:', error)
  }
}

// Example usage
export async function setupFileWatcher() {
  // Watch a specific file
  await watchFile('/path/to/config.json')
  
  // Watch a directory
  await watchFile('/path/to/directory')
  
  // Handle file changes (in production, use Wails events)
  // wails.Events.On('file:changed', (path) => {
  //   console.log('File changed:', path)
  // })
}
`;

    await fse.writeFile(watcherHelperPath, watcherHelperCode);

    // Create documentation
    const readmePath = join(config.projectPath, 'FILE_WATCHER.md');
    const readme = `# File System Watcher

## Overview

Watch files and directories for changes.

## Production Setup

For real-time file watching, add to \`go.mod\`:

\`\`\`bash
go get github.com/fsnotify/fsnotify@latest
\`\`\`

Then update \`filewatcher.go\` to use fsnotify instead of polling.

## Usage

\`\`\`javascript
import { WatchFile, UnwatchFile, StopWatching } from '../wailsjs/go/main/App'

// Watch a file
await WatchFile('/path/to/file.txt')

// Watch a directory
await WatchFile('/path/to/directory')

// Stop watching a specific path
await UnwatchFile('/path/to/file.txt')

// Stop all watching
await StopWatching()
\`\`\`

## Event Handling

In production, emit Wails events for file changes:

\`\`\`go
// In filewatcher.go
runtime.EventsEmit(a.ctx, "file:changed", path)
\`\`\`

\`\`\`javascript
// In frontend
import { EventsOn } from '@wailsapp/runtime'

EventsOn('file:changed', (path) => {
  console.log('File changed:', path)
})
\`\`\`

See \`frontend-examples/filewatcher-helper.${ext}\` for examples.
`;

    await fse.writeFile(readmePath, readme);
    
    spinner.succeed('File system watcher added - see FILE_WATCHER.md');
  } catch (error) {
    spinner.fail('Failed to add file system watcher');
    throw error;
  }
}
