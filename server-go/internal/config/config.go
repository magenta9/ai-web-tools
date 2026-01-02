package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	APIPort    string
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string

	// Ollama configuration
	OllamaHost   string
	OllamaAPIKey string

	// Alternative LLM providers
	OpenAIAPIKey     string
	OpenAIBaseURL    string
	AnthropicAPIKey  string
	AnthropicBaseURL string

	// Migration settings
	MigrationAuto bool
	SchemaVersion int
}

func Load() *Config {
	godotenv.Load()

	return &Config{
		APIPort:         getEnv("API_PORT", "3001"),
		DBHost:          getEnv("DB_HOST", "localhost"),
		DBPort:          getEnv("DB_PORT", "5432"),
		DBUser:          getEnv("DB_USER", "webtools"),
		DBPassword:      getEnv("DB_PASSWORD", "webtools123"),
		DBName:          getEnv("DB_NAME", "webtools"),
		OllamaHost:      getEnv("OLLAMA_HOST", "http://localhost:11434"),
		OllamaAPIKey:    getEnv("OLLAMA_API_KEY", ""),
		OpenAIAPIKey:    getEnv("OPENAI_API_KEY", ""),
		OpenAIBaseURL:   getEnv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
		AnthropicAPIKey:  getEnv("ANTHROPIC_API_KEY", ""),
		AnthropicBaseURL: getEnv("ANTHROPIC_BASE_URL", "https://api.anthropic.com"),
		MigrationAuto:   getEnvBool("DB_MIGRATION_AUTO", true),
		SchemaVersion:   getEnvInt("DB_SCHEMA_VERSION", 3),
	}
}

// GetDSN returns the PostgreSQL connection string
func (c *Config) GetDSN() string {
	return "postgres://" + c.DBUser + ":" + c.DBPassword + "@" + c.DBHost + ":" + c.DBPort + "/" + c.DBName + "?sslmode=disable"
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvBool(key string, fallback bool) bool {
	if v := os.Getenv(key); v != "" {
		b, err := strconv.ParseBool(v)
		if err == nil {
			return b
		}
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		i, err := strconv.Atoi(v)
		if err == nil {
			return i
		}
	}
	return fallback
}
