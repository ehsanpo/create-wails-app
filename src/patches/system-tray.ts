import fse from 'fs-extra';
import { join } from 'path';
import type { GeneratorConfig } from '../types.js';
import ora from 'ora';
import { readTemplate } from './template-reader.js';
import { patchMainGo, mainGoContains } from './helpers.js';

export async function applySystemTray(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding system tray support...').start();

  try {
    // Patch main.go to initialize system tray
    if (config.wailsVersion === 3) {
      // Create system tray Go file for v3
      const trayGoPath = join(config.projectPath, 'systray.go');
      const trayGoContent = await readTemplate('system-tray/systray.go', config.wailsVersion);
      await fse.writeFile(trayGoPath, trayGoContent);

      // Patch main.go to initialize system tray
      const alreadyPatched = await mainGoContains(config.projectPath, 'SystemTray.New()');

      if (!alreadyPatched) {
        // First, add the icon embed directive at the top of the file
        const mainGoPath = join(config.projectPath, 'main.go');
        let content = await fse.readFile(mainGoPath, 'utf-8');

        // Add icon embed after the assets embed
        if (!content.includes('//go:embed build/appicon.png')) {
          const assetsEmbedPattern = /(\/\/go:embed all:frontend\/dist\s*\n\s*var assets embed\.FS)/;
          const match = content.match(assetsEmbedPattern);

          if (match) {
            const insertPos = match.index! + match[0].length;
            content = content.slice(0, insertPos) +
              '\n\n//go:embed build/appicon.png\nvar trayIcon []byte' +
              content.slice(insertPos);

            // Also ensure the window is assigned to a variable so we can pass it to the tray
            // If the pattern isn't found, still perform the replacement to make downstream references safe
            if (!content.includes('mainWindow := app.Window.NewWithOptions(')) {
              content = content.replace(
                /app\.Window\.NewWithOptions\(/,
                'mainWindow := app.Window.NewWithOptions('
              );
            }

            await fse.writeFile(mainGoPath, content);
          }
        }

        // Now add the system tray initialization code before app.Run()
        // Note: For v3, setupSystemTray needs the app, systray, and window objects
        await patchMainGo(config.projectPath, 3, {
          beforeRun: `\t// Create system tray
\tsystray := app.SystemTray.New()
\tsystray.SetIcon(trayIcon)
\tsystray.SetLabel("${config.projectName}")
\t
\t// Setup tray menu using the generated systray.go function
\tsetupSystemTray(app, systray, mainWindow, "${config.projectName}")`,
        });
      }
    } else {
      // Create system tray Go file for v2
      const trayGoPath = join(config.projectPath, 'systray.go');
      const trayGoContent = await readTemplate('system-tray/systray.go', config.wailsVersion);
      await fse.writeFile(trayGoPath, trayGoContent);

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

The system tray is fully initialized in \`main.go\` with icon and menu:

\`\`\`go
// At the top of main.go
//go:embed build/appicon.png
var trayIcon []byte

// In main() function
systray := app.SystemTray.New()
systray.SetIcon(trayIcon)
systray.SetLabel("${config.projectName}")

// Add system tray menu
menu := app.NewMenu()
menu.Add("Show Window").OnClick(func(ctx *application.Context) {
\twindows := app.Window.GetAll()
\tif len(windows) > 0 {
\t\twindows[0].Show()
\t\twindows[0].UnMinimise()
\t}
})
menu.AddSeparator()
menu.Add("Quit").OnClick(func(ctx *application.Context) {
\tapp.Quit()
})
systray.SetMenu(menu)
\`\`\`

### Adding a Custom Icon

Replace \`build/appicon.png\` with your own icon file. Supported formats:
- Windows: .ico, .png
- macOS: .png (will be used as template image)
- Linux: .png

### Adding Menu Items

Add more menu items before setting the menu:

\`\`\`go
menu.Add("Settings").OnClick(func(ctx *application.Context) {
\t// Open settings window
})
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

- Show/Hide window from tray menu
- Quit application
- Custom icon support
- Menu with separators
${config.wailsVersion === 3 ? '- Direct menu creation in main.go' : '- Keyboard shortcuts support'}

## Customization

${config.wailsVersion === 3 ? `
Edit the menu creation code in \`main.go\` to:
- Add more menu items
- Change menu item labels
- Add custom click handlers
- Create submenus
` : `
Edit \`systray.go\` to:
- Add more menu items
- Change keyboard shortcuts
- Customize click behavior
- Add submenus
`}

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
