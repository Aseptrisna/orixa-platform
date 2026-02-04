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

### 🐳 Docker Deploy (Recommended)

Deploy dengan Docker - tidak perlu install Node.js di server!

#### Prerequisites
- Ubuntu 20.04/22.04 LTS
- Docker Engine 24+
- Docker Compose v2+

#### Quick Start

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 2. Clone repository
sudo mkdir -p /var/www/orixa && sudo chown $USER:$USER /var/www/orixa
cd /var/www/orixa
git clone -b deploy https://github.com/Aseptrisna/orixa-platform.git .

# 3. Configure environment
cp .env.docker.example .env
nano .env  # Edit dengan credentials Anda

# 4. Build & Run
docker compose build
docker compose up -d

# 5. Check status
docker compose ps
```

#### Environment Variables (`.env`)

```env
# MongoDB
MONGO_ROOT_USERNAME=orixa
MONGO_ROOT_PASSWORD=YourSecurePassword123!

# JWT (minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-chars

# Your domain
CORS_ORIGIN=https://yourdomain.com
VITE_API_URL=https://api.yourdomain.com
```

#### Docker Commands

```bash
docker compose up -d          # Start all services
docker compose down           # Stop all services
docker compose logs -f        # View logs
docker compose restart api    # Restart specific service
```

📚 **Full Docker Guide**: See [DOCKER.md](DOCKER.md) for SSL setup, Nginx config, troubleshooting, and more.

---

### PM2 Deploy (Alternative)

Deploy ORIXA dengan PM2 + Nginx di Ubuntu Server.

#### Prerequisites
- Ubuntu 20.04/22.04 LTS
- Node.js 18+
- pnpm
- PM2
- Nginx
- Domain dengan SSL (Let's Encrypt)

#### Step 1: Setup Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm & PM2
npm install -g pnpm pm2

# Install Nginx & Certbot
sudo apt install -y nginx certbot python3-certbot-nginx
```

#### Step 2: Clone & Build

```bash
# Create directory
sudo mkdir -p /var/www/orixa
sudo chown $USER:$USER /var/www/orixa

# Clone dari branch deploy
cd /var/www/orixa
git clone -b deploy https://github.com/Aseptrisna/orixa-platform.git .

# Install dependencies
pnpm install

# Build
pnpm build:shared
pnpm build
```

#### Step 3: Configure Environment

**Backend (`apps/api/.env`):**
```env
# MongoDB
MONGODB_URI=mongodb://user:password@host:27017/dbname

# JWT
JWT_ACCESS_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# App
PORT=8023
NODE_ENV=production

# CORS
CORS_ORIGIN=https://yourdomain.com

# Mail (optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
FRONTEND_URL=https://yourdomain.com
```

**Frontend (`apps/web/.env`):**
```env
VITE_API_URL=https://api.yourdomain.com
```

#### Step 4: Seed Database (Optional)

```bash
pnpm seed
```

#### Step 5: Start dengan PM2

```bash
# Start API & Web
pm2 start ecosystem.config.js

# Verify
pm2 status

# Should show:
# ┌─────────────┬────┬─────────┬──────┐
# │ name        │ id │ status  │ cpu  │
# ├─────────────┼────┼─────────┼──────┤
# │ orixa-api   │ 0  │ online  │ 0%   │
# │ orixa-web   │ 1  │ online  │ 0%   │
# └─────────────┴────┴─────────┴──────┘

# Save & auto-start on reboot
pm2 save
pm2 startup
```

#### Step 6: Setup Nginx

```bash
# Copy config files
sudo cp nginx/orixa-api.conf /etc/nginx/sites-available/
sudo cp nginx/orixa-web.conf /etc/nginx/sites-available/

# Edit domain names in config files
sudo nano /etc/nginx/sites-available/orixa-api.conf
sudo nano /etc/nginx/sites-available/orixa-web.conf

# Enable sites
sudo ln -s /etc/nginx/sites-available/orixa-api.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/orixa-web.conf /etc/nginx/sites-enabled/

# Test & restart
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 7: Setup SSL (Let's Encrypt)

```bash
# Generate SSL certificates
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

#### Step 8: Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

### Port Configuration

| Service | Port | Description |
|---------|------|-------------|
| orixa-api | 8023 | NestJS Backend API |
| orixa-web | 8022 | Frontend (serve) |

### PM2 Commands

```bash
# Status
pm2 status

# Logs
pm2 logs orixa-api
pm2 logs orixa-web

# Restart
pm2 restart orixa-api
pm2 restart orixa-web
pm2 restart all

# Stop
pm2 stop all

# Monitor
pm2 monit
```

### Update Deployment

```bash
cd /var/www/orixa
git pull origin deploy
pnpm install
pnpm build:shared
pnpm build
pm2 restart all
```

### Nginx Config Files

Config files tersedia di folder `nginx/`:
- `nginx/orixa-api.conf` - Reverse proxy untuk API (port 8023)
- `nginx/orixa-web.conf` - Reverse proxy untuk Web (port 8022)

Edit `server_name` dan SSL paths sesuai domain Anda.

---

### Production Checklist ✅

```
[ ] MongoDB configured & accessible
[ ] Environment variables set (tidak hardcode)
[ ] SSL/HTTPS enabled
[ ] Firewall configured
[ ] PM2 running (api & web)
[ ] Nginx configured
[ ] Auto-start on reboot (pm2 startup)
[ ] Backup strategy untuk MongoDB
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
