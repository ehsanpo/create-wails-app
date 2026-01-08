import fse from 'fs-extra';
import { join } from 'path';
import type { GeneratorConfig } from '../types.js';
import ora from 'ora';
import { addGoComment, addNpmDependencies } from './helpers.js';

export async function applySQLite(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding SQLite support...').start();
  
  try {
    const sqliteGoPath = join(config.projectPath, 'database.go');
    const sqliteGoCode = `package main

import (
	"database/sql"
	"fmt"
	"path/filepath"
	"os"

	_ "github.com/mattn/go-sqlite3" // SQLite driver
)

var db *sql.DB

// InitDatabase initializes the SQLite database
func (a *App) InitDatabase() error {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return fmt.Errorf("failed to get home dir: %w", err)
	}

	dbPath := filepath.Join(homeDir, ".${config.projectName}", "database.db")
	err = os.MkdirAll(filepath.Dir(dbPath), 0755)
	if err != nil {
		return fmt.Errorf("failed to create db directory: %w", err)
	}

	db, err = sql.Open("sqlite3", dbPath)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	return a.createTables()
}

// createTables creates the database schema
func (a *App) createTables() error {
	schema := \`
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		email TEXT UNIQUE NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS settings (
		key TEXT PRIMARY KEY,
		value TEXT NOT NULL
	);
	\`

	_, err := db.Exec(schema)
	return err
}

// CloseDatabase closes the database connection
func (a *App) CloseDatabase() error {
	if db != nil {
		return db.Close()
	}
	return nil
}

// ExecuteQuery executes a SQL query
func (a *App) ExecuteQuery(query string) (string, error) {
	rows, err := db.Query(query)
	if err != nil {
		return "", fmt.Errorf("query failed: %w", err)
	}
	defer rows.Close()

	return "Query executed successfully", nil
}

// InsertUser inserts a new user
func (a *App) InsertUser(name, email string) (int64, error) {
	result, err := db.Exec("INSERT INTO users (name, email) VALUES (?, ?)", name, email)
	if err != nil {
		return 0, fmt.Errorf("insert failed: %w", err)
	}

	return result.LastInsertId()
}

// GetUsers retrieves all users
func (a *App) GetUsers() ([]map[string]interface{}, error) {
	rows, err := db.Query("SELECT id, name, email, created_at FROM users")
	if err != nil {
		return nil, fmt.Errorf("query failed: %w", err)
	}
	defer rows.Close()

	var users []map[string]interface{}
	for rows.Next() {
		var id int64
		var name, email, createdAt string
		err := rows.Scan(&id, &name, &email, &createdAt)
		if err != nil {
			return nil, err
		}

		users = append(users, map[string]interface{}{
			"id":        id,
			"name":      name,
			"email":     email,
			"createdAt": createdAt,
		})
	}

	return users, nil
}
`;

    await fse.writeFile(sqliteGoPath, sqliteGoCode);

    // Create schema file
    const dbDir = join(config.projectPath, 'db');
    await fse.ensureDir(dbDir);
    
    const schemaPath = join(dbDir, 'schema.sql');
    const schema = `-- SQLite Database Schema
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;
    
    await fse.writeFile(schemaPath, schema);

    // Add Go dependency note
    const goModPath = join(config.projectPath, 'go.mod');
    if (await fse.pathExists(goModPath)) {
      const goModContent = await fse.readFile(goModPath, 'utf-8');
      if (!goModContent.includes('go-sqlite3')) {
        const note = `\n// For SQLite support, add:\n// github.com/mattn/go-sqlite3 v1.14.18\n`;
        await fse.appendFile(goModPath, note);
      }
    }

    // Create documentation
    const readmePath = join(config.projectPath, 'DATABASE.md');
    const readme = `# SQLite Database

## Overview

Local SQLite database has been added to your application.

## Setup

Install the Go SQLite driver:

\`\`\`bash
go get github.com/mattn/go-sqlite3@latest
\`\`\`

## Database Location

- **Windows**: \`%USERPROFILE%\\.${config.projectName}\\database.db\`
- **macOS**: \`~/.${config.projectName}/database.db\`
- **Linux**: \`~/.${config.projectName}/database.db\`

## Usage

### Initialize Database

Call in your app startup:

\`\`\`go
func (a *App) startup(ctx context.Context) {
    a.ctx = ctx
    a.InitDatabase()
}
\`\`\`

### Frontend Usage

\`\`\`javascript
import { InsertUser, GetUsers } from '../wailsjs/go/main/App'

// Insert a user
const userId = await InsertUser('John Doe', 'john@example.com')

// Get all users
const users = await GetUsers()
console.log(users)
\`\`\`

## Schema

See \`db/schema.sql\` for the database schema.
`;

    await fse.writeFile(readmePath, readme);
    
    spinner.succeed('SQLite support added - see DATABASE.md');
  } catch (error) {
    spinner.fail('Failed to add SQLite support');
    throw error;
  }
}

