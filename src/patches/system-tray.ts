import fse from 'fs-extra';
import { join } from 'path';
import type { GeneratorConfig } from '../types.js';
import ora from 'ora';

export async function applySystemTray(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding system tray support...').start();
  
  try {
    // Create system tray Go file
    const trayGoPath = join(config.projectPath, 'systray.go');
    const trayGoContent = `package main

import (
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// setupSystemTray creates and configures the system tray
func (a *App) setupSystemTray() *menu.Menu {
	// Create system tray menu
	trayMenu := menu.NewMenu()

	// Show/Hide window item
	trayMenu.Append(menu.Text("Show Window", keys.CmdOrCtrl("s"), func(_ *menu.CallbackData) {
		runtime.WindowShow(a.ctx)
		runtime.WindowUnminimise(a.ctx)
	}))

	trayMenu.Append(menu.Separator())

	// Quit item
	trayMenu.Append(menu.Text("Quit", keys.CmdOrCtrl("q"), func(_ *menu.CallbackData) {
		runtime.Quit(a.ctx)
	}))

	return trayMenu
}

// OnTrayIconLeftClick handles left click on system tray icon
func (a *App) OnTrayIconLeftClick() {
	runtime.WindowShow(a.ctx)
	runtime.WindowUnminimise(a.ctx)
}

// OnTrayIconRightClick handles right click on system tray icon
// This will show the tray menu automatically
func (a *App) OnTrayIconRightClick() {
	// Menu is shown automatically by Wails
}
`;

    await fse.writeFile(trayGoPath, trayGoContent);

    // Create README for system tray
    const trayReadmePath = join(config.projectPath, 'SYSTRAY.md');
    const trayReadmeContent = `# System Tray Implementation

## Overview

System tray support has been added to your application. The implementation includes:

- System tray icon with menu
- Show/Hide window functionality
- Quit option
- Click handlers

## Files

- \`systray.go\` - System tray implementation
- \`build/appicon.png\` - Icon file (you need to provide this)

## Usage

The system tray is configured in your \`main.go\`:

\`\`\`go
// In main.go, add to application options:
TrayMenu:     app.setupSystemTray(),
\`\`\`

## Icon Setup

### 1. Add Your Icon

Place your tray icon at:
- **Windows**: \`build/windows/icon.ico\`
- **macOS**: \`build/darwin/icon.png\` (22x22 pixels recommended)
- **Linux**: \`build/linux/icon.png\`

### 2. Icon Guidelines

- **Windows**: 16x16 or 32x32 pixels, .ico format
- **macOS**: 22x22 pixels (44x44 for Retina), .png with transparency
- **Linux**: 22x22 or 48x48 pixels, .png

## Customization

### Add More Menu Items

Edit \`systray.go\` and add items to \`setupSystemTray()\`:

\`\`\`go
trayMenu.Append(menu.Text("Settings", nil, func(_ *menu.CallbackData) {
    // Open settings window
}))
\`\`\`

### Change Click Behavior

Modify the click handlers:

\`\`\`go
func (a *App) OnTrayIconLeftClick() {
    // Your custom action
}
\`\`\`

## Hide Window on Close

To minimize to tray instead of closing, update your frontend:

\`\`\`javascript
// In your frontend, before window close
import { EventsOn } from '@wailsapp/runtime';

window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    // Minimize to tray instead of closing
});
\`\`\`

## Platform Notes

- **macOS**: Tray icon appears in menu bar (top right)
- **Windows**: Tray icon appears in system tray (bottom right)
- **Linux**: Depends on desktop environment

## Resources

- [Wails System Tray Docs](https://wails.io/docs/reference/menus)
- [Icon Design Guidelines](https://wails.io/docs/guides/application-development#application-icons)
`;

    await fse.writeFile(trayReadmePath, trayReadmeContent);

    // Update main.go instructions
    const mainGoInstructions = join(config.projectPath, 'SETUP_INSTRUCTIONS.md');
    const instructions = `
## System Tray Setup

1. **Add to main.go**: In your application options, add:
   \`\`\`go
   TrayMenu: app.setupSystemTray(),
   OnTrayIconLeftClick: app.OnTrayIconLeftClick,
   \`\`\`

2. **Add your icon**: Place icon files in the \`build/\` directory

3. **See SYSTRAY.md** for complete documentation
`;

    if (await fse.pathExists(mainGoInstructions)) {
      let content = await fse.readFile(mainGoInstructions, 'utf-8');
      content += instructions;
      await fse.writeFile(mainGoInstructions, content);
    } else {
      await fse.writeFile(mainGoInstructions, `# Setup Instructions\n${instructions}`);
    }

    spinner.succeed('System tray support added - see SYSTRAY.md for setup');
  } catch (error) {
    spinner.fail('Failed to add system tray support');
    throw error;
  }
}
