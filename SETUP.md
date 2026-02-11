# M-Suite Setup Guide

## Prerequisites

- **Node.js**: >= 18.0.0 (v22.22.0 recommended)
- **pnpm**: 10.28.2 (required - do not use npm or yarn)
- **PostgreSQL**: For Practice Manager database
- **macOS**: For LaunchAgent integration (optional)

## Initial Setup

### 1. Install Dependencies

```bash
# Install all dependencies across the monorepo
pnpm install
```

This will install dependencies for:
- Root workspace
- Portal (apps/portal)
- Practice Manager (external/M-Practice-Manager)
- Customs Manager (external/M-Customs-Manager)
- Customs Backend (external/M-Customs-Manager/backend)

### 2. Generate Prisma Client (Practice Manager)

**Important**: The Practice Manager API requires Prisma client to be generated before first run.

```bash
# Generate Prisma client
pnpm -C external/M-Practice-Manager db:generate
```

This is now automated - the API will auto-generate Prisma client on startup.

### 3. Database Setup (Practice Manager)

The Practice Manager is configured to use Prisma Accelerate (cloud database). No local database setup required.

If you need to run migrations:

```bash
# Run migrations (if needed)
pnpm -C external/M-Practice-Manager db:migrate
```

### 4. Environment Configuration

Copy and configure environment files:

```bash
# Practice Manager
cp external/M-Practice-Manager/.env.example external/M-Practice-Manager/.env

# Customs Manager
cp external/M-Customs-Manager/.env.example external/M-Customs-Manager/.env
cp external/M-Customs-Manager/backend/.env.example external/M-Customs-Manager/backend/.env
```

## Running the Suite

### Option 1: Run All Services (Recommended)

```bash
pnpm suite
```

This starts all 5 services concurrently:
- Portal (http://localhost:4000)
- Practice Web (http://localhost:3000)
- Practice API (http://localhost:3001)
- Customs UI (http://localhost:5173)
- Customs Backend (http://localhost:3100)

### Option 2: Run Individual Services

```bash
# Portal only
pnpm portal

# Practice Manager
pnpm practice        # Web UI
pnpm practice-api    # Backend API

# Customs Manager
pnpm customs         # Frontend
pnpm customs-backend # Backend
```

### Option 3: LaunchAgent (macOS Background Service)

For automatic startup and management via the Portal UI:

```bash
# Copy plist to user LaunchAgents directory
cp com.msuite.dev.plist ~/Library/LaunchAgents/

# Load the service
launchctl load ~/Library/LaunchAgents/com.msuite.dev.plist

# Now you can control it from the Portal UI at http://localhost:4000
```

**Note**: Update the `WorkingDirectory` in the plist file to match your installation path.

## Port Allocation

| Service | Port | Health Check |
|---------|------|--------------|
| Portal | 4000 | http://localhost:4000 |
| Practice Web | 3000 | http://localhost:3000 |
| Practice API | 3001 | http://localhost:3001/api/v1/health |
| Customs UI | 5173 | http://localhost:5173 |
| Customs Backend | 3100 | http://localhost:3100/health |

## Building for Production

```bash
# Build all apps
pnpm -C apps/portal build
pnpm -C external/M-Practice-Manager build
pnpm -C external/M-Customs-Manager build
```

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Find process using port (e.g., 3000)
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)
```

### Database Connection Issues

```bash
# Reset PostgreSQL
pnpm -C external/M-Practice-Manager db:reset

# Check database status
pnpm -C external/M-Practice-Manager db:up
```

### Clean Install

If you encounter dependency issues:

```bash
# Remove all node_modules and lock files
rm -rf node_modules apps/*/node_modules external/*/node_modules external/*/apps/*/node_modules
rm -rf external/M-Customs-Manager/backend/node_modules

# Remove build artifacts
rm -rf apps/portal/.next
rm -rf external/M-Practice-Manager/apps/web/.next
rm -rf external/M-Practice-Manager/apps/api/dist
rm -rf external/M-Customs-Manager/dist

# Reinstall
pnpm install
```

## Development Workflow

1. **Start the suite**: `pnpm suite`
2. **Open Portal**: Navigate to http://localhost:4000
3. **Monitor status**: Portal shows real-time health of all services
4. **Access apps**: Click links in Portal to open individual apps

## Package Manager Rules

⚠️ **IMPORTANT**: This monorepo uses **pnpm exclusively**

- ✅ Use: `pnpm install`, `pnpm add`, `pnpm run`
- ❌ Never use: `npm install`, `yarn add`
- All scripts are configured for pnpm
- Lock files: Only `pnpm-lock.yaml` (no package-lock.json or yarn.lock)

## Git Submodules

Practice Manager and Customs Manager are git submodules:

```bash
# Update submodules
git submodule update --init --recursive

# Pull latest changes
git submodule update --remote
```

## Additional Resources

- Portal README: `apps/portal/README.md`
- Practice Manager: `external/M-Practice-Manager/README.md`
- Customs Manager: `external/M-Customs-Manager/README.md`
- Structure Migration: `STRUCTURE_MIGRATION.md`
