#!/usr/bin/env bash
# One-time VPS setup for admin dashboard Docker deployment (Ubuntu 22.04 / 24.04)
# Safe to run on a VPS that already has Docker/Nginx from the backend deploy.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/city-airport-taxis-admin}"

echo "==> Ensuring Docker is installed"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi

echo "==> Ensuring Docker Compose plugin and Nginx are installed"
apt update
apt install -y docker-compose-plugin nginx certbot python3-certbot-nginx ufw curl

echo "==> Creating app directory: ${APP_DIR}"
mkdir -p "${APP_DIR}"

echo "==> Configuring firewall (if not already enabled)"
ufw allow OpenSSH || true
ufw allow "Nginx Full" || true
ufw --force enable || true

echo "==> Done."
echo "Next steps:"
echo "  1. Copy .env.production to ${APP_DIR}"
echo "  2. Configure Nginx: deploy/nginx-admin.conf.example"
echo "  3. Run: cd ${APP_DIR} && ./deploy/docker-deploy.sh"
