# 模型配置说明

本项目支持多个 LLM 提供商，不同提供商使用不同的模型列表加载方式。

## 提供商类型

### 1. Ollama（动态加载）

Ollama 的模型列表通过 API 动态获取，无需配置文件。

**配置**：
```bash
OLLAMA_HOST=http://localhost:11434
```

**API**：
- 获取所有 Ollama 模型：`GET /api/models/ollama`
- Ollama 会自动从运行中的 Ollama 服务获取可用模型列表

### 2. OpenAI & Anthropic（配置文件）

OpenAI 和 Anthropic 的模型列表通过 `config/models.json` 配置文件加载。

**配置文件位置**：`server-go/config/models.json`

**格式**：
```json
{
  "openai": [
    {
      "id": "gpt-4o",
      "name": "GPT-4o",
      "description": "Most advanced GPT-4 model",
      "context_length": 128000
    }
  ],
  "anthropic": [
    {
      "id": "claude-3-5-sonnet-20241022",
      "name": "Claude 3.5 Sonnet",
      "description": "Most intelligent model",
      "context_length": 200000
    }
  ]
}
```

**环境变量**：
```bash
# OpenAI
OPENAI_API_KEY=your-key
OPENAI_BASE_URL=https://api.openai.com/v1

# Anthropic
ANTHROPIC_API_KEY=your-key
ANTHROPIC_BASE_URL=https://api.anthropic.com
```

**注意**：只有配置了对应的 API Key，该提供商的模型才会在列表中显示。

## API 端点

### 获取所有模型
```bash
GET /api/models
```

返回所有已配置提供商的模型列表。

**响应示例**：
```json
{
  "success": true,
  "models": [
    {
      "id": "gpt-oss:20b-cloud",
      "name": "gpt-oss:20b-cloud",
      "provider": "ollama",
      "size": 381
    },
    {
      "id": "gpt-4o",
      "name": "GPT-4o",
      "provider": "openai",
      "description": "Most advanced GPT-4 model",
      "context_length": 128000
    },
    {
      "id": "claude-3-5-sonnet-20241022",
      "name": "Claude 3.5 Sonnet",
      "provider": "anthropic",
      "description": "Most intelligent model",
      "context_length": 200000
    }
  ]
}
```

### 按提供商获取模型
```bash
GET /api/models/:provider
```

**参数**：
- `provider`: `ollama` | `openai` | `anthropic`

**示例**：
```bash
# 获取 Ollama 模型
curl http://localhost:3001/api/models/ollama

# 获取 OpenAI 模型
curl http://localhost:3001/api/models/openai

# 获取 Anthropic 模型
curl http://localhost:3001/api/models/anthropic
```

## 添加新模型

### Ollama
直接在 Ollama 中拉取模型即可：
```bash
ollama pull llama3.2
```

### OpenAI / Anthropic
编辑 `server-go/config/models.json`，添加新的模型配置：
```json
{
  "openai": [
    {
      "id": "new-model-id",
      "name": "New Model Name",
      "description": "Model description",
      "context_length": 128000
    }
  ]
}
```

重启服务器后生效。

## 配置文件路径查找

系统会按以下顺序查找 `models.json`：
1. `config/models.json`
2. `../config/models.json`
3. `server-go/config/models.json`
4. `/app/config/models.json` (Docker 容器内)

如果找不到配置文件，会使用内置的默认配置。
