# ORIXA - Multi-Tenant POS Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/MongoDB-7-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="TailwindCSS" />
</p>

ORIXA adalah platform POS (Point of Sale) modern yang mendukung berbagai jenis bisnis: **F&B, Retail, dan Service**. Platform ini menyediakan fitur **QR Menu** untuk pelanggan, **POS** untuk kasir, dan **Kitchen Display System (KDS)** untuk dapur.

## ✨ Highlights

- 🏢 **Multi-Tenant** - Satu platform untuk banyak company/bisnis
- 🏪 **Multi-Outlet** - Setiap company bisa punya banyak outlet
- 📱 **QR Self-Order** - Pelanggan scan QR, pesan sendiri tanpa perlu login
- 💳 **Flexible Payment** - Cash, Transfer Bank, QRIS (manual confirmation)
- 🍳 **Kitchen Display** - Realtime order untuk dapur/barista
- 📊 **Reports & Analytics** - Laporan harian, bulanan, perbandingan income vs expense
- 💰 **Expense Tracking** - Catat pengeluaran per outlet
- 📦 **Stock Management** - Tracking stok menu dengan auto-disable saat habis
- 🔐 **RBAC** - Role-based access control dengan permissions

## 🎯 Demo

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@orixa.dev` | `Password123!` |
| Company Admin | `admin@demo.co` | `Password123!` |
| Cashier | `cashier@demo.co` | `Password123!` |
| Member | `member@demo.co` | `Password123!` |

**Demo URLs (setelah running lokal):**
- Landing Page: http://localhost:5173
- Admin Dashboard: http://localhost:5173/admin
- POS Kasir: http://localhost:5173/pos
- Kitchen Display: http://localhost:5173/kds
- Customer QR Menu: http://localhost:5173/m/TABLE001
- API Docs (Swagger): http://localhost:3000/api/docs

## 🛠 Tech Stack

### Frontend
- **React 18** + Vite + TypeScript
- **TailwindCSS** + shadcn/ui components
- **React Query** untuk data fetching & caching
- **Zustand** untuk state management
- **React Router** untuk routing
- **React Hook Form** + Zod untuk form validation
- **Socket.IO** client untuk realtime updates
- **Recharts** untuk charts & analytics

### Backend
- **NestJS** (TypeScript)
- **MongoDB** + Mongoose ODM
- **JWT Authentication** (access + refresh token dengan httpOnly cookie)
- **RBAC** (Role-Based Access Control) dengan guards & decorators
- **Socket.IO** untuk realtime events
- **Swagger** OpenAPI documentation
- **class-validator** + class-transformer untuk validation

## 📁 Project Structure

```
ORIXA/
├── apps/
│   ├── api/                 # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/     # Feature modules (auth, orders, payments, etc.)
│   │   │   ├── schemas/     # MongoDB Mongoose schemas
│   │   │   ├── common/      # Guards, decorators, filters
│   │   │   └── gateway/     # Socket.IO gateway
│   │   └── .env.example
│   └── web/                 # React frontend
│       ├── src/
│       │   ├── pages/       # Page components
│       │   ├── components/  # Reusable components
│       │   ├── api/         # API client functions
│       │   ├── store/       # Zustand stores
│       │   └── hooks/       # Custom hooks
│       └── .env.example
├── packages/
│   └── shared/              # Shared types, enums, schemas, constants
├── docs/                    # Documentation
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- MongoDB (local atau Atlas)

## Quick Start

### 1. Clone & Install Dependencies

```bash
# Clone repository
cd ORIXA

# Install dependencies
pnpm install
```

### 2. Setup MongoDB

**Option A: MongoDB Local**
```bash
# Install MongoDB Community Edition
# https://www.mongodb.com/docs/manual/installation/

# Start MongoDB service
mongod --dbpath /path/to/data/db
```

**Option B: MongoDB Atlas**
1. Buat akun di https://cloud.mongodb.com
2. Create cluster (Free tier available)
3. Get connection string

### 3. Environment Configuration

**Backend (.env)**
```bash
# Copy example file
cp apps/api/.env.example apps/api/.env

# Edit dengan konfigurasi Anda
```

File `apps/api/.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/orixa
JWT_SECRET=your-jwt-secret-min-32-chars-here
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env)**
```bash
# Copy example file
cp apps/web/.env.example apps/web/.env
```

File `apps/web/.env`:
```env
VITE_API_URL=http://localhost:3000
```

### 4. Build Shared Package

```bash
pnpm build:shared
```

### 5. Seed Database

```bash
pnpm seed
```

Ini akan membuat:
- Super Admin: `superadmin@orixa.dev` / `Password123!`
- Demo Company: "Demo Restaurant"
- Demo Admin: `admin@demo.co` / `Password123!`
- Demo Cashier: `cashier@demo.co` / `Password123!`
- Demo Member: `member@demo.co` / `Password123!`
- Sample categories, menu items, tables

### 6. Run Development Servers

```bash
# Run both API and Web
pnpm dev

