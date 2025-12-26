# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 提供代码库开发指导。

## 项目概述

Web Tools 的 Go API 服务器，为前端静态页面提供后端 API 服务（AI 功能、数据库操作、历史记录存储）。

## 技术栈

- **Web 框架**: Gin v1.10
- **PostgreSQL 驱动**: pgx v5 (参考 [docs/pg_best_practices.md](./docs/pg_best_practices.md))
- **MySQL 驱动**: go-sql-driver/mysql
- **环境变量**: godotenv
- **Go 版本**: 1.23+

## 目录结构

```
server-go/
├── cmd/
│   └── server/
│       └── main.go              # 应用入口
├── internal/
│   ├── config/
│   │   └── config.go            # 配置管理
│   ├── handler/
│   │   ├── database.go          # MySQL 数据库操作
│   │   ├── history.go           # 历史记录管理
│   │   └── ollama.go            # Ollama AI 接口
│   ├── model/
│   │   └── model.go             # 数据模型定义
│   └── repository/
│       └── repository.go        # PostgreSQL 数据访问层
├── docker/
│   ├── docker-compose.yml       # PostgreSQL 容器配置
│   └── init.sql                 # 数据库初始化脚本
├── docs/
│   └── pg_best_practices.md     # PostgreSQL 最佳实践指南
├── Makefile                     # 常用命令
├── go.mod                       # Go 模块定义
├── .env.example                 # 环境变量示例
└── README.md
```

## 开发命令

```bash
# 数据库管理
make db-up          # 启动 PostgreSQL 容器
make db-down        # 停止 PostgreSQL 容器
make db-reset       # 重置数据库（删除所有数据）
make db-logs        # 查看数据库日志

# 应用开发
make run            # 运行服务器（开发模式）
make build          # 编译二进制文件到 bin/server
make clean          # 清理编译产物
```

## 开发规范

### PostgreSQL 开发

所有 PostgreSQL 操作请参考 [docs/pg_best_practices.md](./docs/pg_best_practices.md)，包括：

- 使用 `pgx` 而非 `lib/pq`
- 使用 `pgxpool` 管理连接池
- 优先使用 `sqlc` 生成类型安全代码
- 使用 `CopyFrom` 进行批量插入
- 使用事务闭包封装操作

### API 开发

1. Handler 放在 `internal/handler/` 目录
2. 在 `cmd/server/main.go` 中注册路由
3. 数据库操作在 `internal/repository/` 中添加
4. 遵循现有 API 响应格式 `{ "success": true, ... }`

### 数据库变更

1. 修改 `docker/init.sql` 定义表结构
2. 运行 `make db-reset` 重置数据库

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `API_PORT` | 3001 | API 服务端口 |
| `DB_HOST` | localhost | PostgreSQL 主机 |
| `DB_PORT` | 5432 | PostgreSQL 端口 |
| `DB_USER` | webtools | PostgreSQL 用户名 |
| `DB_PASSWORD` | webtools123 | PostgreSQL 密码 |
| `DB_NAME` | webtools | PostgreSQL 数据库名 |
| `OLLAMA_HOST` | http://localhost:11434 | Ollama API 地址 |

## 关键约束

- **数据库查询安全**: 仅允许 `SELECT`、`SHOW`、`DESCRIBE`、`EXPLAIN`、`WITH` 开头的查询
- **PostgreSQL 优雅降级**: 即使 PostgreSQL 不可用，服务器也能正常启动（历史记录功能除外）
- **API 兼容**: 与原 Node.js 服务器 API 完全兼容
