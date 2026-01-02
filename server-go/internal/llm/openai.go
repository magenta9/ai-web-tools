package llm

import (
	"fmt"

	"github.com/magenta9/ai-web-tools/server/internal/config"
)

type OpenAIProvider struct {
	apiKey  string
	baseURL string
}

func NewOpenAIProvider(cfg *config.Config) *OpenAIProvider {
	baseURL := cfg.OpenAIBaseURL
	if baseURL == "" {
		baseURL = "https://api.openai.com/v1"
	}
	return &OpenAIProvider{
		apiKey:  cfg.OpenAIAPIKey,
		baseURL: baseURL,
	}
}

func (p *OpenAIProvider) GetProviderType() ProviderType {
	return ProviderOpenAI
}

func (p *OpenAIProvider) Chat(messages []Message, model string) (string, error) {
	// TODO: 实现OpenAI API调用
	return "", fmt.Errorf("OpenAI provider not implemented yet")
}

func (p *OpenAIProvider) ChatStream(messages []Message, model string, callback StreamCallback) error {
	// TODO: 实现OpenAI流式响应
	return fmt.Errorf("streaming not implemented for OpenAI provider")
}

func (p *OpenAIProvider) Generate(prompt string, model string) (string, error) {
	// TODO: 实现OpenAI API调用
	return "", fmt.Errorf("OpenAI provider not implemented yet")
}
