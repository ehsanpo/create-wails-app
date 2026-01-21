package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

const (
	// This is a simple example key. In production, use a proper key derivation function
	// or retrieve from the system keychain using github.com/99designs/keyring
	// IMPORTANT: Must be exactly 32 bytes for AES-256 - aes.NewCipher will fail otherwise
	encryptionKey = "12345678901234567890123456789012" // Exactly 32 bytes for AES-256
)

// SecureStorage provides encrypted storage
type SecureStorage struct {
	storagePath string
}

// NewSecureStorage creates a new secure storage instance
func (a *App) NewSecureStorage() (*SecureStorage, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, err
	}

	storagePath := filepath.Join(homeDir, ".{{PROJECT_NAME}}", "secure")
	err = os.MkdirAll(storagePath, 0700) // Restricted permissions
	if err != nil {
		return nil, err
	}

	return &SecureStorage{storagePath: storagePath}, nil
}

// encrypt encrypts data using AES-256
func encrypt(plaintext []byte) (string, error) {
	block, err := aes.NewCipher([]byte(encryptionKey))
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := gcm.Seal(nonce, nonce, plaintext, nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// decrypt decrypts AES-256 encrypted data
func decrypt(ciphertext string) ([]byte, error) {
	data, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return nil, err
	}

	block, err := aes.NewCipher([]byte(encryptionKey))
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return nil, errors.New("ciphertext too short")
	}

	nonce, ciphertextBytes := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertextBytes, nil)
	if err != nil {
		return nil, err
	}

	return plaintext, nil
}

// SetSecureValue stores an encrypted value
func (a *App) SetSecureValue(key, value string) error {
	storage, err := a.NewSecureStorage()
	if err != nil {
		return err
	}

	encrypted, err := encrypt([]byte(value))
	if err != nil {
		return fmt.Errorf("encryption failed: %w", err)
	}

	filePath := filepath.Join(storage.storagePath, key+".enc")
	return os.WriteFile(filePath, []byte(encrypted), 0600)
}

// GetSecureValue retrieves and decrypts a value
func (a *App) GetSecureValue(key string) (string, error) {
	storage, err := a.NewSecureStorage()
	if err != nil {
		return "", err
	}

	filePath := filepath.Join(storage.storagePath, key+".enc")
	encrypted, err := os.ReadFile(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			return "", nil // Return empty if not found
		}
		return "", err
	}

	decrypted, err := decrypt(string(encrypted))
	if err != nil {
		return "", fmt.Errorf("decryption failed: %w", err)
	}

	return string(decrypted), nil
}

// DeleteSecureValue removes a secure value
func (a *App) DeleteSecureValue(key string) error {
	storage, err := a.NewSecureStorage()
	if err != nil {
		return err
	}

	filePath := filepath.Join(storage.storagePath, key+".enc")
	return os.Remove(filePath)
}
