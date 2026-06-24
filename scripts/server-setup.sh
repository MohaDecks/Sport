#!/usr/bin/env bash
# Hal mar oo kaliya — server cusub (Ubuntu/Debian)
set -euo pipefail

echo "==> DSMS Server Setup (Ubuntu/Debian)"
echo ""

if [ "$(id -u)" -ne 0 ]; then
  echo "Ku orod: sudo bash scripts/server-setup.sh"
  exit 1
fi

apt-get update
apt-get install -y curl git

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

if ! command -v mongod >/dev/null 2>&1; then
  echo "MongoDB lama helin — ku rakib: https://www.mongodb.com/docs/manual/administration/install-on-linux/"
fi

echo ""
echo "Setup dhammaaday."
echo "Kadib clone repo-ga oo samee .env.production + backend/.env, kadib:"
echo "  npm run install:server && sudo PM2_CMD='sudo pm2' npm run deploy"
