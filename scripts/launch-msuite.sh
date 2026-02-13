#!/bin/zsh

# M-Suite Dock / Automator launcher
# Starts (or restarts) the LaunchAgent cleanly, waits for Portal, then opens it.

set -euo pipefail

AGENT="com.msuite.dev"
UID_VALUE="$(id -u)"
DOMAIN="gui/${UID_VALUE}"
TARGET="${DOMAIN}/${AGENT}"
USER_PLIST="${HOME}/Library/LaunchAgents/${AGENT}.plist"
SYSTEM_PLIST="/Library/LaunchAgents/${AGENT}.plist"
PORTAL_URL="http://localhost:4000"
TIMEOUT_SECONDS=90
SLEEP_SECONDS=0.5

if [[ -f "${USER_PLIST}" ]]; then
  PLIST="${USER_PLIST}"
elif [[ -f "${SYSTEM_PLIST}" ]]; then
  PLIST="${SYSTEM_PLIST}"
else
  echo "❌ LaunchAgent not found."
  echo "Checked:"
  echo "  - ${USER_PLIST}"
  echo "  - ${SYSTEM_PLIST}"
  exit 1
fi

echo "📄 Using LaunchAgent plist: ${PLIST}"

if launchctl print "${TARGET}" >/dev/null 2>&1; then
  echo "🛑 Stopping existing agent..."
  launchctl bootout "${TARGET}" >/dev/null 2>&1 || true
fi

echo "▶️ Starting agent..."
if ! launchctl bootstrap "${DOMAIN}" "${PLIST}" >/dev/null 2>&1; then
  echo "❌ Failed to bootstrap ${AGENT}"
  echo "ℹ️ launchctl print output:"
  launchctl print "${TARGET}" 2>&1 || true
  exit 1
fi

echo "⏳ Waiting for Portal on :4000 (timeout ${TIMEOUT_SECONDS}s)..."
elapsed=0
while ! curl -fsS "${PORTAL_URL}" >/dev/null 2>&1; do
  sleep "${SLEEP_SECONDS}"
  elapsed=$((elapsed + 1))
  if (( elapsed >= TIMEOUT_SECONDS * 2 )); then
    echo "❌ Portal did not become ready in ${TIMEOUT_SECONDS}s"
    echo "ℹ️ Agent status:"
    launchctl print "${TARGET}" 2>&1 | head -n 80 || true
    exit 1
  fi
done

echo "🌐 Opening Portal..."
open "${PORTAL_URL}"

osascript -e 'display notification "Portal is running on localhost:4000" with title "M-Suite"'
