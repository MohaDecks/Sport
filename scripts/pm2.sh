#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ACTION="${1:-reload}"

cd "$ROOT"

# PM2_CMD="sudo pm2" waa inuu u kala baxaa (laba eray), ma aha hal command
if [ "$(id -u)" -eq 0 ]; then
  PM2_CMD="${PM2_CMD:-pm2}"
  PM2_CMD="${PM2_CMD#sudo }"
else
  PM2_CMD="${PM2_CMD:-pm2}"
fi

run_pm2() {
  # shellcheck disable=SC2086
  $PM2_CMD "$@"
}

case "$ACTION" in
  start)
    run_pm2 start ecosystem.config.cjs
    ;;
  reload)
    if run_pm2 describe dsms-api >/dev/null 2>&1; then
      run_pm2 reload ecosystem.config.cjs --update-env
    else
      run_pm2 start ecosystem.config.cjs
    fi
    ;;
  *)
    echo "Usage: bash scripts/pm2.sh [start|reload]"
    exit 1
    ;;
esac

run_pm2 save
echo ""
echo "==> PM2 processes:"
run_pm2 list
