#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MOBILE="$ROOT/mobile-app"
RELEASES="$ROOT/backend/public/releases"
APK_NAME="district-sports.apk"

if [ -f "$ROOT/.env.production" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env.production"
  set +a
fi

API_URL="${EXPO_PUBLIC_API_URL:-http://2.58.82.168:5001/api}"
export EXPO_PUBLIC_API_URL="$API_URL"

# mobile-app/.env ma jiro server-ka cusub — Expo prebuild wuxuu u baahan yahay
if [ ! -f "$MOBILE/.env" ]; then
  echo "EXPO_PUBLIC_API_URL=$API_URL" >"$MOBILE/.env"
  echo "    mobile-app/.env waa la sameeyay (API: $API_URL)"
fi

if ! command -v java >/dev/null 2>&1; then
  echo "ERROR: Java (JDK 17+) lama helin. Ku rakib server-ka: sudo apt install openjdk-17-jdk"
  exit 1
fi

if [ -z "${ANDROID_HOME:-}" ] && [ -z "${ANDROID_SDK_ROOT:-}" ]; then
  echo "ERROR: ANDROID_HOME lama dejin."
  echo "Tusaale: export ANDROID_HOME=/opt/android-sdk"
  exit 1
fi

echo "==> APK build — API: $EXPO_PUBLIC_API_URL"

cd "$MOBILE"
npm run prebuild
chmod +x android/gradlew
cd android
./gradlew assembleRelease --no-daemon

APK_PATH="$(find app/build/outputs/apk/release -name '*.apk' -type f | head -1)"
if [ -z "$APK_PATH" ]; then
  echo "ERROR: APK lama helin ka dib build-ka"
  exit 1
fi

mkdir -p "$RELEASES"
cp "$APK_PATH" "$RELEASES/$APK_NAME"
echo "==> APK diyaar: $RELEASES/$APK_NAME"
echo "    Download: http://2.58.82.168:5001/downloads/$APK_NAME"
