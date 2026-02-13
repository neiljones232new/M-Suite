#!/bin/zsh

set -euo pipefail

export PATH=/Users/neiljones/.nvm/versions/node/v20.20.0/bin:$PATH

ROOT="/Users/neiljones/Developer/M_Suite"
cd "$ROOT"

echo "[launchagent] Running preflight checks"
"$ROOT/scripts/practice-preflight.sh" --clean

echo "[launchagent] Starting suite"
exec pnpm suite:open
