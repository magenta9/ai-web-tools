# AI Chat 功能梳理

## 1. 架构概览

AI Chat 功能采用前后端分离架构：
- **前端 (Next.js)**: 提供用户界面，处理用户输入，显示聊天记录，并与后端 API 交互。
- **后端 (Go/Gin)**: 提供 API 接口，处理主要业务逻辑，并充当 Ollama 服务的代理。
- **AI 服务 (Ollama)**: 实际执行大模型推理的外部服务。

## 2. 关键组件

### 前端
- **页面入口**: `app/chat/page.tsx`
  - 管理聊天状态 (`messages`, `input`, `loading`, `model`).
  - 处理消息发送 (`sendMessage`) 和接收响应。
  - 集成 `PromptSelector` 和 `ModelSelector`。
- **消息渲染**: `app/chat/MarkdownMessage.tsx`
  - 使用 `react-markdown` 渲染 Markdown 内容。
  - 支持代码高亮 (Syntax Highlighting)。

### 后端
- **路由配置**: `server-go/cmd/server/main.go`
  - 注册路由 `POST /api/ollama/chat`。
- **业务逻辑**: `server-go/internal/handler/ollama.go`
  - `OllamaHandler` 结构体处理请求。
  - `Chat` 方法处理聊天请求，支持历史上下文。
  - `Generate` 方法处理单次生成请求。

## 3. 数据流向 (Chat Flow)

1. **用户输入**: 用户在前端输入消息并点击发送。
2. **前端请求**: 
   - 前端调用 `POST /api/ollama/chat`。
   - Payload 包含:
     ```json
     {
       "message": "用户输入的内容",
       "model": "选中的模型",
       "messages": [ ...历史消息... ]
     }
     ```
3. **后端处理**:
   - `OllamaHandler.Chat` 接收请求。
   - 如果提供了 `messages` (历史记录)，构建 Ollama 格式的上下文。
   - 如果未指定模型，尝试获取第一个可用模型作为 fallback。
4. **Ollama 交互**:
   - 后端向 Ollama 服务 (`cfg.OllamaHost`) 发起请求。
   - 使用 `/api/chat` (如果有历史) 或 `/api/generate` (单次)。
5. **响应返回**:
   - Ollama 返回生成结果。
   - 后端将结果封装为 JSON 返回给前端。
6. **前端更新**:
   - 前端接收响应，更新 `messages` 状态，显示 AI 回复。

## 4. 特性细节

- **模型选择**: 支持从 Ollama 获取可用模型列表 (`/api/ollama/models`)。
- **Prompt 模板**: 集成了 Prompt 模板功能，允许用户快速选择预设 Prompt。
- **暗色模式**: 支持响应系统或用户设置的主题模式。
- **国际化**: 使用 `useI18n` 提供多语言支持 (代码中显示 `t` 函数的使用)。

## 5. 历史记录功能 (History System)

### 通用历史记录架构
项目包含一套通用的历史记录系统，但目前 **Chat 功能尚未接入**。

#### 后端实现
- **表结构**: `tool_history` 表存储工具的使用记录。
  - 字段: `id`, `tool_name`, `input_data` (JSON), `output_data` (JSON), `created_at`。
- **API 接口**:
  - `POST /api/history`: 保存记录。
  - `GET /api/history`: 获取指定 `tool_name` 的记录。
  - `DELETE /api/history/:id`: 删除单条。
  - `DELETE /api/history`: 清空指定工具的记录。
- **代码位置**: `server-go/internal/handler/history.go`, `server-go/internal/repository/repository.go`。

#### 前端实现
- **Hook**: `useHistory` (`app/hooks/useHistory.ts`)
  - 封装了与后端 API 的交互。
  - 支持 `localStorage` 本地缓存同步。
  - 提供 `saveToHistory`, `loadHistory`, `clearAllHistory` 等方法。
- **组件**: `HistoryPanel` (`app/components/HistoryPanel.tsx`)
  - 通用的侧边栏 UI，用于展示历史列表。
  - 支持删除、清空和加载历史项。

### Chat 功能当前状态
- **缺乏持久化**: 当前 Chat 页面 (`app/chat/page.tsx`) 仅在 React 组件状态 (`useState`) 中维护当前的会话历史。
- **页面刷新即失**: 刷新页面或关闭浏览器后，聊天记录会丢失。
- **未集成通用历史**: Chat 页面没有使用 `useHistory` Hook 或 `HistoryPanel` 组件。
- **上下文传递**: 在单次会话中，前端会将完整的 `messages` 数组发送给后端 (`/api/ollama/chat`)，以保持多轮对话的上下文。
