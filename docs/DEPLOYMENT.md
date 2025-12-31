# 简化服务器部署指南

适用于在服务器本地构建和运行的部署方式（不使用镜像仓库）。

## 部署流程

```
GitHub → SSH 到服务器 → git pull → docker build → docker-compose up
```

## 前置条件

### 服务器要求
- Docker 和 Docker Compose 已安装
- Git 已安装
- 开放端口：22 (SSH), 3001 (API)

## GitHub Secrets 配置

只需要配置 SSH 相关的 Secrets：

| Secret 名称 | 说明 | 示例值 |
|-------------|------|--------|
| `REMOTE_HOST` | 服务器 IP | `8.217.117.65` |
| `REMOTE_USERNAME` | SSH 用户名 | `root` |
| `REMOTE_SSH_KEY` | SSH 私钥 | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `REMOTE_SSH_PORT` | SSH 端口（可选） | `22` |

### 配置步骤

1. **生成 SSH 密钥**（已完成）
   ```bash
   ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github-deploy
   ```

2. **复制公钥到服务器**（已完成）
   ```bash
   ssh-copy-id -i ~/.ssh/github-deploy.pub root@8.217.117.65
   ```

3. **在 GitHub 配置 Secrets**
   - 进入仓库 → Settings → Secrets and variables → Actions
   - 添加以下 Secrets：
     - `REMOTE_HOST`: `8.217.117.65`
     - `REMOTE_USERNAME`: `root`
     - `REMOTE_SSH_KEY`: 复制 `~/.ssh/github-deploy` 的完整内容
     - `REMOTE_SSH_PORT`: `22`

## 服务器初始化

### 1. 安装 Docker

```bash
# 登录服务器
ssh root@8.217.117.65

# 安装 Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# 验证安装
docker --version
docker compose version
```

### 2. 创建部署目录

```bash
mkdir -p /opt/webtools
cd /opt/webtools
```

### 3. 首次手动部署（推荐）

```bash
# 克隆仓库
git clone https://github.com/your-username/ai-web-tools.git
cd ai-web-tools

# 配置环境变量
cp server-go/.env.example server-go/.env
nano server-go/.env  # 编辑配置

# 启动服务
cd server-go
docker compose -f docker/docker-compose.prod.yml up -d

# 查看状态
docker compose -f docker/docker-compose.prod.yml ps
docker compose -f docker/docker-compose.prod.yml logs -f
```

### 4. 配置 .env 文件

编辑 `/opt/webtools/ai-web-tools/server-go/.env`：

```bash
# 数据库配置（使用 Docker 内部网络）
DB_HOST=postgres
DB_PORT=5432
DB_USER=webtools
DB_PASSWORD=your-strong-password  # 修改为强密码
DB_NAME=webtools

# Ollama 配置
OLLAMA_HOST=http://host.docker.internal:11434

# 可选：其他 LLM 配置
# OPENAI_API_KEY=
# ANTHROPIC_API_KEY=
```

## 自动部署

配置完成后，每次推送到 `main` 分支会自动部署：

```bash
git add .
git commit -m "your changes"
git push origin main
```

GitHub Actions 会自动：
1. SSH 到服务器
2. 拉取最新代码
3. 构建 Docker 镜像
4. 重启服务
5. 验证健康状态

## 手动部署命令

如果需要手动更新：

```bash
# SSH 到服务器
ssh root@8.217.117.65

# 进入项目目录
cd /opt/webtools/ai-web-tools

# 拉取最新代码
git pull origin main

# 重新构建并启动
cd server-go
docker compose -f docker/docker-compose.prod.yml up -d --build

# 查看日志
docker compose -f docker/docker-compose.prod.yml logs -f
```

## 常用命令

```bash
# 查看服务状态
docker compose -f docker/docker-compose.prod.yml ps

# 查看日志
docker compose -f docker/docker-compose.prod.yml logs -f

# 重启服务
docker compose -f docker/docker-compose.prod.yml restart

# 停止服务
docker compose -f docker/docker-compose.prod.yml down

# 查看数据库
docker exec -it webtools-db psql -U webtools -d webtools
```

## 数据库管理

### 备份数据库

```bash
# 创建备份
docker exec webtools-db pg_dump -U webtools webtools > backup_$(date +%Y%m%d).sql

# 压缩备份
gzip backup_$(date +%Y%m%d).sql
```

### 恢复数据库

```bash
# 解压备份
gunzip backup_20240101.sql.gz

# 恢复
docker exec -i webtools-db psql -U webtools webtools < backup_20240101.sql
```

## 故障排除

### 服务无法启动

```bash
# 查看详细日志
docker compose -f docker/docker-compose.prod.yml logs

# 检查容器状态
docker ps -a

# 重新构建
docker compose -f docker/docker-compose.prod.yml up -d --build --force-recreate
```

### 端口被占用

```bash
# 查看端口占用
lsof -i:3001

# 停止旧服务
docker compose -f docker/docker-compose.prod.yml down
```

### 磁盘空间不足

```bash
# 清理未使用的镜像
docker system prune -a

# 查看磁盘使用
df -h
du -sh /var/lib/docker
```

## 访问应用

部署成功后，可以通过以下方式访问：

- API: `http://8.217.117.65:3001`
- 健康检查: `http://8.217.117.65:3001/api/health`

## 安全建议

1. **修改默认密码**：更改 `.env` 中的 `DB_PASSWORD`
2. **配置防火墙**：只开放必要端口
3. **使用 HTTPS**：配置 Nginx 反向代理和 SSL 证书
4. **定期备份**：设置自动备份脚本
