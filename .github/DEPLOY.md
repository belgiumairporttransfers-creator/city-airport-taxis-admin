# Deploy — city-airport-taxis-admin

Repo: `git@github.com:belgiumairporttransfers-creator/city-airport-taxis-admin.git`

## Flow

```
Push to main  →  GitHub Actions  →  GHCR  →  SSH VPS  →  docker compose up
```

Image: `ghcr.io/belgiumairporttransfers-creator/city-airport-taxis-admin:latest`

The admin dashboard runs on **port 3000** on the same VPS as the backend (port 5000).

## VPS setup (one-time)

If the backend is already deployed on the VPS, Docker and Nginx are likely installed. You only need to clone this repo and add env + Nginx config:

```bash
ssh root@YOUR_VPS_IP
git clone git@github.com:belgiumairporttransfers-creator/city-airport-taxis-admin.git /opt/city-airport-taxis-admin
cd /opt/city-airport-taxis-admin
cp .env.production.example .env.production
nano .env.production   # set production URLs — never commit
sudo bash deploy/docker-vps-setup.sh   # safe to re-run; skips if Docker already installed
```

Or from your **local machine** (uploads `.env.production` and deploys):

```bash
cd dashboard
cp .env.production.example .env.production
nano .env.production
bash deploy/first-vps-deploy.sh
```

## Environment (`.env.production`)

| Variable | Example | Notes |
|----------|---------|-------|
| `NEXT_PUBLIC_BACKEND_URL` | `https://api.city-airport-taxis.be/api` | **Build-time** — baked into the Docker image by CI |
| `NEXT_PUBLIC_SITE_URL` | `https://admin.city-airport-taxis.be` | **Build-time** |
| `NEXT_PUBLIC_SOCKET_PATH` | `/socket.io` | Optional; **build-time** |
| `PORT` | `3000` | Host port mapped to the container |

`NEXT_PUBLIC_*` values must match the GitHub **Variables** used in the Deploy workflow (see below).

## GitHub secrets & variables

Use the **same VPS SSH secrets** as the backend, with a different deploy path:

| Setting | Value |
|---------|--------|
| Variable `SSH_DEPLOY_ENABLED` | `true` |
| Secret `DEPLOY_HOST` | VPS IP (same as backend) |
| Secret `DEPLOY_USER` | SSH user (same as backend) |
| Secret `DEPLOY_SSH_KEY` | Private SSH key (same as backend) |
| Secret `DEPLOY_PATH` | `/opt/city-airport-taxis-admin` |
| Secret `DEPLOY_PORT_APP` | `3000` |
| Secret `GHCR_TOKEN` | PAT with `read:packages` (same as backend) |
| Variable `NEXT_PUBLIC_BACKEND_URL` | `https://api.yourdomain.com/api` |
| Variable `NEXT_PUBLIC_SITE_URL` | `https://admin.yourdomain.com` |
| Variable `NEXT_PUBLIC_SOCKET_PATH` | `/socket.io` (optional) |

## Deploy

- **Auto:** push to `main`
- **Manual:** Actions → **Deploy** → Run workflow

## Nginx + SSL

```bash
sudo cp deploy/nginx-admin.conf.example /etc/nginx/sites-available/admin.yourdomain.com
sudo nano /etc/nginx/sites-available/admin.yourdomain.com   # set server_name
sudo ln -s /etc/nginx/sites-available/admin.yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d admin.yourdomain.com
```

## Push code to the admin repo

From the `dashboard/` folder in your monorepo:

```bash
cd dashboard
git init
git add .
git commit -m "Add admin dashboard with VPS Docker deploy"
git branch -M main
git remote add origin git@github.com:belgiumairporttransfers-creator/city-airport-taxis-admin.git
git push -u origin main
```

If the remote already has a README commit:

```bash
git pull origin main --rebase
git push -u origin main
```

## Verify

```bash
curl -fsS http://127.0.0.1:3000/auth/login
docker compose -f docker-compose.prod.yml ps
```

Open `https://admin.yourdomain.com` and log in with your admin account.