# Or run separately:
pnpm dev:api    # Backend at http://localhost:3000
pnpm dev:web    # Frontend at http://localhost:5173
```

### 7. Access Application

- **Landing Page**: http://localhost:5173
- **Admin Dashboard**: http://localhost:5173/admin
- **POS**: http://localhost:5173/pos
- **KDS**: http://localhost:5173/kds
- **Super Admin**: http://localhost:5173/sa
- **Customer QR Menu**: http://localhost:5173/m/TABLE001
- **API Docs**: http://localhost:3000/api/docs

## 👥 Roles & Permissions

### Roles
| Role | Description |
|------|-------------|
| **SUPER_ADMIN** | Platform owner, manages all companies |
| **COMPANY_ADMIN** | Company admin, manages outlets, staff, menu, reports |
| **CASHIER** | POS operations, order management, payment confirmation |
| **CUSTOMER_MEMBER** | Registered customer with order history |
| **CUSTOMER_GUEST** | Anonymous customer (no login required) |

### Permissions
| Permission | Description |
|------------|-------------|
| `company:read/write` | Manage company settings |
| `outlet:read/write` | Manage outlets |
| `menu:read/write` | Manage categories & menu items |
| `order:read/write` | Manage orders |
| `payment:read/write` | Manage payments |
| `report:read` | View reports & analytics |
| `user:read/write` | Manage staff users |
| `table:read/write` | Manage tables & QR codes |
| `expense:read/write` | Manage expenses |

## 📱 Features

### Customer Flow (QR Menu)
```
Scan QR → Pilih Menu → Checkout → Pilih Pembayaran → Track Order Realtime
```
- 📷 Scan QR code di meja
- 📋 Lihat menu dengan gambar dan harga
- 🛒 Tambah ke cart dengan varian dan addon
- 💳 Checkout tanpa login (guest) atau login untuk riwayat
- 📍 Track status order secara realtime

### Cashier Flow (POS)
```
Input Order → Pilih Pembayaran → Konfirmasi → Cetak Struk
```
- ➕ Buat order manual dengan UI yang intuitif
- 📱 Terima dan konfirmasi order dari QR
- 💰 Proses pembayaran (Cash langsung PAID, Transfer/QRIS pending)
- 🧾 Cetak struk (print view)
- 🔄 Kelola shift (open/close cash register)

### Kitchen Flow (KDS)
```
Order Masuk → Accept → In Progress → Ready
```
- 📺 Display realtime untuk dapur/barista
- 🔔 Notifikasi order baru
- ✅ Update status dengan satu klik
- 🏷️ Filter berdasarkan station

### Admin Features
- 🏪 Kelola multiple outlets
- 📋 Setup menu categories & items dengan stock tracking
- 💳 Konfigurasi payment methods (Cash/Transfer/QRIS)
- 🪑 Manage tables dan generate QR codes
- 👥 Manage staff (Admin, Cashier)
- 📊 Dashboard dengan analytics
- 💰 Track pengeluaran (expenses)
- 📈 Laporan income vs expense

## 💳 Payment Configuration

Payment methods dikonfigurasi per Outlet:

```javascript
{
  settings: {
    paymentConfig: {
      enabledMethods: ["CASH", "TRANSFER", "QR"],
      transferInstructions: {
        bankName: "BCA",
        accountName: "PT Demo Restaurant",
        accountNumberOrVA: "1234567890",
        note: "Transfer sesuai nominal"
      },
      qrInstructions: {
        qrImageUrl: "https://example.com/qris.png",
        note: "Scan QRIS untuk bayar"
      }
    }
  }
}
```

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register-company` | Register company + admin |
| POST | `/auth/login` | Login (staff/member) |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout (clear refresh cookie) |

### Public (Customer)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/public/resolve/:qrToken` | Resolve QR code to outlet/table |
| GET | `/public/menu` | Get menu by outletId |
| POST | `/public/orders` | Create guest order |
| GET | `/public/orders/:id` | Get order detail |
| GET | `/public/orders/track/:code` | Track order by code |

### POS (Cashier)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/pos/orders` | Create POS order |
| GET | `/pos/orders` | List outlet orders |
| PATCH | `/pos/orders/:id/status` | Update order status |
| PATCH | `/pos/payments/:id/confirm` | Confirm payment |

### KDS (Kitchen)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/kds/orders` | Get active orders |
| PATCH | `/kds/orders/:id/status` | Update order status |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `/outlets` | Manage outlets |
| CRUD | `/tables` | Manage tables |
| CRUD | `/categories` | Manage categories |
| CRUD | `/menu-items` | Manage menu items |
| PATCH | `/menu-items/:id/stock` | Quick stock update |
| CRUD | `/expenses` | Manage expenses |
| GET | `/reports/daily` | Daily report |
| GET | `/reports/range` | Date range report |
| GET | `/reports/financial` | Income vs expense |

