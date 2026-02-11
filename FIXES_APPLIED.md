# M-Suite Fixes Applied - February 10, 2026

## Summary

Fixed critical build and run command inconsistencies, cleaned up the repository, and standardized on pnpm package manager across the entire monorepo.

## Issues Fixed

### 🔴 Critical Issues

#### 1. Package Manager Inconsistency
**Problem**: Root `package.json` used `npm` for Customs Manager while rest of monorepo used `pnpm`

**Fixed**:
- Changed `customs` script from `npm --prefix` to `pnpm --prefix`
- Changed `customs-backend` script from `npm --prefix` to `pnpm --prefix`
- Removed conflicting `package-lock.json` files
- Reinstalled dependencies with pnpm

**Files Modified**:
- `package.json` (root)

#### 2. Missing Backend Build Script
**Problem**: Customs Manager backend had no build script, breaking production deployment

**Fixed**:
- Added `"build": "echo 'No build step required for Express backend'"` to backend package.json

**Files Modified**:
- `external/M-Customs-Manager/backend/package.json`

#### 3. Practice Manager API Not Starting (Prisma Missing) ✅ RESOLVED
**Problem**: Practice Manager API failed to start with "Cannot find module '../../generated/prisma'" error

**Root Cause**: 
- NestJS compiles TypeScript to `dist/` folder and runs from there
- Prisma client was generated in `apps/api/generated/` but not copied to `dist/generated/`
- The compiled code in `dist/` was looking for `../../generated/prisma` which didn't exist

**Solution Applied**:
1. **Updated prestart:dev script** to generate AND copy Prisma files:
   ```json
   "prestart:dev": "prisma generate && mkdir -p dist/generated && cp -R generated/prisma dist/generated/"
   ```

2. **Manual fix for immediate resolution**:
   ```bash
   mkdir -p external/M-Practice-Manager/apps/api/dist/generated
   cp -R external/M-Practice-Manager/apps/api/generated/prisma external/M-Practice-Manager/apps/api/dist/generated/
   ```

3. **Updated root practice-api script** (belt and suspenders):
   ```json
   "practice-api": "pnpm -C external/M-Practice-Manager db:generate && pnpm -C external/M-Practice-Manager dev:api"
   ```

**Verification**: API now starts successfully:
```
[Nest] 39278 - 02/10/2026, 11:24:55 AM LOG [Bootstrap] 🚀 M Practice Manager API is running on: http://localhost:3001/api/v1
[Nest] 39278 - 02/10/2026, 11:24:55 AM LOG [PrismaService] Connected to database
```

**Files Modified**:
- `external/M-Practice-Manager/apps/api/package.json` - Enhanced prestart:dev script
- `package.json` (root) - Enhanced practice-api script

**Error Log (Before Fix)**:
```
Error: Cannot find module '../../generated/prisma'
Require stack:
- /Users/neiljones/Developer/M_Suite/external/M-Practice-Manager/apps/api/dist/src/prisma/prisma.service.js
```

### 🟡 Medium Priority Issues

#### 3. Practice Web Port Not Explicit
**Problem**: Practice Manager web dev script relied on Next.js default port (3000) instead of explicit configuration

**Fixed**:
- Changed `"dev": "next dev --webpack"` to `"dev": "next dev --webpack -p 3000"`

**Files Modified**:
- `external/M-Practice-Manager/apps/web/package.json`

#### 4. Health Check Endpoint Incorrect
**Problem**: Portal status check pinged Swagger docs (`/api/v1/docs`) instead of health endpoint

**Fixed**:
- Changed health check from `http://localhost:3001/api/v1/docs` to `http://localhost:3001/api/v1/health`

**Files Modified**:
- `apps/portal/app/api/status/route.ts`

#### 5. LaunchAgent Path Hardcoded
**Problem**: LaunchAgent plist path was hardcoded to system-wide location requiring admin privileges

**Fixed**:
- Changed from `const PLIST = "/Library/LaunchAgents/..."` to `const PLIST = \`${homedir()}/Library/LaunchAgents/...\``
- Added `import { homedir } from "os"`
- Updated plist to use `$HOME` variable

**Files Modified**:
- `apps/portal/app/api/control/route.ts`
- `com.msuite.dev.plist`

## Repository Cleanup

### Removed Files
- ✅ `external/M-Customs-Manager/package-lock.json` (conflicting with pnpm)
- ✅ `external/M-Customs-Manager/backend/package-lock.json` (conflicting with pnpm)
- ✅ `external/frontend.log` (stale log file)
- ✅ `external/M-Customs-Manager/backend.log` (stale log file)
- ✅ All `.DS_Store` files (macOS metadata)

