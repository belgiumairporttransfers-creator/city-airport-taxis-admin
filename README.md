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

The VPS runs **Docker only** — no Git repository on the server.

### Architecture

```
git push → GitHub Actions → build image → push GHCR → SSH VPS → docker pull → docker compose up
```

### One-time VPS setup (from your machine)

```bash
VPS_HOST=YOUR_VPS_IP VPS_USER=root APP_PATH=/opt/city-airport-taxis-admin ./deploy/bootstrap-vps.sh
scp .env.production root@YOUR_VPS_IP:/opt/city-airport-taxis-admin/.env.production
```

Or run the **Bootstrap VPS Deploy Files** workflow (`bootstrap-deploy.yml`) from GitHub Actions.

Regular deploys use immutable SHA tags and do not sync files to the VPS.

### GitHub Actions secrets

Configure **Settings → Environments → production → Secrets**:

| Secret | Example |
|--------|---------|
| `DEPLOY_HOST` | `82.29.177.100` |
| `DEPLOY_USER` | `root` |
| `DEPLOY_SSH_KEY` | Private SSH key (full PEM) |
| `GHCR_TOKEN` | GitHub PAT with `read:packages` |
| `DEPLOY_PATH` | `/opt/city-airport-taxis-admin` |

Optional: `DEPLOY_PORT` (`22`).

Push to `main` runs `.github/workflows/deploy.yml`.

### Manual deploy on VPS

```bash
cd /opt/city-airport-taxis-admin
export GHCR_USER=your-github-username
export GHCR_TOKEN=ghp_xxxx
export IMAGE=ghcr.io/belgiumairporttransfers-creator/city-airport-taxis-admin:<commit-sha>
./deploy/docker-deploy.sh
```

Deployments verify the app responds on port 3000, prune unused images older than 24h, and automatically roll back on failure.

## Operations

See the backend README **Production operations** section for the full runbook. Quick reference:

| Item | Value |
|------|-------|
| Deploy workflow | `.github/workflows/deploy.yml` |
| Bootstrap workflow | `.github/workflows/bootstrap-deploy.yml` |
| Health check | `curl http://127.0.0.1:3000/` |
| Rollback state | `.deploy-state` on VPS |
| Manual rollback | Redeploy a previous `<commit-sha>` via `IMAGE=... ./deploy/docker-deploy.sh` |

Optional secret: `DEPLOY_HOST_FINGERPRINT` for SSH host key verification.
