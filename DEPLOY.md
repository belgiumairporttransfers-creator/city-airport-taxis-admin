# Deploy — Admin Dashboard (city-airport-taxis.be)

Run these commands from your local machine (inside the `city-airport/admin` folder):

```bash
# 1. Sync code to VPS
rsync -az --delete \
  --exclude node_modules --exclude .next --exclude .git --exclude '.env*' \
  ./ root@82.29.177.100:/opt/city-airport-taxis-admin/

# 2. Build Docker image on VPS
ssh root@82.29.177.100 "cd /opt/city-airport-taxis-admin && docker build \
  --build-arg NEXT_PUBLIC_BACKEND_URL='https://api.city-airport-taxis.be/api' \
  --build-arg NEXT_PUBLIC_SITE_URL='https://admin.city-airport-taxis.be' \
  --build-arg NEXT_PUBLIC_SOCKET_PATH='/socket.io' \
  -t city-airport-taxis-admin:local ."

# 3. Restart container
ssh root@82.29.177.100 "cd /opt/city-airport-taxis-admin && \
  sed -i 's/pull_policy: always/pull_policy: never/g' docker-compose.prod.yml && \
  IMAGE=city-airport-taxis-admin:local docker compose -f docker-compose.prod.yml up -d && \
  sed -i 's/pull_policy: never/pull_policy: always/g' docker-compose.prod.yml"
```

**Live URL:** https://admin.city-airport-taxis.be
