#!/bin/zsh

set -euo pipefail
setopt null_glob

ROOT="/Users/neiljones/Developer/M_Suite"
PM_ROOT="$ROOT/external/M-Practice-Manager"
PM_API="$PM_ROOT/apps/api"

CLEAN_MODE=0
if [[ "${1:-}" == "--clean" ]]; then
  CLEAN_MODE=1
fi

log() {
  printf '[preflight] %s\n' "$1"
}

warn() {
  printf '[preflight][warn] %s\n' "$1" >&2
}

fail() {
  printf '[preflight][error] %s\n' "$1" >&2
  exit 1
}

[[ -d "$ROOT" ]] || fail "Workspace root not found: $ROOT"
[[ -d "$PM_ROOT" ]] || fail "Practice Manager root not found: $PM_ROOT"
[[ -f "$PM_ROOT/.env" ]] || fail "Missing $PM_ROOT/.env"
[[ -f "$PM_API/.env" ]] || warn "Missing $PM_API/.env (root .env may still be sufficient)"

if ! command -v node >/dev/null 2>&1; then
  fail "node is not available on PATH"
fi

if ! command -v pnpm >/dev/null 2>&1; then
  fail "pnpm is not available on PATH"
fi

log "Checking Prisma version alignment"
root_prisma="$(cd "$PM_ROOT" && node -p "require('./package.json').dependencies?.prisma || require('./package.json').devDependencies?.prisma || ''")"
root_client="$(cd "$PM_ROOT" && node -p "require('./package.json').dependencies?.['@prisma/client'] || ''")"
api_prisma="$(cd "$PM_API" && node -p "require('./package.json').dependencies?.prisma || require('./package.json').devDependencies?.prisma || ''")"
api_client="$(cd "$PM_API" && node -p "require('./package.json').dependencies?.['@prisma/client'] || ''")"

[[ -n "$root_prisma" ]] || fail "Root prisma dependency missing in $PM_ROOT/package.json"
[[ -n "$root_client" ]] || fail "Root @prisma/client dependency missing in $PM_ROOT/package.json"
[[ -n "$api_prisma" ]] || fail "API prisma dependency missing in $PM_API/package.json"
[[ -n "$api_client" ]] || fail "API @prisma/client dependency missing in $PM_API/package.json"

if [[ "$root_prisma" != "$api_prisma" || "$root_client" != "$api_client" ]]; then
  fail "Prisma version mismatch. root(prisma=$root_prisma @prisma/client=$root_client) api(prisma=$api_prisma @prisma/client=$api_client)"
fi

artifacts=(
  "$PM_ROOT/apps/web/.next"
  "$PM_ROOT/apps/api/dist"
)

cookie_files=("$PM_ROOT/.turbo/cookies/"*.cookie)
cookie_count=${#cookie_files[@]}

if (( CLEAN_MODE == 1 )); then
  log "Cleaning transient build artifacts"
  for path in "${artifacts[@]}"; do
    if [[ -e "$path" ]]; then
      /bin/rm -rf "$path"
      log "Removed $path"
    fi
  done

  if (( cookie_count > 0 )); then
    /bin/rm -f "${cookie_files[@]}"
    log "Removed $cookie_count turbo cookie artifact(s)"
  fi
else
  stale=0
  for path in "${artifacts[@]}"; do
    if [[ -e "$path" ]]; then
      warn "Found stale artifact: $path"
      stale=1
    fi
  done

  if (( cookie_count > 0 )); then
    warn "Found $cookie_count turbo cookie artifact(s) under $PM_ROOT/.turbo/cookies"
    stale=1
  fi

  if (( stale == 1 )); then
    fail "Stale artifacts detected. Re-run with --clean or remove them manually."
  fi
fi

log "Preflight passed"
