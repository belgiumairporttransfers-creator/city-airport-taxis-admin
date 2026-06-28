# City Airport Taxis — Admin Dashboard

Next.js admin dashboard for managing drivers, vehicles, bookings, and site settings.

## Local development

```bash
pnpm install
echo 'NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_PATH=/socket.io' > .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production deploy

### Auto-deploy on push to `main` (GitHub Actions)

Configure **Settings → Environments → production → Secrets** in this repo:

| Secret | Example |
|--------|---------|
| `DEPLOY_HOST` | `82.29.177.100` |
| `DEPLOY_USER` | `root` |
| `DEPLOY_SSH_KEY` | Private SSH key (full PEM) |
| `GHCR_TOKEN` | GitHub PAT with `read:packages` |
| `DEPLOY_PATH` | `/opt/city-airport-taxis-admin` |

Optional: `DEPLOY_PORT` (`22`), `DEPLOY_PORT_APP` (`3000`).

The VPS must have `.env.production` in `DEPLOY_PATH` (never commit it).

Push to `main` runs `.github/workflows/deploy.yml` — build image, SSH to VPS, pull and restart.

### Manual deploy on VPS

```bash
cd /opt/city-airport-taxis-admin
./deploy/docker-deploy.sh
```
