package main

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
