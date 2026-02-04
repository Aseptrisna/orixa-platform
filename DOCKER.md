# 🐳 ORIXA Docker Deployment Guide

Deploy ORIXA dengan Docker di Ubuntu Server - tidak perlu Node.js di host!

## Prerequisites

- Ubuntu 20.04/22.04 LTS
- Docker Engine 24+
- Docker Compose v2+
- Domain dengan DNS configured (optional, untuk production)

## Quick Start (5 Menit)

### 1. Install Docker di Ubuntu

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (logout/login required)
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker compose version
```

### 2. Clone Repository

```bash
# Create directory
sudo mkdir -p /var/www/orixa
sudo chown $USER:$USER /var/www/orixa
cd /var/www/orixa

# Clone
git clone https://github.com/Aseptrisna/orixa-platform.git .
```

### 3. Configure Environment

```bash
# Copy example env
cp .env.docker.example .env

# Edit with your values
nano .env
```

**Edit `.env`:**
```env
# MongoDB
MONGO_ROOT_USERNAME=orixa
MONGO_ROOT_PASSWORD=YourSecurePassword123!

# JWT (generate random strings, min 32 chars)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Your domain (atau http://YOUR_SERVER_IP untuk testing)
CORS_ORIGIN=https://yourdomain.com
VITE_API_URL=https://api.yourdomain.com
```

### 4. Build & Run

```bash
# Build images
docker compose build

# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### 5. Seed Database (First Time Only)

```bash
# Run seed inside API container
docker compose exec api node -e "
const { execSync } = require('child_process');
process.chdir('/app');
execSync('npx ts-node apps/api/src/seed.ts', { stdio: 'inherit' });
"

# Or connect to container and run manually
docker compose exec api sh
cd /app
pnpm seed
```

### 6. Access Application

| Service | URL |
|---------|-----|
| Web App | http://YOUR_SERVER_IP |
| API | http://YOUR_SERVER_IP:3000 |
| API Docs | http://YOUR_SERVER_IP:3000/api/docs |

---

## Production Deployment (dengan Nginx & SSL)

### 1. Install Nginx & Certbot

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 2. Configure Nginx Reverse Proxy

**Create `/etc/nginx/sites-available/orixa`:**

```nginx
# API - api.yourdomain.com
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Web - yourdomain.com
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/orixa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Setup SSL dengan Let's Encrypt

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 4. Update Environment untuk HTTPS

Edit `.env`:
```env
CORS_ORIGIN=https://yourdomain.com
VITE_API_URL=https://api.yourdomain.com
```

Rebuild web container:
```bash
docker compose build web
docker compose up -d web
```

---

## Docker Commands

### Basic Operations

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart specific service
docker compose restart api
docker compose restart web

# View logs
docker compose logs -f
docker compose logs -f api
docker compose logs -f web

# Check status
docker compose ps
```

### Maintenance

```bash
# Update & rebuild
git pull
docker compose build
docker compose up -d

# View container resources
docker stats

# Clean up unused images
docker system prune -a

# Backup MongoDB
docker compose exec mongodb mongodump --out=/data/db/backup --username=orixa --password=YOUR_PASSWORD --authenticationDatabase=admin

# Restore MongoDB
docker compose exec mongodb mongorestore /data/db/backup --username=orixa --password=YOUR_PASSWORD --authenticationDatabase=admin
```

### Access Container Shell

```bash
# API container
docker compose exec api sh

# Web container
docker compose exec web sh

# MongoDB shell
docker compose exec mongodb mongosh -u orixa -p YOUR_PASSWORD --authenticationDatabase admin
```

---

## Development Mode

Untuk development lokal dengan hot-reload, gunakan `docker-compose.dev.yml`:

```bash
# Start MongoDB only (run API & Web locally)
docker compose -f docker-compose.dev.yml up -d

# This gives you:
# - MongoDB at localhost:27017
# - Mongo Express UI at localhost:8081

# Then run locally:
pnpm dev
```

---

## Port Configuration

| Service | Internal Port | External Port |
|---------|---------------|---------------|
| MongoDB | 27017 | 27017 |
| API | 3000 | 3000 |
| Web | 80 | 80 |

### Custom Ports

Edit `docker-compose.yml`:
```yaml
api:
  ports:
    - "8023:3000"  # Change external port to 8023

web:
  ports:
    - "8022:80"   # Change external port to 8022
```

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs api
docker compose logs web

# Check if ports are in use
sudo lsof -i :3000
sudo lsof -i :80
```

### MongoDB connection error

```bash
# Check MongoDB is healthy
docker compose ps mongodb

# Test connection
docker compose exec mongodb mongosh -u orixa -p YOUR_PASSWORD --authenticationDatabase admin --eval "db.adminCommand('ping')"
```

### Build fails

```bash
# Clean build
docker compose build --no-cache

# Check disk space
df -h
```

### Permission issues

```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/orixa
```

---

## Production Checklist ✅

```
[ ] .env configured with secure passwords
[ ] JWT secrets are random & 32+ chars
[ ] MongoDB password is strong
[ ] Nginx configured with reverse proxy
[ ] SSL/HTTPS enabled (Let's Encrypt)
[ ] Firewall configured (UFW)
[ ] Docker containers are running
[ ] Health checks passing
[ ] Database seeded
[ ] Backup strategy configured
```

### Firewall Setup

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Internet                       │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│              Nginx (Host)                        │
│         SSL Termination + Proxy                  │
└──────────┬─────────────────────┬────────────────┘
           │                     │
    ┌──────▼──────┐       ┌──────▼──────┐
    │  Web (:80)  │       │  API (:3000)│
    │   Nginx     │       │   NestJS    │
    │   React     │       │             │
    └─────────────┘       └──────┬──────┘
                                 │
                          ┌──────▼──────┐
                          │  MongoDB    │
                          │  (:27017)   │
                          └─────────────┘
```

---

<p align="center">Made with ❤️ by Logic Frame</p>
