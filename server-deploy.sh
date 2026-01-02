#!/bin/bash
# AI Web Tools - Server Initialization Script
# Usage: curl -sL https://raw.githubusercontent.com/zhangcheng/ai-web-tools/main/server-deploy.sh | bash

set -e

PROJECT_DIR="/opt/webtools"
COMPOSE_FILE="docker-compose.deploy.yml"
GIT_REPO="https://github.com/zhangcheng/ai-web-tools.git"

echo "=== AI Web Tools Server Initialization ==="
echo ""

# Check Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check docker compose
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed."
    exit 1
fi

# Create project directory
echo "📁 Creating project directory..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Clone or update repository
if [ -d ".git" ]; then
    echo "📥 Updating existing repository..."
    git pull origin main
else
    echo "📥 Cloning repository..."
    git clone $GIT_REPO .
fi

# Download docker-compose.deploy.yml if not exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "📥 Downloading $COMPOSE_FILE..."
    curl -sL "https://raw.githubusercontent.com/zhangcheng/ai-web-tools/main/$COMPOSE_FILE" -o $COMPOSE_FILE
fi

# Create config directory
mkdir -p config

# Create .env file if not exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Database Configuration
DB_USER=webtools
DB_PASSWORD=webtools123
DB_NAME=webtools

# AI Configuration
OLLAMA_HOST=http://host.docker.internal:11434
OLLAMA_API_KEY=

# OpenAI Configuration (optional)
OPENAI_API_KEY=
OPENAI_BASE_URL=

# Anthropic Configuration (optional)
ANTHROPIC_API_KEY=
ANTHROPIC_BASE_URL=

# App Configuration
API_URL=http://8.217.117.65:3001/api
EOF
    echo "⚠️  Please edit .env file with your production values"
fi

# Pull latest images
echo "📦 Pulling latest Docker images..."
docker compose -f $COMPOSE_FILE pull

# Start services
echo "🚀 Starting services..."
docker compose -f $COMPOSE_FILE up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 15

# Health check
if curl -sf http://localhost:3000 > /dev/null; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "Services:"
    docker compose -f $COMPOSE_FILE ps
    echo ""
    echo "🌐 App available at: http://8.217.117.65:3000"
    echo "🔌 API available at: http://8.217.117.65:3001/api"
else
    echo ""
    echo "❌ Health check failed! Checking logs..."
    docker compose -f $COMPOSE_FILE logs --tail 50
    exit 1
fi
