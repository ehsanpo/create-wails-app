package main

import (
	"github.com/wailsapp/wails/v3/pkg/application"
)

// setupSystemTray creates and configures the system tray with menu items
func setupSystemTray(app *application.App, systray *application.SystemTray, window *application.WebviewWindow, projectName string) {
	// Create the tray menu
	menu := app.NewMenu()

	// Show/Hide window item
	menu.Add("Show Window").OnClick(func(ctx *application.Context) {
		window.Show()
		window.SetAlwaysOnTop(false)
	})

	menu.AddSeparator()

	// Quit item
	menu.Add("Quit").OnClick(func(ctx *application.Context) {
		app.Quit()
	})

	// Set the menu on the system tray
	systray.SetMenu(menu)
}


