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
apt-get install -y curl git openjdk-17-jdk

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

ANDROID_SDK="/opt/android-sdk"
if [ ! -d "$ANDROID_SDK" ]; then
  echo "==> Android SDK rakibidda..."
  mkdir -p "$ANDROID_SDK/cmdline-tools"
  cd /tmp
  curl -fsSLO https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
  unzip -qo commandlinetools-linux-11076708_latest.zip -d "$ANDROID_SDK/cmdline-tools"
  mv "$ANDROID_SDK/cmdline-tools/cmdline-tools" "$ANDROID_SDK/cmdline-tools/latest"
  export ANDROID_HOME="$ANDROID_SDK"
  export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"
  yes | sdkmanager --licenses >/dev/null 2>&1 || true
  sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"
fi

if ! command -v mongod >/dev/null 2>&1; then
  echo "MongoDB lama helin — ku rakib: https://www.mongodb.com/docs/manual/administration/install-on-linux/"
fi

PROFILE_SNIPPET='
# DSMS Android build
export ANDROID_HOME=/opt/android-sdk
export ANDROID_SDK_ROOT=/opt/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
'

if ! grep -q "DSMS Android build" /etc/profile.d/dsms-android.sh 2>/dev/null; then
  echo "$PROFILE_SNIPPET" >/etc/profile.d/dsms-android.sh
  chmod +x /etc/profile.d/dsms-android.sh
fi

echo ""
echo "Setup dhammaaday. Logout/login ama: source /etc/profile.d/dsms-android.sh"
echo "Kadib clone repo-ga oo samee .env.production, kadib:"
echo "  npm run install:all && sudo PM2_CMD='sudo pm2' npm run deploy"
