import fse from 'fs-extra';
import { join } from 'path';
import type { GeneratorConfig } from '../types.js';
import ora from 'ora';
import { readTemplate } from './template-reader.js';
import { patchMainGo, mainGoContains } from './helpers.js';

export async function applySystemTray(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding system tray support...').start();
  
  try {
    // Create system tray Go file
    const trayGoPath = join(config.projectPath, 'systray.go');
    const trayGoContent = await readTemplate('system-tray/systray.go', config.wailsVersion);
    await fse.writeFile(trayGoPath, trayGoContent);

    // Patch main.go to initialize system tray
    if (config.wailsVersion === 3) {
      // Wails v3 approach
      const alreadyPatched = await mainGoContains(config.projectPath, 'SystemTray.New()');
      
      if (!alreadyPatched) {
        await patchMainGo(config.projectPath, 3, {
          afterAppCreation: `\t// Create system tray
\tsystray := app.SystemTray.New()
\tsystray.SetLabel("${config.projectName}")
\t// systray.SetIcon(trayIcon) // Uncomment and add icon data`,
        });
      }
    } else {
      // Wails v2 approach - add to app options
      const alreadyPatched = await mainGoContains(config.projectPath, 'setupSystemTray');
      
      if (!alreadyPatched) {
        // For v2, we need to patch the wails.Run options to add OnSystemTrayReady
        const mainGoPath = join(config.projectPath, 'main.go');
        let content = await fse.readFile(mainGoPath, 'utf-8');
        
        // Find the App struct and add system tray callback
        const optionsPattern = /wails\.Run\(\s*&options\.App\s*\{([^}]*)\}\s*\)/s;
        const match = content.match(optionsPattern);
        
        if (match) {
          const optionsContent = match[1];
          
          // Add OnSystemTrayReady if not present
          if (!optionsContent.includes('OnSystemTrayReady')) {
            const newOptions = optionsContent.trimEnd() + 
              '\n\t\tOnSystemTrayReady: app.setupSystemTray,';
            content = content.replace(optionsPattern, `wails.Run(&options.App{${newOptions}\n\t})`);
            await fse.writeFile(mainGoPath, content);
          }
        }
      }
    }

    // Create documentation
    const readmePath = join(config.projectPath, 'SYSTEM_TRAY.md');
    const readme = `# System Tray

## Overview

System tray support has been added to your application.

${config.wailsVersion === 3 ? `
## Wails v3 Usage

The system tray is initialized in \`main.go\`:

\`\`\`go
systray := app.SystemTray.New()
systray.SetLabel("${config.projectName}")
// systray.SetIcon(trayIcon) // Add icon data
\`\`\`

### Adding an Icon

1. Embed your icon file:
\`\`\`go
import _ "embed"

//go:embed appicon.png
var trayIcon []byte
\`\`\`

2. Set the icon:
\`\`\`go
systray.SetIcon(trayIcon)
\`\`\`
` : `
## Wails v2 Usage

The system tray is configured in \`main.go\` via the \`OnSystemTrayReady\` callback.

### Customizing the Tray Menu

Edit \`systray.go\` to customize the menu items:

\`\`\`go
func (a *App) setupSystemTray() *menu.Menu {
\ttrayMenu := menu.NewMenu()
\t
\t// Add your menu items
\ttrayMenu.Append(menu.Text("Show Window", keys.CmdOrCtrl("s"), func(_ *menu.CallbackData) {
\t\truntime.WindowShow(a.ctx)
\t}))
\t
\treturn trayMenu
}
\`\`\`

### Adding an Icon

In your \`main.go\`, embed an icon and pass it to the options:

\`\`\`go
import _ "embed"

//go:embed appicon.ico
var icon []byte

// Then in wails.Run:
Icon: icon,
\`\`\`
`}

## Features

- Show/Hide window
- Quit application
- Custom menu items
- Left/Right click handlers

## Customization

Edit \`systray.go\` to:
- Add more menu items
- Change keyboard shortcuts
- Customize click behavior
- Add submenus

## Platform Support

- Windows: Supports icons and menus
- macOS: Supports icons and menus
- Linux: Support varies by desktop environment
`;

    await fse.writeFile(readmePath, readme);

    spinner.succeed('System tray support added - check SYSTEM_TRAY.md for usage');
  } catch (error) {
    spinner.fail('Failed to add system tray support');
    throw error;
  }
}
