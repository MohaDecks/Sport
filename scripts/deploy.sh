#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PM2="${PM2_CMD:-pm2}"

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

echo "==> 1/3 Admin portal build..."
npm run build:admin

echo "==> 2/3 APK build..."
if [ "${SKIP_APK_BUILD:-}" = "1" ]; then
  echo "    SKIP_APK_BUILD=1 — APK waa la dhaafay"
else
  npm run build:apk
fi

echo "==> 3/3 PM2 reload..."
bash scripts/pm2.sh reload

echo ""
echo "Deploy dhammaaday!"
echo "  Admin:    http://2.58.82.168:5001/"
echo "  API:      http://2.58.82.168:5001/api/health"
echo "  APK:      http://2.58.82.168:5001/downloads/district-sports.apk"
