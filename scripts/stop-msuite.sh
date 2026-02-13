#!/bin/zsh

set -euo pipefail

AGENT="com.msuite.dev"
UID_VALUE="$(id -u)"
TARGET="gui/${UID_VALUE}/${AGENT}"

launchctl bootout "${TARGET}" >/dev/null 2>&1 || true
