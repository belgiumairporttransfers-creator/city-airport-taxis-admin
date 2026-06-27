# City Airport Taxis — Admin Dashboard

Next.js admin dashboard for managing drivers, vehicles, bookings, and site settings.

## Local development

```bash
pnpm install
cp .env.production.example .env.local
# Edit .env.local — set NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production deploy (VPS)

Same pattern as the backend: **GitHub Actions → GHCR → SSH → Docker Compose**.

See **[.github/DEPLOY.md](.github/DEPLOY.md)** for full VPS setup, GitHub secrets, Nginx, and SSL.

Quick summary:

1. Push this repo to `city-airport-taxis-admin` on GitHub
2. Create `.env.production` on the VPS at `/opt/city-airport-taxis-admin`
3. Configure GitHub Actions secrets/variables (same VPS as backend, path `/opt/city-airport-taxis-admin`)
4. Push to `main` or run the **Deploy** workflow
5. Point Nginx at `127.0.0.1:3000` (e.g. `admin.yourdomain.com`)

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | Backend API base URL (e.g. `https://api.example.com/api`) |
| `NEXT_PUBLIC_SITE_URL` | Public admin URL (e.g. `https://admin.example.com`) |
| `NEXT_PUBLIC_SOCKET_PATH` | Socket.io path (default `/socket.io`) |

`NEXT_PUBLIC_*` variables are embedded at **Docker build time** in CI.
