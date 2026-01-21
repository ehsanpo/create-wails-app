package main

import (
	"fmt"
	"runtime"
)

const (
	AppProtocol = "{{PROJECT_NAME_LOWER}}" // e.g., myapp://
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
	fmt.Printf("Add to registry: HKEY_CLASSES_ROOT\\%s\n", AppProtocol)
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
	fmt.Printf("Add MimeType=%s to .desktop file\n", AppProtocol)
	return nil
}

// HandleDeepLink processes a deep link URL
func (a *App) HandleDeepLink(url string) error {
	fmt.Printf("Handling deep link: %s\n", url)
	// Parse and handle the URL
	// Example: myapp://action/param
	return nil
}
