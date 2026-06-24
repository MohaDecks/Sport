#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PM2="${PM2_CMD:-pm2}"
ACTION="${1:-reload}"

cd "$ROOT"

case "$ACTION" in
  start)
    "$PM2" start ecosystem.config.cjs
    ;;
  reload)
    if "$PM2" describe dsms-api >/dev/null 2>&1; then
      "$PM2" reload ecosystem.config.cjs --update-env
    else
      "$PM2" start ecosystem.config.cjs
    fi
    ;;
  *)
    echo "Usage: bash scripts/pm2.sh [start|reload]"
    exit 1
    ;;
esac

"$PM2" save
echo ""
echo "==> PM2 processes:"
"$PM2" list
