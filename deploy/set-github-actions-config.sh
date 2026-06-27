#!/usr/bin/env bash
# Push GitHub Actions secrets/variables for auto-deploy on push to main.
#
# Prerequisites:
#   1. GitHub CLI: https://cli.github.com/  →  gh auth login
#   2. Copy deploy/github-actions.secrets.example → deploy/github-actions.secrets
#   3. Fill in the same VPS values you use on the backend repo
#
# Usage:
#   ./deploy/set-github-actions-config.sh belgiumairporttransfers-creator/city-airport-taxis-admin
#   ./deploy/set-github-actions-config.sh belgiumairporttransfers-creator/city-airport-taxis-driver
set -euo pipefail

REPO="${1:-}"
CONFIG="${2:-deploy/github-actions.secrets}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -z "$REPO" ]]; then
  echo "Usage: $0 <github-owner/repo> [config-file]"
  echo "Example: $0 belgiumairporttransfers-creator/city-airport-taxis-admin"
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI first: https://cli.github.com/"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "Run: gh auth login"
  exit 1
fi

if [[ ! -f "$CONFIG" ]]; then
  cp "${SCRIPT_DIR}/github-actions.secrets.example" "$CONFIG"
  echo "Created $CONFIG"
  echo "Edit it with your VPS + URL values (same as backend), then run this script again."
  exit 1
fi

# shellcheck disable=SC1090
source "$CONFIG"

require_var() {
  local name="$1"
  local value="${!name:-}"
  if [[ -z "$value" ]]; then
    echo "Missing $name in $CONFIG"
    exit 1
  fi
}

require_var DEPLOY_HOST
require_var DEPLOY_USER
require_var DEPLOY_SSH_KEY_FILE
require_var GHCR_TOKEN
require_var NEXT_PUBLIC_BACKEND_URL
require_var NEXT_PUBLIC_SITE_URL

if [[ ! -f "$DEPLOY_SSH_KEY_FILE" ]]; then
  echo "SSH key file not found: $DEPLOY_SSH_KEY_FILE"
  exit 1
fi

echo "Configuring GitHub Actions for $REPO ..."

gh secret set DEPLOY_HOST -R "$REPO" -b "$DEPLOY_HOST"
gh secret set DEPLOY_USER -R "$REPO" -b "$DEPLOY_USER"
gh secret set DEPLOY_SSH_KEY -R "$REPO" < "$DEPLOY_SSH_KEY_FILE"
gh secret set GHCR_TOKEN -R "$REPO" -b "$GHCR_TOKEN"

if [[ -n "${DEPLOY_PATH:-}" ]]; then
  gh secret set DEPLOY_PATH -R "$REPO" -b "$DEPLOY_PATH"
fi

if [[ -n "${DEPLOY_PORT:-}" ]]; then
  gh secret set DEPLOY_PORT -R "$REPO" -b "$DEPLOY_PORT"
fi

if [[ -n "${DEPLOY_PORT_APP:-}" ]]; then
  gh secret set DEPLOY_PORT_APP -R "$REPO" -b "$DEPLOY_PORT_APP"
fi

gh variable set NEXT_PUBLIC_BACKEND_URL -R "$REPO" -b "$NEXT_PUBLIC_BACKEND_URL"
gh variable set NEXT_PUBLIC_SITE_URL -R "$REPO" -b "$NEXT_PUBLIC_SITE_URL"

if [[ -n "${NEXT_PUBLIC_SOCKET_PATH:-}" ]]; then
  gh variable set NEXT_PUBLIC_SOCKET_PATH -R "$REPO" -b "$NEXT_PUBLIC_SOCKET_PATH"
fi

echo ""
echo "Done. Secrets and variables are set on $REPO"
echo "Push to main or re-run the Deploy workflow in GitHub Actions."
