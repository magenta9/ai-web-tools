package handler

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/magenta9/ai-web-tools/server/internal/config"
)

// Model represents a unified model structure
type Model struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	Provider      string `json:"provider"`
	Description   string `json:"description,omitempty"`
	ContextLength int    `json:"context_length,omitempty"`
	Size          int64  `json:"size,omitempty"`
}

// ModelsConfig represents the models.json structure
type ModelsConfig struct {
	OpenAI    []ModelInfo `json:"openai"`
	Anthropic []ModelInfo `json:"anthropic"`
}

// ModelInfo represents model information from config
type ModelInfo struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	Description   string `json:"description"`
	ContextLength int    `json:"context_length"`
}

// ModelHandler handles model-related requests
type ModelHandler struct {
	cfg          *config.Config
	ollamaHost   string
	modelsConfig *ModelsConfig
}

// NewModelHandler creates a new model handler
func NewModelHandler(cfg *config.Config) *ModelHandler {
	h := &ModelHandler{
		cfg:        cfg,
		ollamaHost: cfg.OllamaHost,
	}
	h.loadModelsConfig()
	return h
}

// loadModelsConfig loads models from config/models.json
func (h *ModelHandler) loadModelsConfig() {
	// Try multiple possible paths
	paths := []string{
		"config/models.json",
		"../config/models.json",
		"server-go/config/models.json",
		"/app/config/models.json", // Docker path
	}

	var data []byte
	var err error

	for _, path := range paths {
		data, err = os.ReadFile(path)
		if err == nil {
			break
		}
	}

	if err != nil {
		// Use default config if file not found
		h.modelsConfig = &ModelsConfig{
			OpenAI: []ModelInfo{
				{ID: "gpt-4o", Name: "GPT-4o", Description: "Most advanced GPT-4 model", ContextLength: 128000},
				{ID: "gpt-4o-mini", Name: "GPT-4o Mini", Description: "Faster and cheaper", ContextLength: 128000},
			},
			Anthropic: []ModelInfo{
				{ID: "claude-3-5-sonnet-20241022", Name: "Claude 3.5 Sonnet", Description: "Most intelligent", ContextLength: 200000},
			},
		}
		return
	}

	var cfg ModelsConfig
	if err := json.Unmarshal(data, &cfg); err == nil {
		h.modelsConfig = &cfg
	}
}

// GetAllModels returns all available models from all providers
func (h *ModelHandler) GetAllModels(c *gin.Context) {
	var allModels []Model

	// Get Ollama models (dynamic)
	ollamaModels := h.getOllamaModels()
	allModels = append(allModels, ollamaModels...)

	// Get OpenAI models (from config)
	if h.cfg.OpenAIAPIKey != "" {
		for _, m := range h.modelsConfig.OpenAI {
			allModels = append(allModels, Model{
				ID:            m.ID,
				Name:          m.Name,
				Provider:      "openai",
				Description:   m.Description,
				ContextLength: m.ContextLength,
			})
		}
	}

	// Get Anthropic models (from config)
	if h.cfg.AnthropicAPIKey != "" {
		// Use configured model if available
		if h.cfg.AnthropicModel != "" {
			modelName := h.cfg.AnthropicModel
			displayName := modelName
			
			// Map model names to display names
			switch modelName {
			case "glm-4.7":
				displayName = "GLM-4.7"
			case "claude-3-5-sonnet-20241022":
				displayName = "Claude 3.5 Sonnet"
			}
			
			allModels = append(allModels, Model{
				ID:            modelName,
				Name:          displayName,
				Provider:      "anthropic",
				Description:   "AI Language Model",
				ContextLength: 200000,
			})
		} else {
			// Fallback to config file models
			for _, m := range h.modelsConfig.Anthropic {
				allModels = append(allModels, Model{
					ID:            m.ID,
					Name:          m.Name,
					Provider:      "anthropic",
					Description:   m.Description,
					ContextLength: m.ContextLength,
				})
			}
		}
	}

	c.JSON(200, gin.H{
		"success": true,
		"models":  allModels,
	})
}

// GetModelsByProvider returns models for a specific provider
func (h *ModelHandler) GetModelsByProvider(c *gin.Context) {
	provider := c.Param("provider")
	var models []Model

	switch provider {
	case "ollama":
		models = h.getOllamaModels()
	case "openai":
		if h.cfg.OpenAIAPIKey != "" {
			for _, m := range h.modelsConfig.OpenAI {
				models = append(models, Model{
					ID:            m.ID,
					Name:          m.Name,
					Provider:      "openai",
					Description:   m.Description,
					ContextLength: m.ContextLength,
				})
			}
		}
	case "anthropic":
		if h.cfg.AnthropicAPIKey != "" {
			// Use configured model if available
			if h.cfg.AnthropicModel != "" {
				modelName := h.cfg.AnthropicModel
				displayName := modelName
				
				// Map model names to display names
				switch modelName {
				case "glm-4.7":
					displayName = "GLM-4.7"
				case "claude-3-5-sonnet-20241022":
					displayName = "Claude 3.5 Sonnet"
				}
				
				models = append(models, Model{
					ID:            modelName,
					Name:          displayName,
					Provider:      "anthropic",
					Description:   "AI Language Model",
					ContextLength: 200000,
				})
			} else {
				// Fallback to config file models
				for _, m := range h.modelsConfig.Anthropic {
					models = append(models, Model{
						ID:            m.ID,
						Name:          m.Name,
						Provider:      "anthropic",
						Description:   m.Description,
						ContextLength: m.ContextLength,
					})
				}
			}
		}
	default:
		c.JSON(400, gin.H{"success": false, "error": "Invalid provider"})
		return
	}

	c.JSON(200, gin.H{
		"success": true,
		"models":  models,
	})
}

// getOllamaModels fetches models from Ollama API
func (h *ModelHandler) getOllamaModels() []Model {
	resp, err := http.Get(h.ollamaHost + "/api/tags")
	if err != nil {
		return []Model{}
	}
	defer resp.Body.Close()

	var result map[string]any
	json.NewDecoder(resp.Body).Decode(&result)

	var models []Model
	if modelList, ok := result["models"].([]any); ok {
		for _, model := range modelList {
			if mm, ok := model.(map[string]any); ok {
				m := Model{Provider: "ollama"}
				if name, ok := mm["name"].(string); ok {
					m.ID = name
					m.Name = name
				}
				if size, ok := mm["size"].(float64); ok {
					m.Size = int64(size)
				}
				models = append(models, m)
			}
		}
	}
	return models
}
