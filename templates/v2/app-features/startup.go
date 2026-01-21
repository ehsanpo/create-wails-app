package main

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
	fmt.Printf("To enable startup on Windows, add to registry:\n")
	fmt.Printf("HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\n")
	fmt.Printf("Name: {{PROJECT_NAME}}, Value: %s\n", exePath)
	return nil
}

func (a *App) disableStartupWindows() error {
	fmt.Println("Remove registry key: HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\{{PROJECT_NAME}}")
	return nil
}

func (a *App) isStartupEnabledWindows() (bool, error) {
	// Check registry - requires golang.org/x/sys/windows/registry
	return false, nil
}

// macOS implementation
func (a *App) enableStartupMacOS() error {
	homeDir, _ := os.UserHomeDir()
	plistPath := filepath.Join(homeDir, "Library/LaunchAgents/com.{{PROJECT_NAME}}.plist")
	fmt.Printf("Create plist file at: %s\n", plistPath)
	return nil
}

func (a *App) disableStartupMacOS() error {
	homeDir, _ := os.UserHomeDir()
	plistPath := filepath.Join(homeDir, "Library/LaunchAgents/com.{{PROJECT_NAME}}.plist")
	return os.Remove(plistPath)
}

func (a *App) isStartupEnabledMacOS() (bool, error) {
	homeDir, _ := os.UserHomeDir()
	plistPath := filepath.Join(homeDir, "Library/LaunchAgents/com.{{PROJECT_NAME}}.plist")
	_, err := os.Stat(plistPath)
	return err == nil, nil
}

// Linux implementation
func (a *App) enableStartupLinux() error {
	homeDir, _ := os.UserHomeDir()
	autostartPath := filepath.Join(homeDir, ".config/autostart/{{PROJECT_NAME}}.desktop")
	fmt.Printf("Create desktop file at: %s\n", autostartPath)
	return nil
}

func (a *App) disableStartupLinux() error {
	homeDir, _ := os.UserHomeDir()
	autostartPath := filepath.Join(homeDir, ".config/autostart/{{PROJECT_NAME}}.desktop")
	return os.Remove(autostartPath)
}

func (a *App) isStartupEnabledLinux() (bool, error) {
	homeDir, _ := os.UserHomeDir()
	autostartPath := filepath.Join(homeDir, ".config/autostart/{{PROJECT_NAME}}.desktop")
	_, err := os.Stat(autostartPath)
	return err == nil, nil
}
