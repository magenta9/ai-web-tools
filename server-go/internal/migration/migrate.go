package migration

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Migration represents a database migration
type Migration struct {
	Version int
	Name    string
	SQL     string
}

// Migrator handles database migrations
type Migrator struct {
	pool          *pgxpool.Pool
	migrationsDir string
}

// NewMigrator creates a new migrator instance
func NewMigrator(pool *pgxpool.Pool) *Migrator {
	return &Migrator{
		pool:          pool,
		migrationsDir: findMigrationsDir(),
	}
}

// NewMigratorFromDSN creates a migrator from a database connection string
func NewMigratorFromDSN(dsn string) (*Migrator, error) {
	config, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to parse DSN: %w", err)
	}

	config.MaxConns = 5
	config.MinConns = 1
	config.MaxConnLifetime = time.Hour

	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	if err := pool.Ping(context.Background()); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &Migrator{
		pool:          pool,
		migrationsDir: findMigrationsDir(),
	}, nil
}

// findMigrationsDir finds the migrations directory
func findMigrationsDir() string {
	// Try common locations
	paths := []string{
		"migrations",
		"../migrations",
		"./server-go/migrations",
		"/app/migrations", // Docker container path
	}

	for _, p := range paths {
		if info, err := os.Stat(p); err == nil && info.IsDir() {
			absPath, _ := filepath.Abs(p)
			return absPath
		}
	}

	// Default to current directory
	return "migrations"
}

// SetMigrationsDir sets the migrations directory path
func (m *Migrator) SetMigrationsDir(dir string) {
	m.migrationsDir = dir
}

// Close closes the database connection
func (m *Migrator) Close() {
	if m.pool != nil {
		m.pool.Close()
	}
}

// ensureMigrationsTable creates the schema_migrations table if it doesn't exist
func (m *Migrator) ensureMigrationsTable(ctx context.Context) error {
	_, err := m.pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version INTEGER PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
	return err
}

// GetCurrentVersion returns the current schema version
func (m *Migrator) GetCurrentVersion(ctx context.Context) (int, error) {
	if err := m.ensureMigrationsTable(ctx); err != nil {
		return 0, err
	}

	var version int
	err := m.pool.QueryRow(ctx, `
		SELECT COALESCE(MAX(version), 0) FROM schema_migrations
	`).Scan(&version)
	if err != nil {
		return 0, err
	}
	return version, nil
}

