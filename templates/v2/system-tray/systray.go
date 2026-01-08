package main

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