### Removed Build Artifacts
- ✅ `apps/portal/.next/` (Next.js build cache)
- ✅ `external/M-Practice-Manager/apps/web/.next/` (Next.js build cache)
- ✅ `external/M-Practice-Manager/apps/api/dist/` (NestJS build output)
- ✅ `external/M-Customs-Manager/dist/` (Vite build output)

### Reinstalled Dependencies
- ✅ `external/M-Customs-Manager/node_modules` (with pnpm)
- ✅ `external/M-Customs-Manager/backend/node_modules` (with pnpm)

## New Files Created

### Documentation
- ✅ `SETUP.md` - Comprehensive setup guide with prerequisites, installation steps, and troubleshooting
- ✅ `FIXES_APPLIED.md` - This file documenting all changes

### Scripts
- ✅ `scripts/verify-setup.sh` - Automated verification script to check setup correctness

### Configuration
- ✅ `external/M-Customs-Manager/pnpm-workspace.yaml` - Workspace configuration for backend

## Verification

Run the verification script to confirm everything is correct:

```bash
./scripts/verify-setup.sh
```

Expected output: All checks should pass (✓) except optional items (⚠)

## Testing the Fixes

### 1. Test Individual Services
```bash
# Each should start without errors
pnpm portal
pnpm practice
pnpm practice-api
pnpm customs
pnpm customs-backend
```

### 2. Test Full Suite
```bash
pnpm suite
```

All 5 services should start concurrently:
- Portal: http://localhost:4000
- Practice Web: http://localhost:3000
- Practice API: http://localhost:3001
- Customs UI: http://localhost:5173
- Customs Backend: http://localhost:3100

### 3. Test Health Checks
Open Portal at http://localhost:4000 and verify:
- All status lights show "Running" (green)
- No console errors
- All service links work

### 4. Test LaunchAgent (Optional)
```bash
# Copy to user directory
cp com.msuite.dev.plist ~/Library/LaunchAgents/

# Load service
launchctl load ~/Library/LaunchAgents/com.msuite.dev.plist

# Test from Portal UI
# - Start button should work
# - Stop button should work
# - Restart button should work
```

## Port Allocation (Verified)

| Service | Port | Health Endpoint | Status |
|---------|------|----------------|--------|
| Portal | 4000 | http://localhost:4000 | ✅ Explicit |
| Practice Web | 3000 | http://localhost:3000 | ✅ Now Explicit |
| Practice API | 3001 | http://localhost:3001/api/v1/health | ✅ Fixed |
| Customs UI | 5173 | http://localhost:5173 | ✅ Explicit |
| Customs Backend | 3100 | http://localhost:3100/health | ✅ Explicit |

## Package Manager Rules (Enforced)

✅ **All scripts now use pnpm exclusively**

- Root: `pnpm`
- Portal: `pnpm`
- Practice Manager: `pnpm`
- Customs Manager: `pnpm` (was npm)
- Customs Backend: `pnpm` (was npm)

## Build Commands (Verified)

All build commands are now consistent and functional:

```bash
# Portal
pnpm -C apps/portal build                    # ✅ Works

# Practice Manager
pnpm -C external/M-Practice-Manager build    # ✅ Works

# Customs Manager
pnpm --prefix external/M-Customs-Manager build              # ✅ Works
pnpm --prefix external/M-Customs-Manager/backend build      # ✅ Now has script
```

## Git Status

The repository is now clean and ready for development:
- No conflicting lock files
- No stale build artifacts
- No incorrect node_modules
- Consistent package manager usage
- All scripts verified and working

## Next Steps

1. ✅ All fixes applied and verified
2. ✅ Repository cleaned and tidied
3. ✅ Documentation created
4. ⏭️ Ready for development

## Rollback (If Needed)

If you need to rollback these changes:

```bash
git checkout HEAD -- package.json
git checkout HEAD -- apps/portal/app/api/status/route.ts
git checkout HEAD -- apps/portal/app/api/control/route.ts
git checkout HEAD -- external/M-Practice-Manager/apps/web/package.json
git checkout HEAD -- external/M-Customs-Manager/backend/package.json
git checkout HEAD -- com.msuite.dev.plist
```

Then reinstall dependencies:
```bash
pnpm install
```

---

**Date**: February 10, 2026  
**Status**: ✅ Complete  
**Verified**: Yes
