# AI Chat 对话功能增强 - 技术规格说明书

## 1. 需求概述

为 aichat 工具添加三个核心功能：
1. **对话存储**：持久化存储多个对话会话到后端服务器
2. **对话选择**：通过浮动抽屉在不同对话之间切换
3. **对话分叉**：从任意消息创建新的分支对话

---

## 2. 功能规格

### 2.1 对话存储

**数据模型：**
```typescript
interface Conversation {
    id: string                          // 唯一标识
    title: string                       // 对话标题
    messages: ChatMessage[]             // 消息列表
    createdAt: number                   // 创建时间
    updatedAt: number                   // 更新时间
    pinned: boolean                     // 是否置顶/收藏
    parentId?: string                   // 父对话ID（用于分叉追踪）
    model: string                       // 使用的模型
}
```

**存储策略：**
- 后端服务器存储（无需用户认证）
- 实时保存：每次发送消息后立即同步
- 网络错误时前端缓存，待恢复后重试

**标题生成：**
- 自动：第一条用户消息的前 30 个字符
- 用户可编辑

### 2.2 对话选择

**UI 展示：**
- 浮动抽屉（类似 GitHub Copilot）
- 仅显示对话标题
- 支持的操作：
  - 切换对话
  - 删除对话
  - 重命名
  - 置顶/收藏

**排序规则：**
1. 置顶对话优先
2. 按更新时间降序

### 2.3 对话分叉

**触发方式：**
- 右键菜单

**分叉规则：**
- 可从任意消息后分叉
- 分叉后自动切换到新对话
- 仅记录父级对话ID

**分叉对话标题：**
- 原标题 + " (分支)" 或用户重新命名

**原对话状态：**
- 保持不变，用户可随时返回

---

## 3. API 设计

### 3.1 后端接口

```typescript
// 获取对话列表
GET /api/conversations
Response: { conversations: Conversation[] }

// 创建对话
POST /api/conversations
Body: { title?, model }
Response: { conversation: Conversation }

// 获取单个对话
GET /api/conversations/:id
Response: { conversation: Conversation }

// 更新对话
PUT /api/conversations/:id
Body: { title?, messages?, pinned? }
Response: { conversation: Conversation }

// 删除对话
DELETE /api/conversations/:id
Response: { success: boolean }

// 分叉对话
POST /api/conversations/:id/fork
Body: { fromMessageId }
Response: { conversation: Conversation }
```

### 3.2 错误处理

- 网络错误：前端 localStorage 缓存 + 提示重试
- 服务端错误：显示 toast 错误提示
- 数据量过大：分页加载（默认最近 50 个对话）

---

## 4. UI/UX 设计

### 4.1 对话列表组件

**布局：**
- 位置：右侧浮动抽屉
- 触发：顶部工具栏按钮
- 内容：
  - 搜索框（已否决，不需要）
  - 对话列表项
    - 标题（可编辑）
    - 操作按钮（删除、重命名、置顶）
    - 当前对话高亮

**交互：**
- 点击切换对话
- 右键菜单操作
- 双击标题进入编辑模式

### 4.2 消息右键菜单

**选项：**
- 从此处分叉
- 复制消息
- 删除消息（可选）

### 4.3 顶部工具栏更新

**新增按钮：**
- 对话列表切换按钮
- 新建对话按钮

**保留按钮：**
- 清空当前对话
- Prompt 模板
- 模型选择

---

## 5. 边缘情况处理

| 场景 | 处理方式 |
|------|----------|
| 分叉后原对话状态 | 原对话保持不变，标记为"已分叉"（可选视觉提示） |
| 分叉对话标题 | 默认：原标题 + " (分支)" |
| 网络错误保存失败 | 前端 localStorage 降级，显示离线状态，恢复后自动同步 |
| 大量对话数据 | 分页加载，每次加载 50 个，支持"加载更多" |
| 删除当前对话 | 自动切换到最近的对话或创建新对话 |
| 重命名冲突 | 允许重名，系统不限制 |
| 并发编辑冲突 | 后续操作覆盖前序操作（无需锁机制） |
| 对话数据过大 | 仅加载消息列表，进入对话时才加载完整内容 |

---

## 6. 技术实现要点

### 6.1 前端

1. **状态管理**
   - `useConversations` hook 管理对话列表
   - `useActiveConversation` hook 管理当前对话
   - 使用 SWR 或 React Query 处理数据同步

2. **组件结构**
   ```
   ChatPage/
   ├── ConversationDrawer (新增)
   ├── ConversationListItem (新增)
   ├── MessageContextMenu (新增)
   ├── ChatHeader (修改)
   └── ChatMessages (修改)
   ```

3. **API 调用**
   - 封装 `/app/api/conversations.ts` 客户端
   - 实现重试机制和离线缓存

### 6.2 后端（Go Server）

1. **数据存储**
   - 使用现有的存储方案
   - 无需用户认证，使用设备 ID 或会话 ID 隔离

2. **API 实现**
   - 新增 `ConversationHandler`
   - 实现 CRUD + Fork 操作

3. **性能优化**
   - 对话列表缓存
   - 消息数据按需加载

---

## 7. 实施步骤

### Phase 1: 后端 API
- [ ] 设计并实现 Conversation 数据模型
- [ ] 实现后端 CRUD 接口
- [ ] 实现 Fork 接口
- [ ] 添加 API 测试

### Phase 2: 前端基础
- [ ] 创建 `useConversations` hook
- [ ] 实现 API 客户端封装
- [ ] 添加基础类型定义

### Phase 3: UI 组件
- [ ] 实现 ConversationDrawer 组件
- [ ] 实现 ConversationListItem 组件
- [ ] 实现 MessageContextMenu 组件
- [ ] 更新 ChatPage 布局

### Phase 4: 集成与优化
- [ ] 连接前后端
- [ ] 实现实时保存
- [ ] 添加错误处理
- [ ] 边缘情况测试
- [ ] 性能优化

### Phase 5: 测试与发布
- [ ] 端到端测试
- [ ] 用户测试
- [ ] 文档更新

---

## 8. 风险与权衡

| 风险 | 缓解措施 |
|------|----------|
| 后端存储无认证，数据可能混乱 | 后续可添加设备级别隔离 |
| localStorage 容量限制 | 主要依赖后端，localStorage 仅作缓存 |
| 大量对话时性能问题 | 分页加载 + 虚拟滚动 |
| 实时保存频繁请求 | 防抖 + 批量发送 |
| Fork 后对话关系复杂 | 仅记录父级，不追踪完整树结构 |

---

## 9. 成功标准

- [ ] 用户可以创建、切换、删除对话
- [ ] 用户可以从任意消息分叉对话
- [ ] 对话数据实时保存到后端
- [ ] 网络错误时有降级方案
- [ ] UI 响应流畅，无明显卡顿
- [ ] 所有边缘情况有合理处理
