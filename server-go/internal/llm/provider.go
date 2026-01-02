package llm

import (
	"github.com/magenta9/ai-web-tools/server/internal/config"
)

// ProviderType 定义 provider 类型
type ProviderType int

const (
	ProviderOllama ProviderType = iota
	ProviderOpenAI
	ProviderAnthropic
)

// Message 表示聊天消息
type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// LLMProvider 统一的LLM接口
type LLMProvider interface {
	Chat(messages []Message, model string) (string, error)
	Generate(prompt string, model string) (string, error)
	GetProviderType() ProviderType
}

// NewProvider 根据配置返回对应的 provider
func NewProvider(cfg *config.Config) LLMProvider {
	if cfg.AnthropicAPIKey != "" {
		return NewAnthropicProvider(cfg)
	}
	if cfg.OpenAIAPIKey != "" {
		return NewOpenAIProvider(cfg)
	}
	return NewOllamaProvider(cfg)
}
