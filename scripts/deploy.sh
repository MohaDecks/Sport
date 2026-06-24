#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"

if [ -f "$ROOT/.env.production" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env.production"
  set +a
fi

API_URL="${VITE_API_URL:-${EXPO_PUBLIC_API_URL:-http://2.58.82.168:5001/api}}"
export VITE_API_URL="$API_URL"
export EXPO_PUBLIC_API_URL="${EXPO_PUBLIC_API_URL:-$API_URL}"

echo "==> Deploy DSMS — API: $API_URL"

if [ ! -f "$ROOT/backend/.env" ]; then
  echo "ERROR: backend/.env ma jiro."
  echo "  cp backend/.env.example backend/.env"
  echo "  nano backend/.env   # MONGODB_URI, JWT_SECRET"
  exit 1
fi

echo "==> 1/2 Admin portal build..."
npm run build:admin

if [ "${BUILD_APK:-}" = "1" ]; then
  echo "==> APK build (BUILD_APK=1)..."
  npm run build:apk
fi

echo "==> 2/2 PM2 reload..."
bash scripts/pm2.sh reload

echo ""
echo "Deploy dhammaaday!"
echo "  Admin:    http://2.58.82.168:5001/"
echo "  API:      http://2.58.82.168:5001/api/health"
