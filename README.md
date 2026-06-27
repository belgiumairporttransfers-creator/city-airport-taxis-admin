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

Push to `main` → GitHub Actions auto-deploys. One-time setup: `backend/deploy/configure-all-repos.sh` (requires `gh auth login` and `backend/deploy/github-actions.secrets`).
