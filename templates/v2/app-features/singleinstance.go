package main

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
	lockFile = filepath.Join(tmpDir, "{{PROJECT_NAME}}.lock")

	// Try to create lock file atomically
	pid := fmt.Sprintf("%d", os.Getpid())
	file, err := os.OpenFile(lockFile, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0644)
	if err != nil {
		if os.IsExist(err) {
			// Lock file already exists, read the PID to show which process is running
			data, readErr := os.ReadFile(lockFile)
			if readErr == nil {
				fmt.Printf("Another instance is already running (PID: %s)\n", string(data))
			} else {
				fmt.Printf("Another instance is already running\n")
			}
			return fmt.Errorf("application is already running")
		}
		return fmt.Errorf("failed to create lock file: %w", err)
	}
	defer file.Close()

	// Write current PID to the lock file
	_, err = file.WriteString(pid)
	if err != nil {
		os.Remove(lockFile) // Clean up if write fails
		return fmt.Errorf("failed to write PID to lock file: %w", err)
	}

	return nil
}

// releaseSingleInstance removes the lock file
func (a *App) releaseSingleInstance() {
	if lockFile != "" {
		os.Remove(lockFile)
	}
}