// GetAppliedMigrations returns all applied migrations
func (m *Migrator) GetAppliedMigrations(ctx context.Context) ([]int, error) {
	if err := m.ensureMigrationsTable(ctx); err != nil {
		return nil, err
	}

	rows, err := m.pool.Query(ctx, `
		SELECT version FROM schema_migrations ORDER BY version
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var versions []int
	for rows.Next() {
		var v int
		if err := rows.Scan(&v); err != nil {
			return nil, err
		}
		versions = append(versions, v)
	}
	return versions, nil
}

// LoadMigrations loads all migration files from the migrations directory
func (m *Migrator) LoadMigrations() ([]Migration, error) {
	entries, err := os.ReadDir(m.migrationsDir)
	if err != nil {
		return nil, fmt.Errorf("failed to read migrations directory %s: %w", m.migrationsDir, err)
	}

	var migrations []Migration
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".sql") {
			continue
		}

		// Parse version from filename (e.g., "001_initial_schema.sql")
		parts := strings.SplitN(entry.Name(), "_", 2)
		if len(parts) < 2 {
			continue
		}

		version, err := strconv.Atoi(parts[0])
		if err != nil {
			log.Printf("Warning: skipping invalid migration file %s", entry.Name())
			continue
		}

		content, err := os.ReadFile(filepath.Join(m.migrationsDir, entry.Name()))
		if err != nil {
			return nil, fmt.Errorf("failed to read migration %s: %w", entry.Name(), err)
		}

		name := strings.TrimSuffix(parts[1], ".sql")
		migrations = append(migrations, Migration{
			Version: version,
			Name:    name,
			SQL:     string(content),
		})
	}

	// Sort by version
	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].Version < migrations[j].Version
	})

	return migrations, nil
}

// RunMigrations executes all pending migrations
func (m *Migrator) RunMigrations(ctx context.Context) error {
	if err := m.ensureMigrationsTable(ctx); err != nil {
		return fmt.Errorf("failed to ensure migrations table: %w", err)
	}

	migrations, err := m.LoadMigrations()
	if err != nil {
		return fmt.Errorf("failed to load migrations: %w", err)
	}

	applied, err := m.GetAppliedMigrations(ctx)
	if err != nil {
		return fmt.Errorf("failed to get applied migrations: %w", err)
	}

	appliedMap := make(map[int]bool)
	for _, v := range applied {
		appliedMap[v] = true
	}

	for _, migration := range migrations {
		if appliedMap[migration.Version] {
			log.Printf("Migration %d (%s) already applied, skipping", migration.Version, migration.Name)
			continue
		}

		log.Printf("Applying migration %d: %s", migration.Version, migration.Name)

		// Execute migration in a transaction
		tx, err := m.pool.Begin(ctx)
		if err != nil {
			return fmt.Errorf("failed to begin transaction for migration %d: %w", migration.Version, err)
		}

		// Execute the migration SQL
		_, err = tx.Exec(ctx, migration.SQL)
		if err != nil {
			tx.Rollback(ctx)
			return fmt.Errorf("failed to execute migration %d: %w", migration.Version, err)
		}

		// Record the migration
		_, err = tx.Exec(ctx, `
			INSERT INTO schema_migrations (version, name, applied_at)
			VALUES ($1, $2, NOW())
		`, migration.Version, migration.Name)
		if err != nil {
			tx.Rollback(ctx)
			return fmt.Errorf("failed to record migration %d: %w", migration.Version, err)
		}

		if err := tx.Commit(ctx); err != nil {
			return fmt.Errorf("failed to commit migration %d: %w", migration.Version, err)
		}

		log.Printf("Migration %d applied successfully", migration.Version)
	}

	return nil
}

// Status returns the migration status
func (m *Migrator) Status(ctx context.Context) (string, error) {
	if err := m.ensureMigrationsTable(ctx); err != nil {
		return "", err
	}

	migrations, err := m.LoadMigrations()
	if err != nil {
		return "", err
	}

	applied, err := m.GetAppliedMigrations(ctx)
	if err != nil {
		return "", err
	}

	appliedMap := make(map[int]bool)
	for _, v := range applied {
		appliedMap[v] = true
	}

	var sb strings.Builder
	sb.WriteString("Migration Status:\n")
	sb.WriteString("=================\n")
	sb.WriteString(fmt.Sprintf("Migrations directory: %s\n\n", m.migrationsDir))

	for _, migration := range migrations {
		status := "Pending"
		if appliedMap[migration.Version] {
			status = "Applied"
		}
		sb.WriteString(fmt.Sprintf("%03d: %-30s [%s]\n", migration.Version, migration.Name, status))
	}

	currentVersion, _ := m.GetCurrentVersion(ctx)
	sb.WriteString(fmt.Sprintf("\nCurrent schema version: %d\n", currentVersion))
	sb.WriteString(fmt.Sprintf("Total migrations: %d\n", len(migrations)))
	sb.WriteString(fmt.Sprintf("Applied migrations: %d\n", len(applied)))
	sb.WriteString(fmt.Sprintf("Pending migrations: %d\n", len(migrations)-len(applied)))

	return sb.String(), nil
}

// MigrateUp runs all pending migrations
func (m *Migrator) MigrateUp(ctx context.Context) error {
	return m.RunMigrations(ctx)
}

// MigrateTo migrates to a specific version
func (m *Migrator) MigrateTo(ctx context.Context, targetVersion int) error {
	if err := m.ensureMigrationsTable(ctx); err != nil {
		return err
	}

	migrations, err := m.LoadMigrations()
	if err != nil {
		return err
	}

	applied, err := m.GetAppliedMigrations(ctx)
	if err != nil {
		return err
	}

	appliedMap := make(map[int]bool)
	for _, v := range applied {
		appliedMap[v] = true
	}

	for _, migration := range migrations {
		if migration.Version > targetVersion {
			break
		}
		if appliedMap[migration.Version] {
			continue
		}

		log.Printf("Applying migration %d: %s", migration.Version, migration.Name)

		tx, err := m.pool.Begin(ctx)
		if err != nil {
			return err
		}

		_, err = tx.Exec(ctx, migration.SQL)
		if err != nil {
			tx.Rollback(ctx)
			return fmt.Errorf("migration %d failed: %w", migration.Version, err)
		}

		_, err = tx.Exec(ctx, `
			INSERT INTO schema_migrations (version, name) VALUES ($1, $2)
		`, migration.Version, migration.Name)
		if err != nil {
			tx.Rollback(ctx)
			return err
		}

		if err := tx.Commit(ctx); err != nil {
			return err
		}
	}

	return nil
}

// GetMigrationFilePath returns the path for a new migration file
func GetMigrationFilePath(name string) string {
	timestamp := time.Now().Format("20060102150405")
	filename := fmt.Sprintf("%s_%s.sql", timestamp, name)
	return filepath.Join("migrations", filename)
}
