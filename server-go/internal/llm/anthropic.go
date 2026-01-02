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

type AnthropicProvider struct {
	apiKey  string
	baseURL string
	client  *http.Client
}

type anthropicRequest struct {
	Model     string                   `json:"model"`
	MaxTokens int                      `json:"max_tokens"`
	Messages  []anthropicMessage       `json:"messages"`
	System    string                   `json:"system,omitempty"`
}

type anthropicMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type anthropicResponse struct {
	Content []struct {
		Text string `json:"text"`
		Type string `json:"type"`
	} `json:"content"`
	Error struct {
		Type    string `json:"type"`
		Message string `json:"message"`
	} `json:"error"`
}

func NewAnthropicProvider(cfg *config.Config) *AnthropicProvider {
	baseURL := cfg.AnthropicBaseURL
	if baseURL == "" {
		baseURL = "https://api.anthropic.com"
	}
	return &AnthropicProvider{
		apiKey:  cfg.AnthropicAPIKey,
		baseURL: baseURL,
		client:  &http.Client{Timeout: 120 * time.Second},
	}
}

func (p *AnthropicProvider) GetProviderType() ProviderType {
	return ProviderAnthropic
}

func (p *AnthropicProvider) Chat(messages []Message, model string) (string, error) {
	if model == "" {
		model = "claude-3-5-sonnet-20241022"
	}

	// 转换消息格式
	anthropicMessages := make([]anthropicMessage, 0, len(messages))
	for _, msg := range messages {
		anthropicMessages = append(anthropicMessages, anthropicMessage{
			Role:    msg.Role,
			Content: msg.Content,
		})
	}

	reqBody := anthropicRequest{
		Model:     model,
		MaxTokens: 4000,
		Messages:  anthropicMessages,
	}

	return p.makeRequest(reqBody)
}

func (p *AnthropicProvider) Generate(prompt string, model string) (string, error) {
	if model == "" {
		model = "claude-3-5-sonnet-20241022"
	}

	messages := []Message{
		{Role: "user", Content: prompt},
	}

	return p.Chat(messages, model)
}

func (p *AnthropicProvider) makeRequest(reqBody anthropicRequest) (string, error) {
	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", p.baseURL+"/v1/messages", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", p.apiKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	resp, err := p.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("API error %d: %s", resp.StatusCode, string(body))
	}

	var anthropicResp anthropicResponse
	if err := json.Unmarshal(body, &anthropicResp); err != nil {
		return "", fmt.Errorf("unmarshal response: %w", err)
	}

	if anthropicResp.Error.Message != "" {
		return "", fmt.Errorf("anthropic error: %s", anthropicResp.Error.Message)
	}

	if len(anthropicResp.Content) == 0 {
		return "", fmt.Errorf("no content in response")
	}

	return anthropicResp.Content[0].Text, nil
}
