# Golang + PostgreSQL 最佳实践指南

本文档旨在为 Golang 项目中使用 PostgreSQL 提供标准化的开发规范与性能优化建议。基于目前的 Go 生态，建议全面采用 **pgx v5** 作为核心驱动。

## 1. 驱动与生态选型

### 1.1 核心驱动：`pgx`

**结论**：放弃 `lib/pq`（已进入维护模式），全面使用 **[jackc/pgx/v5](https://github.com/jackc/pgx)**。

* **理由**：
* **性能**：基于 PostgreSQL 二进制协议，解析速度远超文本协议。
* **功能**：原生支持 PostgreSQL 特性（JSONB, Arrays, Listen/Notify, COPY）。
* **并发**：内置高性能连接池，无需经过 `database/sql` 的通用抽象层（虽然也可以兼容）。



### 1.2 SQL 代码生成：`sqlc` (强烈推荐)

**结论**：优先使用 **[sqlc](https://sqlc.dev/)** 生成类型安全的 Go 代码，而非使用反射型 ORM（如 GORM）。

* **优点**：
* **编译期检查**：SQL 写错，Go 代码编译不过。
* **零运行时开销**：生成的代码就是原生 `pgx` 调用，性能极致。
* **类型安全**：自动将 SQL 字段映射为 Go 结构体。



---

## 2. 连接池管理 (Connection Pooling)

生产环境**必须**使用 `pgxpool`，严禁使用单连接。

### 2.1 初始化配置模板

```go
package db

import (
	"context"
	"time"
	"github.com/jackc/pgx/v5/pgxpool"
)

func NewPool(ctx context.Context, connStr string) (*pgxpool.Pool, error) {
	config, err := pgxpool.ParseConfig(connStr)
	if err != nil {
		return nil, err
	}

	// 连接池调优配置
	config.MaxConns = 100                     // 根据数据库规格调整，通常不超过 CPU 核数 * 4
	config.MinConns = 10                      // 保持一定的空闲连接以应对突发流量
	config.MaxConnLifetime = time.Hour        // 连接最大存活时间，防止这种连接在服务端因为超时被关闭
	config.MaxConnIdleTime = 30 * time.Minute // 空闲连接回收时间

	// 健康检查配置 (Jitter 避免惊群效应)
	config.HealthCheckPeriod = 1 * time.Minute

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, err
	}

	// 启动时立即验证连接
	if err := pool.Ping(ctx); err != nil {
		return nil, err
	}

	return pool, nil
}

```

---

## 3. 高性能数据操作

### 3.1 批量插入 (Bulk Insert)

**反模式**：在循环中执行 `INSERT`。
**最佳实践**：使用 `pgx.CopyFrom` (基于 PG 的 `COPY` 协议)，速度比 `INSERT` 快一个数量级。

```go
// 示例：批量插入用户
func BulkInsertUsers(ctx context.Context, pool *pgxpool.Pool, users []User) (int64, error) {
	rows := [][]interface{}{}
	for _, u := range users {
		rows = append(rows, []interface{}{u.Name, u.Email, u.Role})
	}

	return pool.CopyFrom(
		ctx,
		pgx.Identifier{"users"},
		[]string{"name", "email", "role"},
		pgx.CopyFromRows(rows),
	)
}

```

### 3.2 批处理查询 (Batch Queries)

**场景**：需要在一个网络往返（RTT）中执行多条不相关的 SQL。

```go
batch := &pgx.Batch{}
batch.Queue("INSERT INTO logs(msg) VALUES($1)", "log_1")
batch.Queue("SELECT count(*) FROM users")

br := pool.SendBatch(ctx, batch)
defer br.Close() // 必须关闭

_, err := br.Exec() // 执行 Insert
var count int
err = br.QueryRow().Scan(&count) // 获取 Select 结果

```

---

## 4. 事务与并发控制

### 4.1 安全事务闭包

避免直接在业务逻辑中散落 `Begin` 和 `Commit`，容易造成死锁或未回滚。

```go
// 通用事务封装
func RunInTx(ctx context.Context, pool *pgxpool.Pool, fn func(pgx.Tx) error) error {
	tx, err := pool.Begin(ctx)
	if err != nil {
		return err
	}
	
	// 默认回滚：如果 fn 返回错误或发生 panic，这里会兜底
	// 如果 Commit 成功，Rollback 会变为 no-op
	defer tx.Rollback(ctx)

	if err := fn(tx); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

```

---

## 5. 数据类型映射

### 5.1 JSONB 处理

PostgreSQL 的 JSONB 是强项，Go 中应当直接映射结构体或 Map。

* **表结构**: `metadata JSONB`
* **Go 结构**: 使用 Tag 映射

```go
type UserProfile struct {
    Theme string `json:"theme"`
    Tags  []int  `json:"tags"`
}

// 写入：pgx 自动序列化
pool.Exec(ctx, "INSERT INTO users (profile) VALUES ($1)", UserProfile{...})

// 读取：需要实现 Scan 或让 pgx 自动处理
var profile UserProfile
// 注意：对于复杂结构体，建议查询出 []byte 后自行 json.Unmarshal，或使用 sqlc 自动生成

```

### 5.2 Null 值处理

尽量避免在 Go 中使用 `sql.NullString` 这类结构，操作繁琐。
**建议**：

1. **pgtype 包**：使用 `pgx/v5/pgtype` (如 `pgtype.Text`, `pgtype.Int4`)。
2. **指针**：对于可为 NULL 的字段，使用 Go 指针 (如 `*string`)。

---

## 6. 安全规范

1. **参数化查询**：**严禁**使用 `fmt.Sprintf` 拼接 SQL。
* ✅ `pool.Exec(ctx, "SELECT * FROM users WHERE id=$1", id)`
* ❌ `pool.Exec(ctx, "SELECT * FROM users WHERE id=" + id)`


2. **动态标识符**：如果表名或列名需要动态拼接，必须使用 `pgx.Identifier` 进行转义。
```go
// 安全转义表名
tbl := pgx.Identifier{"public", "user_logs"}.Sanitize()
sql := "SELECT * FROM " + tbl

```



---

## 7. 常见问题排查 (Troubleshooting)

| 错误现象 | 可能原因 | 解决方案 |
| --- | --- | --- |
| `driver: bad connection` | 连接已断开或超时 | 检查 `MaxConnLifetime` 设置，确保小于数据库侧的 `idle_timeout`。 |
| `conn busy` | 连接被占用 | 检查是否在 `Scan` 完成前就尝试复用连接，或者忘记关闭 `Rows`。 |
| `insufficient data in buffer` | 协议解析错误 | 确认是否混用了 `lib/pq` 和 `pgx`，或数据库版本过低。 |

---

## 8. 工具链推荐

* **迁移工具 (Migration)**:
* [golang-migrate/migrate](https://github.com/golang-migrate/migrate) (通用，CLI 友好)
* [pressly/goose](https://github.com/pressly/goose) (Go 专用，支持 Go 代码写迁移脚本)


* **测试**:
* [testcontainers-go](https://github.com/testcontainers/testcontainers-go): 在 Docker 中启动真实的 Postgres 进行集成测试。