📚 **Full API Documentation**: http://localhost:3000/api/docs (Swagger)

## 🔄 Realtime Events (Socket.IO)

### Rooms
| Room | Description |
|------|-------------|
| `staff:{companyId}:{outletId}` | Staff room untuk updates |
| `customer:{orderId}` | Customer order tracking |

### Events
| Event | Payload | Description |
|-------|---------|-------------|
| `order.created` | Order object | Order baru dibuat |
| `order.status.updated` | `{orderId, status}` | Status order berubah |
| `payment.created` | Payment object | Payment baru dibuat |
| `payment.updated` | `{paymentId, status}` | Status payment berubah |

## 📜 Scripts

```bash
pnpm install      # Install all dependencies
pnpm dev          # Run both API and Web in development
pnpm dev:api      # Run only API
pnpm dev:web      # Run only Web
pnpm build        # Build all packages
pnpm build:shared # Build shared package
pnpm seed         # Seed database with demo data
pnpm lint         # Run linter
```

## 🐛 Troubleshooting

<details>
<summary><b>MongoDB Connection Error</b></summary>

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Pastikan MongoDB service berjalan
- Cek `MONGODB_URI` di `.env`
- Untuk MongoDB Atlas, pastikan IP whitelist sudah benar
</details>

<details>
<summary><b>CORS Error</b></summary>

```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Pastikan `CORS_ORIGIN` di backend `.env` sesuai dengan URL frontend
- Default: `http://localhost:5173`
</details>

<details>
<summary><b>JWT Error</b></summary>

```
JsonWebTokenError: invalid signature
```
**Solution:**
- Pastikan `JWT_SECRET` dan `JWT_REFRESH_SECRET` di `.env`
- Minimum 32 characters
</details>

<details>
<summary><b>Cannot find module '@orixa/shared'</b></summary>

**Solution:**
- Run `pnpm build:shared` terlebih dahulu
- Pastikan workspace linking benar di `pnpm-workspace.yaml`
</details>

## 📸 Screenshots

| Landing Page | Admin Dashboard | POS Kasir |
|:---:|:---:|:---:|
| Marketing website | Company management | Create orders |

| Kitchen Display | QR Menu | Order Tracking |
|:---:|:---:|:---:|
| Realtime orders | Customer self-order | Track status |

## 🚀 Production Deployment

### Option 1: Deploy di Ubuntu Server (VPS/Dedicated)

