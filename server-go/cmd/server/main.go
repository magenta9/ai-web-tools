package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/magenta9/ai-web-tools/server/internal/config"
	"github.com/magenta9/ai-web-tools/server/internal/handler"
	"github.com/magenta9/ai-web-tools/server/internal/migration"
	"github.com/magenta9/ai-web-tools/server/internal/repository"
)

func main() {
	// Parse command line flags
	migrateCmd := flag.NewFlagSet("migrate", flag.ExitOnError)
	migrateAction := migrateCmd.String("action", "up", "Migration action: up, status, version")

	if len(os.Args) > 1 && os.Args[1] == "migrate" {
		migrateCmd.Parse(os.Args[2:])
		runMigrationCommand(*migrateAction)
		return
	}

	cfg := config.Load()

	// Run auto migrations if enabled
	if cfg.MigrationAuto {
		log.Println("Running automatic database migrations...")
		if err := runAutoMigrations(cfg); err != nil {
			log.Printf("Warning: Migration failed: %v", err)
		}
	}

	// Repository (optional - continues without DB if unavailable)
	repo, err := repository.New(cfg)
	if err != nil {
		log.Printf("Warning: Database unavailable: %v", err)
	} else {
		defer repo.Close()
	}

	// Handlers
	ollamaH := handler.NewOllamaHandler(cfg)
	modelH := handler.NewModelHandler(cfg)
	dbH := handler.NewDBHandler()
	var historyH *handler.HistoryHandler
	var promptH *handler.PromptHandler
	if repo != nil {
		historyH = handler.NewHistoryHandler(repo)
		promptH = handler.NewPromptHandler(repo)
	}

	// Router
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		MaxAge:           12 * time.Hour,
	}))

	// Request logging
	r.Use(func(c *gin.Context) {
		log.Printf("%s %s %s", time.Now().Format(time.RFC3339), c.Request.Method, c.Request.URL.Path)
		c.Next()
	})

	// Routes
	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status":    "ok",
				"timestamp": time.Now().Format(time.RFC3339),
				"version":   getVersion(),
			})
		})

		// Models (unified across all providers)
		api.GET("/models", modelH.GetAllModels)
		api.GET("/models/:provider", modelH.GetModelsByProvider)

		// Ollama
		ollama := api.Group("/ollama")
		{
			ollama.GET("/models", ollamaH.GetModels)
			ollama.POST("/generate", ollamaH.Generate)
			ollama.POST("/chat", ollamaH.Chat)
			ollama.POST("/translate", ollamaH.Translate)
		}

		// Database
		db := api.Group("/db")
		{
			db.POST("/connect", dbH.Connect)
			db.POST("/databases", dbH.GetDatabases)
			db.POST("/schema", dbH.GetSchema)
			db.POST("/execute", dbH.Execute)
		}

		// History (only if DB available)
		if historyH != nil {
			api.POST("/history", historyH.Save)
			api.GET("/history", historyH.Get)
			api.DELETE("/history/:id", historyH.Delete)
			api.DELETE("/history", historyH.Clear)
		}

		// Prompts (only if DB available)
		if promptH != nil {
			prompts := api.Group("/prompts")
			{
				prompts.POST("", promptH.Create)
				prompts.GET("", promptH.List)
				prompts.GET("/tags", promptH.GetTags)
				prompts.GET("/:id", promptH.Get)
				prompts.PUT("/:id", promptH.Update)
				prompts.DELETE("/:id", promptH.Delete)
				prompts.POST("/:id/use", promptH.IncrementUse)
			}
		}
	}

	log.Printf("Server running on http://localhost:%s", cfg.APIPort)
	log.Printf("Ollama host: %s", cfg.OllamaHost)
	if err := r.Run(":" + cfg.APIPort); err != nil {
		log.Fatal(err)
	}
}

func runAutoMigrations(cfg *config.Config) error {
	migrator, err := migration.NewMigratorFromDSN(cfg.GetDSN())
	if err != nil {
		return err
	}
	defer migrator.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	return migrator.RunMigrations(ctx)
}

func runMigrationCommand(action string) {
	cfg := config.Load()

	migrator, err := migration.NewMigratorFromDSN(cfg.GetDSN())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer migrator.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	switch action {
	case "up":
		log.Println("Running migrations...")
		if err := migrator.MigrateUp(ctx); err != nil {
			log.Fatalf("Migration failed: %v", err)
		}
		log.Println("Migrations completed successfully")

	case "status":
		status, err := migrator.Status(ctx)
		if err != nil {
			log.Fatalf("Failed to get migration status: %v", err)
		}
		fmt.Println(status)

	case "version":
		version, err := migrator.GetCurrentVersion(ctx)
		if err != nil {
			log.Fatalf("Failed to get current version: %v", err)
		}
		fmt.Printf("Current schema version: %d\n", version)

	default:
		log.Fatalf("Unknown migration action: %s", action)
	}
}

func getVersion() string {
	// This would typically be set at build time
	return "1.0.0"
}
