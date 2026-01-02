package llm

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/magenta9/ai-web-tools/server/internal/config"
)

type OllamaProvider struct {
	host   string
	client *http.Client
}

func NewOllamaProvider(cfg *config.Config) *OllamaProvider {
	return &OllamaProvider{
		host:   cfg.OllamaHost,
		client: &http.Client{Timeout: 120 * time.Second},
	}
}

func (p *OllamaProvider) GetProviderType() ProviderType {
	return ProviderOllama
}

func (p *OllamaProvider) Chat(messages []Message, model string) (string, error) {
	if model == "" {
		model = "llama3.2"
	}

	// 转换为Ollama格式
	ollamaMessages := make([]map[string]any, 0, len(messages))
	for _, msg := range messages {
		ollamaMessages = append(ollamaMessages, map[string]any{
			"role":    msg.Role,
			"content": msg.Content,
		})
	}

	reqBody := map[string]any{
		"model":    model,
		"messages": ollamaMessages,
		"stream":   false,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("marshal request: %w", err)
	}

	resp, err := http.Post(p.host+"/api/chat", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("read response: %w", err)
	}

	var result map[string]any
	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("unmarshal response: %w", err)
	}

	if message, ok := result["message"].(map[string]any); ok {
		if content, ok := message["content"].(string); ok {
			return content, nil
		}
	}

	return "", fmt.Errorf("invalid response format")
}

func (p *OllamaProvider) Generate(prompt string, model string) (string, error) {
	if model == "" {
		model = "llama3.2"
	}

	reqBody := map[string]any{
		"model":  model,
		"prompt": prompt,
		"stream": false,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("marshal request: %w", err)
	}

	resp, err := http.Post(p.host+"/api/generate", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("read response: %w", err)
	}

	var result map[string]any
	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("unmarshal response: %w", err)
	}

	if response, ok := result["response"].(string); ok {
		return response, nil
	}

	return "", fmt.Errorf("invalid response format")
}
