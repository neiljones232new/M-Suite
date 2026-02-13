#!/bin/zsh

set -euo pipefail

AGENT="com.msuite.dev"
UID_VALUE="$(id -u)"
DOMAIN="gui/${UID_VALUE}"
USER_PLIST="${HOME}/Library/LaunchAgents/${AGENT}.plist"
SYSTEM_PLIST="/Library/LaunchAgents/${AGENT}.plist"

if [[ -f "${USER_PLIST}" ]]; then
  PLIST="${USER_PLIST}"
elif [[ -f "${SYSTEM_PLIST}" ]]; then
  PLIST="${SYSTEM_PLIST}"
else
  echo "❌ LaunchAgent plist not found."
  exit 1
fi

launchctl bootstrap "${DOMAIN}" "${PLIST}"