export async function applyEncryptedStorage(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding encrypted local storage...').start();
  
  try {
    const storageGoPath = join(config.projectPath, 'secure_storage.go');
    const storageGoCode = `package main

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
	encryptionKey = "your-32-byte-encryption-key!!" // Must be 32 bytes for AES-256
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

	storagePath := filepath.Join(homeDir, ".${config.projectName}", "secure")
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
`;

    await fse.writeFile(storageGoPath, storageGoCode);

    // Create documentation
    const readmePath = join(config.projectPath, 'SECURE_STORAGE.md');
    const readme = `# Encrypted Local Storage

## Overview

AES-256 encrypted local storage for sensitive data.

## Security Notice

⚠️ **IMPORTANT**: The current implementation uses a hardcoded encryption key for demonstration purposes.

For production applications:

1. Use a proper key derivation function (KDF)
2. Retrieve keys from the system keychain using \`github.com/99designs/keyring\`
3. Never hardcode encryption keys

## Storage Location

- **Windows**: \`%USERPROFILE%\\.${config.projectName}\\secure\\\`
- **macOS**: \`~/.${config.projectName}/secure/\`
- **Linux**: \`~/.${config.projectName}/secure/\`

Files have restricted permissions (0600).

## Usage

### Store Encrypted Data

\`\`\`javascript
import { SetSecureValue } from '../wailsjs/go/main/App'

await SetSecureValue('api_token', 'secret-token-value')
\`\`\`

### Retrieve Encrypted Data

\`\`\`javascript
import { GetSecureValue } from '../wailsjs/go/main/App'

const token = await GetSecureValue('api_token')
\`\`\`

### Delete Encrypted Data

\`\`\`javascript
import { DeleteSecureValue } from '../wailsjs/go/main/App'

await DeleteSecureValue('api_token')
\`\`\`

## Production Hardening

For production, replace the hardcoded key with system keychain:

\`\`\`bash
go get github.com/99designs/keyring@latest
\`\`\`

Then modify \`secure_storage.go\` to use keyring for key management.
`;

    await fse.writeFile(readmePath, readme);
    
    spinner.succeed('Encrypted storage added - see SECURE_STORAGE.md');
  } catch (error) {
    spinner.fail('Failed to add encrypted storage');
    throw error;
  }
}

export async function applySupabase(config: GeneratorConfig): Promise<void> {
  const spinner = ora('Adding Supabase integration...').start();
  
  try {
    // Create .env.example
    const envExamplePath = join(config.projectPath, '.env.example');
    const envContent = `# Supabase Configuration
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
${config.features.supabaseAuth ? '# Auth enabled\n' : ''}${config.features.supabaseDatabase ? '# Database enabled\n' : ''}${config.features.supabaseStorage ? '# Storage enabled\n' : ''}`;
    
    await fse.writeFile(envExamplePath, envContent);

    // Add Supabase client example
    const supabaseDir = join(config.projectPath, 'src', 'lib');
    await fse.ensureDir(supabaseDir);
    
    const ext = config.features.typescript ? 'ts' : 'js';
    const supabaseClientPath = join(supabaseDir, `supabase.${ext}`);
    const supabaseClient = `// Supabase Client Configuration
// Install: npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
`;
    
    await fse.writeFile(supabaseClientPath, supabaseClient);

    // Add npm dependency
    await addNpmDependencies(config.projectPath, {
      '@supabase/supabase-js': '^2.38.4',
    }, false);

    spinner.succeed('Supabase integration added');
  } catch (error) {
    spinner.fail('Failed to add Supabase integration');
    throw error;
  }
}
