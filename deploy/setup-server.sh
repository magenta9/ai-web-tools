#!/bin/bash
# Aliyun Server Setup Script for ai-web-tools
# Run this script on your Aliyun server to prepare for deployment

set -e

echo "=== Setting up ai-web-tools on Aliyun Server ==="
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

# Create directory structure
echo "Creating directory structure..."
mkdir -p /opt/webtools
mkdir -p /opt/webtools/backups
mkdir -p /opt/webtools/logs

# Update system
echo "Updating system packages..."
apt-get update -y
apt-get upgrade -y

# Install required packages
echo "Installing required packages..."
apt-get install -y \
    curl \
    git \
    wget \
    jq

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo "Docker installed successfully"
else
    echo "Docker already installed: $(docker --version)"
fi

# Install docker-compose if not present
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose installed successfully"
else
    echo "Docker Compose already installed"
fi

# Setup Ollama (optional)
read -p "Do you want to install Ollama? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Installing Ollama..."
    curl -fsSL https://ollama.ai/install.sh | sh
    systemctl enable ollama
    systemctl start ollama
    echo "Ollama installed. You can pull models with: ollama pull llama3.2"
fi

# Configure firewall
echo "Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    echo "Firewall configured"
fi

# Create backup script
cat > /opt/webtools/backup-db.sh << 'BACKUP_SCRIPT'
#!/bin/bash
# Database backup script

BACKUP_DIR="/opt/webtools/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/webtools_db_$DATE.sql"

# Create backup
docker exec webtools-db pg_dump -U webtools webtools > "$BACKUP_FILE"

# Compress
gzip "$BACKUP_FILE"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete

echo "Backup created: ${BACKUP_FILE}.gz"
BACKUP_SCRIPT
chmod +x /opt/webtools/backup-db.sh

# Setup daily backup cron
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/webtools/backup-db.sh >> /opt/webtools/logs/backup.log 2>&1") | crontab -

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Copy docker-compose.prod.yml to /opt/webtools/"
echo "2. Create .env file with production values in /opt/webtools/"
echo "3. Configure GitHub secrets (see DEPLOYMENT.md)"
echo ""
echo "Directory structure created:"
echo "  /opt/webtools/           - Main deployment directory"
echo "  /opt/webtools/backups/   - Database backups"
echo "  /opt/webtools/logs/      - Application logs"
echo ""
echo "Access your API at: http://YOUR_SERVER_IP:3001"
echo ""
