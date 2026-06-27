#!/usr/bin/env bash
# Run on the VPS from the admin dashboard deploy directory
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${APP_DIR}"

if [[ ! -f ".env.production" ]]; then
  echo "Missing .env.production — copy your local .env.production to this server (never commit to git)."
  exit 1
fi

if [[ -n "${GHCR_TOKEN:-}" && -n "${GHCR_USER:-}" ]]; then
  echo "==> Logging in to GHCR"
  echo "${GHCR_TOKEN}" | docker login ghcr.io -u "${GHCR_USER}" --password-stdin
fi

if [[ -n "${IMAGE:-}" ]]; then
  echo "==> Pulling image: ${IMAGE}"
  export PULL_POLICY=always
  docker compose -f "${COMPOSE_FILE}" pull admin
else
  echo "==> Building image locally"
  export IMAGE="city-airport-taxis-admin:latest"
  docker compose --env-file .env.production -f "${COMPOSE_FILE}" build admin
fi

echo "==> Starting services"
docker compose --env-file .env.production -f "${COMPOSE_FILE}" up -d --remove-orphans

echo "==> Waiting for health check"
sleep 5
curl -fsS "http://127.0.0.1:${PORT:-3000}/auth/login" >/dev/null

echo "==> Deploy complete"
docker compose --env-file .env.production -f "${COMPOSE_FILE}" ps