#### Prerequisites
- Ubuntu 20.04/22.04 LTS
- Minimal 2GB RAM, 2 CPU Core
- Domain name (contoh: orixa.yourdomain.com)
- SSL Certificate (Let's Encrypt - gratis)

#### Step 1: Setup Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2 (Process Manager untuk production)
npm install -g pm2

# Install Nginx (Reverse Proxy)
sudo apt install -y nginx

# Install Certbot untuk SSL
sudo apt install -y certbot python3-certbot-nginx
```

#### Step 2: Install MongoDB

**Option A: MongoDB Local di Server**
```bash
# Import MongoDB public GPG key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start & enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
sudo systemctl status mongod
```

**Option B: MongoDB Atlas (Recommended untuk production)**
1. Buat cluster di https://cloud.mongodb.com
2. Setup Network Access (whitelist server IP)
3. Create database user
4. Copy connection string

#### Step 3: Clone & Setup Project

```bash
# Create app directory
sudo mkdir -p /var/www/orixa
sudo chown $USER:$USER /var/www/orixa

# Clone repository
cd /var/www/orixa
git clone https://github.com/Aseptrisna/orixa-platform.git .

# Install dependencies
pnpm install

# Build shared package
pnpm build:shared
```

#### Step 4: Configure Environment

```bash
# Backend environment
cp apps/api/.env.example apps/api/.env
nano apps/api/.env
```

**Production `.env` untuk Backend:**
```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/orixa
# Atau gunakan MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:password@cluster.xxxxx.mongodb.net/orixa

JWT_SECRET=your-super-secret-jwt-key-min-32-chars-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars-change-this
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=https://orixa.yourdomain.com
```

```bash
# Frontend environment
cp apps/web/.env.example apps/web/.env
nano apps/web/.env
```

**Production `.env` untuk Frontend:**
```env
VITE_API_URL=https://api.orixa.yourdomain.com
```

#### Step 5: Build Production

```bash
# Build semua
pnpm build
```

#### Step 6: Setup PM2 (Process Manager)

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [
    {
      name: 'orixa-api',
      cwd: '/var/www/orixa/apps/api',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/pm2/orixa-api-error.log',
      out_file: '/var/log/pm2/orixa-api-out.log',
      merge_logs: true,
      time: true
    }
  ]
};
```

```bash
# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Start API dengan PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 startup (auto-start on reboot)
pm2 startup
# Jalankan command yang ditampilkan
```

#### Step 7: Setup Nginx Reverse Proxy

```bash
# Create Nginx config untuk API
sudo nano /etc/nginx/sites-available/orixa-api
```

**Nginx config untuk API:**
```nginx
server {
    listen 80;
    server_name api.orixa.yourdomain.com;

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
        
        # WebSocket support untuk Socket.IO
        proxy_read_timeout 86400;
    }
}
```

```bash
# Create Nginx config untuk Frontend
sudo nano /etc/nginx/sites-available/orixa-web
```

**Nginx config untuk Frontend:**
```nginx
server {
    listen 80;
    server_name orixa.yourdomain.com;
    root /var/www/orixa/apps/web/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable sites
sudo ln -s /etc/nginx/sites-available/orixa-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/orixa-web /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### Step 8: Setup SSL dengan Let's Encrypt

```bash
# Generate SSL certificate
sudo certbot --nginx -d orixa.yourdomain.com -d api.orixa.yourdomain.com

# Auto-renewal sudah otomatis disetup oleh certbot
# Test renewal:
sudo certbot renew --dry-run
```

#### Step 9: Seed Database (Optional)

```bash
cd /var/www/orixa
pnpm seed
```

#### Step 10: Setup Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

### Option 2: Deploy dengan Docker (Recommended untuk Scale)

#### docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    container_name: orixa-mongodb
    restart: always
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    networks:
      - orixa-network

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    container_name: orixa-api
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGODB_URI=mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/orixa?authSource=admin
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - CORS_ORIGIN=${CORS_ORIGIN}
    depends_on:
      - mongodb
    networks:
      - orixa-network

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    container_name: orixa-web
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    networks:
      - orixa-network

volumes:
  mongodb_data:

networks:
  orixa-network:
    driver: bridge
```

#### Dockerfile untuk API (apps/api/Dockerfile)

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build
RUN pnpm build:shared
RUN cd apps/api && pnpm build

# Production image
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

#### Dockerfile untuk Web (apps/web/Dockerfile)

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build
RUN pnpm build:shared
RUN cd apps/web && pnpm build

# Production image dengan Nginx
FROM nginx:alpine

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

#### Deploy dengan Docker

```bash
# Create .env file
cp .env.example .env
nano .env

# Build & start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

### Option 3: Deploy ke Cloud Platform

#### A. Railway (Simple & Fast)
1. Connect GitHub repo ke Railway
2. Add MongoDB plugin
3. Set environment variables
4. Deploy otomatis

#### B. Render
1. Create Web Service untuk API
2. Create Static Site untuk Frontend
3. Add MongoDB (atau gunakan Atlas)
4. Configure environment variables

#### C. DigitalOcean App Platform
1. Create App dari GitHub
2. Configure API sebagai Web Service
3. Configure Web sebagai Static Site
4. Add managed MongoDB atau gunakan Atlas

#### D. AWS (Enterprise Scale)
- EC2 atau ECS untuk containers
- DocumentDB atau MongoDB Atlas untuk database
- CloudFront untuk CDN
- Route 53 untuk DNS
- ACM untuk SSL certificates
- Application Load Balancer

---

### Production Checklist ✅

```
[ ] Environment variables configured (tidak hardcode secrets)
[ ] MongoDB secured (authentication enabled, network restricted)
[ ] SSL/HTTPS enabled
[ ] Firewall configured (hanya port yang diperlukan)
[ ] PM2 atau Docker untuk process management
[ ] Nginx reverse proxy configured
[ ] Logging & monitoring setup
[ ] Backup strategy untuk MongoDB
[ ] Rate limiting enabled
[ ] CORS properly configured
[ ] Error tracking (Sentry optional)
```

### Monitoring & Maintenance

```bash
# PM2 monitoring
pm2 monit
pm2 logs orixa-api

# Check API health
curl https://api.orixa.yourdomain.com/health

# MongoDB backup
mongodump --uri="mongodb://localhost:27017/orixa" --out=/backup/$(date +%Y%m%d)

# Update aplikasi
cd /var/www/orixa
git pull
pnpm install
pnpm build
pm2 restart orixa-api
```

---

## 🗺️ Roadmap

- [ ] Loyalty points system
- [ ] Voucher & promo codes
- [ ] Multi-language support (i18n)
- [ ] Dark mode
- [ ] Mobile app (React Native)
- [ ] Third-party payment gateway integration
- [ ] Inventory management
- [ ] Supplier management
- [ ] Employee scheduling

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by Logic Frame
</p>
