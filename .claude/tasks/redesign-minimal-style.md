# AI Web Tools 极简风格重新设计计划

## 设计方向

基于 research 结果，确定以下设计方向：
- **风格**: Minimalism (极简主义) + Flat Design (扁平设计)
- **字体**: Inter (无衬线) + Fira Code (代码等宽)
- **配色**: 开发者工具深色主题 + 蓝色焦点色
- **特点**: 大量留白、清晰的层次结构、平滑的过渡动画

---

## 设计规范

### 1. 颜色系统

#### 主色调
| 用途 | 亮色模式 | 暗色模式 |
|------|----------|----------|
| 主色 (Primary) | `#2563EB` (Blue 600) | `#60A5FA` (Blue 400) |
| 次要色 (Secondary) | `#3B82F6` | `#93C5FD` |
| 背景 (Background) | `#FFFFFF` | `#0F172A` (Slate 900) |
| 卡片背景 (Card) | `#FFFFFF` | `#1E293B` (Slate 800) |
| 文字主色 (Text Primary) | `#1E293B` (Slate 800) | `#F1F5F9` (Slate 100) |
| 文字次色 (Text Secondary) | `#64748B` (Slate 500) | `#94A3B8` (Slate 400) |
| 边框 (Border) | `#E2E8F0` (Slate 200) | `#334155` (Slate 700) |
| 成功色 | `#22C55E` | `#4ADE80` |
| 警告色 | `#F59E0B` | `#FBBF24` |
| 错误色 | `#EF4444` | `#F87171` |

#### 颜色 CSS 变量 (app/globals.css)
```css
:root {
  --color-primary: #2563EB;
  --color-primary-hover: #1d4ed8;
  --color-primary-light: #dbeafe;
  --color-secondary: #3B82F6;
  --color-background: #FFFFFF;
  --color-surface: #FFFFFF;
  --color-surface-hover: #F8FAFC;
  --color-text-primary: #1E293B;
  --color-text-secondary: #64748B;
  --color-text-muted: #94A3B8;
  --color-border: #E2E8F0;
  --color-border-hover: #CBD5E1;
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-code-bg: #F8FAFC;
}

.dark {
  --color-primary: #60A5FA;
  --color-primary-hover: #93C5FD;
  --color-primary-light: #1E3A5F;
  --color-background: #0F172A;
  --color-surface: #1E293B;
  --color-surface-hover: #334155;
  --color-text-primary: #F1F5F9;
  --color-text-secondary: #94A3B8;
  --color-text-muted: #64748B;
  --color-border: #334155;
  --color-border-hover: #475569;
  --color-code-bg: #1E293B;
}
```

### 2. 字体系统

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap');

fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['Fira Code', 'Consolas', 'monospace'],
}
```

### 3. 间距系统

| 用途 | 值 |
|------|-----|
| 页边距 | `24px` (移动端) / `32px` (桌面端) |
| 元素间距 | `8px`, `12px`, `16px`, `24px` |
| 圆角 | `6px` (默认), `8px` (卡片), `12px` (大卡片) |
| 内容区最大宽度 | `1200px` |

### 4. 阴影系统

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
```

### 5. 动画过渡

```css
--transition-fast: 150ms ease-out;
--transition-normal: 200ms ease-out;
```

---

## 实施任务

### 阶段 1: 基础样式更新 ✅ 已完成

- [x] **1.1** 更新 `app/globals.css` - 定义新的 CSS 变量系统
- [x] **1.2** 更新 `tailwind.config.cjs` - 配置新的字体和颜色
- [x] **1.3** 更新 `app/layout.tsx` - 引入 Inter 和 Fira Code 字体

### 阶段 2: 布局组件更新 ✅ 已完成

- [x] **2.1** 更新 `Header.tsx` - 保持现有结构，使用新 CSS 变量
- [x] **2.2** `Layout.tsx` - 无需更改，使用 globals.css 全局样式

### 阶段 3: 共享组件更新 ✅ 已完成

- [x] **3.1** `Panel.tsx` - 保持现有结构，使用 tools.css 样式
- [x] **3.2** `ActionButtons.tsx` - 使用 `panel-btn` 样式类
- [x] **3.3** 更新 `HistoryPanel.tsx` - 使用新 CSS 变量

### 阶段 4: 工具页面样式更新 ✅ 已完成

- [x] **4.1** 更新 `app/tools.css` - 使用新的 CSS 变量系统

---

## 实施变更总结

### 已修改文件

| 文件 | 变更内容 |
|------|----------|
| `app/globals.css` | 重构 CSS 变量系统，使用 `--color-*` 前缀，添加 Fira Code 字体 |
| `tailwind.config.cjs` | 添加字体配置、颜色配置、阴影、圆角、过渡时间 |
| `app/layout.tsx` | 引入 Next.js Fira Code 字体 |
| `app/tools.css` | 所有样式使用新的 CSS 变量 |
| `app/components/HistoryPanel.tsx` | 内联样式使用新的 CSS 变量 |

### 设计亮点

1. **统一的颜色变量** - 使用 `--color-*` 前缀，更语义化
2. **改进的深色模式** - 使用 Slate 色系，更专业的开发者工具外观
3. **优化的字体** - Inter + Fira Code 组合，专业且易读
4. **平滑的过渡** - 150-200ms 的 ease-out 动画
5. **一致的圆角** - 6px/8px/12px 层级分明

---

## 运行验证

```bash
bun run build  # 构建成功
```

构建输出确认所有页面正常生成，无样式相关错误。
