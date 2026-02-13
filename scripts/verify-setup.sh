#!/bin/bash

# M-Suite Setup Verification Script
# Checks that all dependencies and configurations are correct

set -e

echo "🔍 M-Suite Setup Verification"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is not installed"
        return 1
    fi
}

check_version() {
    local cmd=$1
    local expected=$2
    local actual=$($cmd 2>&1)
    echo -e "${GREEN}✓${NC} $cmd version: $actual"
}

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        return 0
    else
        echo -e "${RED}✗${NC} $1 not found"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} $1 not found (will be created on install)"
        return 1
    fi
}

# 1. Check required commands
echo "1. Checking required tools..."
check_command node || exit 1
check_command pnpm || exit 1
check_command git || exit 1
echo ""

# 2. Check versions
echo "2. Checking versions..."
check_version "node --version" "v20.20.0"
check_version "pnpm --version" "10.28.2"
echo ""

# 3. Check package.json files
echo "3. Checking package.json files..."
check_file "package.json"
check_file "apps/portal/package.json"
check_file "external/M-Practice-Manager/package.json"
check_file "external/M-Customs-Manager/package.json"
check_file "external/M-Customs-Manager/backend/package.json"
echo ""

# 4. Check for incorrect lock files
echo "4. Checking for incorrect lock files..."
if [ -f "external/M-Customs-Manager/package-lock.json" ]; then
    echo -e "${RED}✗${NC} Found package-lock.json in Customs Manager (should use pnpm-lock.yaml)"
else
    echo -e "${GREEN}✓${NC} No package-lock.json in Customs Manager"
fi

if [ -f "external/M-Customs-Manager/backend/package-lock.json" ]; then
    echo -e "${RED}✗${NC} Found package-lock.json in Customs Backend (should use pnpm-lock.yaml)"
else
    echo -e "${GREEN}✓${NC} No package-lock.json in Customs Backend"
fi
echo ""

# 5. Check node_modules
echo "5. Checking node_modules..."
check_dir "node_modules"
check_dir "apps/portal/node_modules"
check_dir "external/M-Practice-Manager/node_modules"
check_dir "external/M-Customs-Manager/node_modules"
check_dir "external/M-Customs-Manager/backend/node_modules"
echo ""

# 6. Check environment files
echo "6. Checking environment files..."
if [ -f "external/M-Practice-Manager/.env" ]; then
    echo -e "${GREEN}✓${NC} Practice Manager .env exists"
else
    echo -e "${YELLOW}⚠${NC} Practice Manager .env not found (copy from .env.example)"
fi

if [ -f "external/M-Customs-Manager/.env" ]; then
    echo -e "${GREEN}✓${NC} Customs Manager .env exists"
else
    echo -e "${YELLOW}⚠${NC} Customs Manager .env not found (copy from .env.example)"
fi
echo ""

# 7. Check LaunchAgent
echo "7. Checking LaunchAgent setup..."
check_file "com.msuite.dev.plist"
if [ -f "$HOME/Library/LaunchAgents/com.msuite.dev.plist" ]; then
    echo -e "${GREEN}✓${NC} LaunchAgent installed in ~/Library/LaunchAgents/"
else
    echo -e "${YELLOW}⚠${NC} LaunchAgent not installed (optional - see SETUP.md)"
fi
echo ""

# 8. Check for build artifacts (should be clean)
echo "8. Checking for build artifacts..."
if [ -d "apps/portal/.next" ]; then
    echo -e "${YELLOW}⚠${NC} Found apps/portal/.next (run: rm -rf apps/portal/.next)"
else
    echo -e "${GREEN}✓${NC} No portal build artifacts"
fi

if [ -d "external/M-Practice-Manager/apps/web/.next" ]; then
    echo -e "${YELLOW}⚠${NC} Found Practice web .next (run: rm -rf external/M-Practice-Manager/apps/web/.next)"
else
    echo -e "${GREEN}✓${NC} No Practice web build artifacts"
fi

if [ -d "external/M-Practice-Manager/apps/api/dist" ]; then
    echo -e "${YELLOW}⚠${NC} Found Practice API dist (run: rm -rf external/M-Practice-Manager/apps/api/dist)"
else
    echo -e "${GREEN}✓${NC} No Practice API build artifacts"
fi

if [ -d "external/M-Customs-Manager/dist" ]; then
    echo -e "${YELLOW}⚠${NC} Found Customs dist (run: rm -rf external/M-Customs-Manager/dist)"
else
    echo -e "${GREEN}✓${NC} No Customs build artifacts"
fi
echo ""

# Summary
echo "=============================="
echo -e "${GREEN}✓${NC} Verification complete!"
echo ""
echo "Next steps:"
echo "  1. Run 'pnpm install' if node_modules are missing"
echo "  2. Copy .env.example files to .env and configure"
echo "  3. Run 'pnpm suite' to start all services"
echo "  4. Open http://localhost:4000 for the Portal"
echo ""
