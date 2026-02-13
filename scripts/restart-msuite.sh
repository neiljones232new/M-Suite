#!/bin/zsh

set -euo pipefail

AGENT="com.msuite.dev"
UID_VALUE="$(id -u)"
TARGET="gui/${UID_VALUE}/${AGENT}"

if launchctl print "${TARGET}" >/dev/null 2>&1; then
  launchctl kickstart -k "${TARGET}"
else
  echo "⚠️ ${AGENT} is not loaded. Run scripts/start-msuite.sh first."
  exit 1
fi
