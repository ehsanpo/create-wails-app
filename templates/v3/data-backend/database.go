package main

// SQLite Database Helper
//
// IMPORTANT: go-sqlite3 requires CGO to be enabled.
// 1. Run: go get github.com/mattn/go-sqlite3@latest
//
// 2. Install a C compiler (required for CGO):
//    Windows: Install MinGW-w64 or TDM-GCC and add to PATH
//    macOS: Install Xcode Command Line Tools
//    Linux: Install gcc (usually pre-installed)
//
// 3. Build with CGO enabled:
//    Windows: $env:CGO_ENABLED="1"; wails3 task windows:build
//    macOS/Linux: CGO_ENABLED=1 wails3 build
//
// Alternative: Use modernc.org/sqlite (pure Go, no CGO needed)
//
// Note: wails3 dev runs with CGO_ENABLED=0, so database will show stub errors in dev mode.

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3" // SQLite driver
)

var db *sql.DB

// InitDatabase initializes the SQLite database
func InitDatabase() error {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return fmt.Errorf("failed to get home dir: %w", err)
	}

	dbPath := filepath.Join(homeDir, ".{{PROJECT_NAME}}", "database.db")
	err = os.MkdirAll(filepath.Dir(dbPath), 0755)
	if err != nil {
		return fmt.Errorf("failed to create db directory: %w", err)
	}

	db, err = sql.Open("sqlite3", dbPath)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	return createTables()
}

// createTables creates the database schema
func createTables() error {
	schema := `
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
	`

	_, err := db.Exec(schema)
	return err
}

// CloseDatabase closes the database connection
func CloseDatabase() error {
	if db != nil {
		return db.Close()
	}
	return nil
}

// ExecuteQuery executes a predefined SQL query by identifier
func ExecuteQuery(queryID string, args ...interface{}) (string, error) {
	var stmt *sql.Stmt
	var err error

	switch queryID {
	case "get_all_users":
		stmt, err = db.Prepare("SELECT id, name, email FROM users")
	case "get_user_by_id":
		stmt, err = db.Prepare("SELECT id, name, email FROM users WHERE id = ?")
	case "get_user_by_email":
		stmt, err = db.Prepare("SELECT id, name, email FROM users WHERE email = ?")
	default:
		return "", fmt.Errorf("unknown query identifier: %s", queryID)
	}

	if err != nil {
		return "", fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	rows, err := stmt.Query(args...)
	if err != nil {
		return "", fmt.Errorf("query failed: %w", err)
	}
	defer rows.Close()

	return "Query executed successfully", nil
}

// InsertUser inserts a new user
func InsertUser(name, email string) (int64, error) {
	result, err := db.Exec("INSERT INTO users (name, email) VALUES (?, ?)", name, email)
	if err != nil {
		return 0, fmt.Errorf("insert failed: %w", err)
	}

	return result.LastInsertId()
}

// GetUsers retrieves all users
func GetUsers() ([]map[string]interface{}, error) {
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

// DatabaseService provides database operations to the frontend
type DatabaseService struct{}

// AddUser adds a new user to the database
func (d *DatabaseService) AddUser(name, email string) (int64, error) {
	return InsertUser(name, email)
}

// ListUsers retrieves all users from the database
func (d *DatabaseService) ListUsers() ([]map[string]interface{}, error) {
	return GetUsers()
}
