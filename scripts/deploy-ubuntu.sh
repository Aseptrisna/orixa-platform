#!/bin/bash

# =============================================
# ORIXA Deployment Script for Ubuntu 24
# Without Docker - PM2 + Nginx
# =============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ORIXA Deployment Script              ${NC}"
echo -e "${GREEN}  Ubuntu 24 + PM2 + Nginx              ${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}Please don't run as root. Run as normal user with sudo access.${NC}"
    exit 1
fi

# ========================================
# Step 1: Update System
# ========================================
echo -e "\n${YELLOW}[1/8] Updating system...${NC}"
sudo apt update && sudo apt upgrade -y

# ========================================
# Step 2: Install Node.js 18
# ========================================
echo -e "\n${YELLOW}[2/8] Installing Node.js 18...${NC}"
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'.' -f1 | tr -d 'v') -lt 18 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi
node -v
npm -v

# ========================================
# Step 3: Install pnpm & PM2
# ========================================
echo -e "\n${YELLOW}[3/8] Installing pnpm & PM2...${NC}"
sudo npm install -g pnpm pm2
pnpm -v
pm2 -v

# ========================================
# Step 4: Install Nginx & Certbot
# ========================================
echo -e "\n${YELLOW}[4/8] Installing Nginx & Certbot...${NC}"
sudo apt install -y nginx certbot python3-certbot-nginx

# ========================================
# Step 5: Setup Project Directory
# ========================================
echo -e "\n${YELLOW}[5/8] Setting up project directory...${NC}"
ORIXA_DIR="/var/www/orixa"

if [ ! -d "$ORIXA_DIR" ]; then
    sudo mkdir -p $ORIXA_DIR
    sudo chown $USER:$USER $ORIXA_DIR
    echo "Created $ORIXA_DIR"
else
    echo "$ORIXA_DIR already exists"
fi

# ========================================
# Step 6: Clone/Pull Repository
# ========================================
echo -e "\n${YELLOW}[6/8] Setting up repository...${NC}"
cd $ORIXA_DIR

if [ ! -d ".git" ]; then
    echo "Cloning repository..."
    git clone -b deploy https://github.com/Aseptrisna/orixa-platform.git .
else
    echo "Pulling latest changes..."
    git pull origin deploy
fi

# ========================================
# Step 7: Install Dependencies & Build
# ========================================
echo -e "\n${YELLOW}[7/8] Installing dependencies & building...${NC}"
pnpm install
pnpm build:shared
pnpm build

# Create logs directory
mkdir -p logs

# ========================================
# Step 8: Setup Nginx
# ========================================
echo -e "\n${YELLOW}[8/8] Setting up Nginx...${NC}"

# Copy nginx configs
sudo cp nginx/orixa-api.conf /etc/nginx/sites-available/orixa-api
sudo cp nginx/orixa-web.conf /etc/nginx/sites-available/orixa-web

# Enable sites
sudo ln -sf /etc/nginx/sites-available/orixa-api /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/orixa-web /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t

# ========================================
# Done
# ========================================
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Installation Complete!               ${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Configure environment files:"
echo "   cp $ORIXA_DIR/apps/api/.env.production $ORIXA_DIR/apps/api/.env"
echo "   cp $ORIXA_DIR/apps/web/.env.production $ORIXA_DIR/apps/web/.env"
echo ""
echo "2. Setup SSL certificates:"
echo "   sudo certbot --nginx -d orixa.sta.my.id -d api-orixa.sta.my.id"
echo ""
echo "3. Seed database (optional):"
echo "   cd $ORIXA_DIR && pnpm seed"
echo ""
echo "4. Start with PM2:"
echo "   cd $ORIXA_DIR && pm2 start ecosystem.config.js"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "5. Restart Nginx:"
echo "   sudo systemctl restart nginx"
echo ""
echo -e "${GREEN}URLs after setup:${NC}"
echo "  Web: https://orixa.sta.my.id"
echo "  API: https://api-orixa.sta.my.id"
echo "  API Docs: https://api-orixa.sta.my.id/api/docs"
