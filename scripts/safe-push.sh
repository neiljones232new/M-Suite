#!/usr/bin/env bash
set -euo pipefail

# Usage: scripts/safe-push.sh [--untrack] [--secrets-scan] [--push] [branch]

BRANCH=$(git rev-parse --abbrev-ref HEAD)
UNTRACK=false
SECRETS_SCAN=false
PUSH=false

for arg in "$@"; do
  case "$arg" in
    --untrack) UNTRACK=true ;;
    --secrets-scan) SECRETS_SCAN=true ;;
    --push) PUSH=true ;;
    --help) 
      echo "Usage: $0 [--untrack] [--secrets-scan] [--push] [branch]"
      echo ""
      echo "Options:"
      echo "  --untrack       Untrack secret-like files (keeps local copies)"
      echo "  --secrets-scan  Run detect-secrets and update baseline"
      echo "  --push          Push changes to origin"
      echo "  --help          Show this help message"
      exit 0 
      ;;
    -*) 
      echo "Unknown option: $arg"
      exit 1
      ;;
    *) 
      BRANCH="$arg"
      ;;
  esac
done

echo "=== M-Suite Safe Push Script ==="
echo "Branch: $BRANCH"
echo ""

# Ensure recommended patterns are in .gitignore (idempotent)
if ! grep -q "!.secrets.baseline" .gitignore 2>/dev/null; then
  echo "Updating .gitignore with detect-secrets tracking rules..."
  cat >> .gitignore <<'EOF'

# Ensure detect-secrets baseline & pre-commit config tracked
!.secrets.baseline
!.pre-commit-config.yaml
EOF
  git add .gitignore
  git commit -m "chore: update .gitignore for detect-secrets tracking" || true
fi

echo "Scanning for tracked secret-like files..."
TRACKED=$(git ls-files | grep -Ei '\.env$|^\.env\.|\.pem$|\.key$|\.p12$|\.pfx$|\.jks$|credentials|aws-credentials|^\.aws/|com\.msuite\.dev\.plist' || true)

if [ -n "$TRACKED" ]; then
  echo "⚠️  Found tracked secret-like files:"
  echo "$TRACKED"
  echo ""
  
  if [ "$UNTRACK" = true ]; then
    echo "Untracking files (keeping local copies)..."
    echo "$TRACKED" | xargs -r git rm --cached
    git commit -m "chore: untrack secret/personal files; added to .gitignore" || true
    echo "✓ Files untracked"
  else
    echo "💡 Run with --untrack to untrack these files (keeps local copies)."
  fi
else
  echo "✓ No tracked secret-like files found."
fi

echo ""

# Optional detect-secrets baseline
if [ "$SECRETS_SCAN" = true ]; then
  if command -v detect-secrets >/dev/null 2>&1 || command -v python3 -m detect_secrets >/dev/null 2>&1; then
    echo "Running detect-secrets scan..."
    python3 -m detect_secrets scan > .secrets.baseline || true
    git add .secrets.baseline
    git commit -m "chore: update detect-secrets baseline" || true
    echo "✓ Secrets baseline updated"
  else
    echo "⚠️  detect-secrets not installed. Install: pip install detect-secrets"
  fi
fi

echo ""

if [ "$PUSH" = true ]; then
  echo "Pushing to origin/${BRANCH}..."
  git push origin "${BRANCH}"
  echo "✓ Pushed ${BRANCH}"
else
  echo "Dry run finished. Use --untrack / --secrets-scan / --push as needed."
  echo ""
  echo "Example: bash scripts/safe-push.sh --untrack --secrets-scan --push"
fi
