package main

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

	dbPath := filepath.Join(homeDir, ".{{PROJECT_NAME}}", "database.db")
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
