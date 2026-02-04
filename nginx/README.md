# Panduan Setup Nginx untuk ORIXA

## 1. Copy Config Files ke Server

```bash
# Copy dari repo ke nginx sites-available
sudo cp nginx/orixa-api.conf /etc/nginx/sites-available/orixa-api
sudo cp nginx/orixa-web.conf /etc/nginx/sites-available/orixa-web
```

## 2. Buat Symlink ke sites-enabled

```bash
sudo ln -s /etc/nginx/sites-available/orixa-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/orixa-web /etc/nginx/sites-enabled/
```

## 3. Generate SSL Certificate (Let's Encrypt)

```bash
# Install certbot jika belum
sudo apt install certbot python3-certbot-nginx -y

# Generate SSL untuk kedua domain
sudo certbot --nginx -d orixa.sta.my.id -d api-orixa.sta.my.id

# Atau generate terpisah
sudo certbot certonly --nginx -d orixa.sta.my.id
sudo certbot certonly --nginx -d api-orixa.sta.my.id
```

## 4. Test & Restart Nginx

```bash
# Test konfigurasi
sudo nginx -t

# Jika OK, restart nginx
sudo systemctl restart nginx

# Cek status
sudo systemctl status nginx
```

## 5. Setup Auto-Renewal SSL

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot otomatis setup cron job untuk renewal
```

## 6. Firewall (UFW)

```bash
# Allow HTTP & HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw status
```

## Troubleshooting

### Cek Log Nginx
```bash
# Error log
sudo tail -f /var/log/nginx/orixa-api-error.log
sudo tail -f /var/log/nginx/orixa-web-error.log

# Access log
sudo tail -f /var/log/nginx/orixa-api-access.log
```

### Cek API Running
```bash
# Pastikan API berjalan di port 8023
pm2 status
curl http://127.0.0.1:8023/api/docs
```

### Permission Issues
```bash
# Pastikan nginx bisa baca folder web
sudo chown -R www-data:www-data /var/www/orixa/apps/web/dist
sudo chmod -R 755 /var/www/orixa/apps/web/dist
```

## Quick Commands

```bash
# Restart nginx
sudo systemctl restart nginx

# Reload config tanpa downtime
sudo nginx -s reload

# Check config syntax
sudo nginx -t

# View PM2 logs
pm2 logs orixa-api
```
