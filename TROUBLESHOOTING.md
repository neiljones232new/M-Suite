# M-Suite Troubleshooting Guide

## Common Issues and Solutions

### Practice Manager API Not Starting

#### Symptom
```
Error: Cannot find module '../../generated/prisma'
```

#### Cause
Prisma client needs to be generated before the API can start.

#### Solution
The API now auto-generates Prisma client on startup via `prestart:dev` script. If you still encounter this issue:

```bash
# Manually generate Prisma client
pnpm -C external/M-Practice-Manager db:generate

# Then start the API
pnpm practice-api
```

#### Prevention
This is now automated. The `prestart:dev` script in `apps/api/package.json` ensures Prisma is generated before every startup.

---

### Port Already in Use

#### Symptom
```
Error: listen EADDRINUSE: address already in use :::3000
```

#### Solution
Find and kill the process using the port:

```bash
# Find process on port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or for all M-Suite ports
kill -9 $(lsof -ti:3000) $(lsof -ti:3001) $(lsof -ti:3100) $(lsof -ti:4000) $(lsof -ti:5173)
```

---

### LaunchAgent Not Working

#### Symptom
Portal control buttons don't work, or you get permission errors.

#### Cause
LaunchAgent plist file not installed in correct location.

#### Solution
```bash
# Copy plist to user LaunchAgents directory
cp com.msuite.dev.plist ~/Library/LaunchAgents/

# Unload if already loaded
launchctl unload ~/Library/LaunchAgents/com.msuite.dev.plist 2>/dev/null

# Load the service
launchctl load ~/Library/LaunchAgents/com.msuite.dev.plist

# Verify it's loaded
launchctl list | grep msuite
```

#### Update Working Directory
Edit `~/Library/LaunchAgents/com.msuite.dev.plist` and update the `WorkingDirectory` to match your installation path:

```xml
<key>WorkingDirectory</key>
<string>/Users/YOUR_USERNAME/Developer/M_Suite</string>
```

---

### Database Connection Issues

#### Symptom
```
Error: Can't reach database server
```

#### For Prisma Accelerate (Default)
Check your `.env` file has a valid `DATABASE_URL`:

```bash
cat external/M-Practice-Manager/.env | grep DATABASE_URL
```

#### For Local PostgreSQL
If you want to use local PostgreSQL instead:

```bash
# Start PostgreSQL with Docker
pnpm -C external/M-Practice-Manager db:up

# Run migrations
pnpm -C external/M-Practice-Manager db:migrate

# Update .env to use local database
# DATABASE_URL="postgresql://user:password@localhost:5432/practice_manager"
```

---

### Package Manager Conflicts

#### Symptom
```
ERR_PNPM_LOCKFILE_MISSING_DEPENDENCY
```

#### Solution
Clean install with pnpm:

```bash
# Remove all node_modules
rm -rf node_modules apps/*/node_modules external/*/node_modules external/*/apps/*/node_modules
rm -rf external/M-Customs-Manager/backend/node_modules

# Remove any npm lock files
find . -name "package-lock.json" -delete

# Reinstall with pnpm
pnpm install
```

---

### Build Artifacts Causing Issues

#### Symptom
Stale builds, TypeScript errors, or "module not found" errors.

#### Solution
Clean all build artifacts:

```bash
# Remove Next.js builds
rm -rf apps/portal/.next
rm -rf external/M-Practice-Manager/apps/web/.next

# Remove NestJS builds
rm -rf external/M-Practice-Manager/apps/api/dist

# Remove Vite builds
rm -rf external/M-Customs-Manager/dist

# Remove TypeScript build info
find . -name "*.tsbuildinfo" -delete

# Rebuild
pnpm install
pnpm -C external/M-Practice-Manager db:generate
```

---

### Services Not Showing as "Running" in Portal

#### Symptom
Portal shows services as "Offline" even though they're running.

#### Cause
Health check endpoints not responding or incorrect.

#### Solution
1. Check each service is actually running:
```bash
# Check ports
lsof -i:3000  # Practice Web
lsof -i:3001  # Practice API
lsof -i:3100  # Customs Backend
lsof -i:5173  # Customs UI
```

2. Test health endpoints directly:
```bash
curl http://localhost:3000                      # Practice Web
curl http://localhost:3001/api/v1/health        # Practice API
curl http://localhost:3100/health               # Customs Backend
curl http://localhost:5173                      # Customs UI
```

3. Check Portal logs:
```bash
# If running via LaunchAgent
tail -f /tmp/msuite.log

# If running manually
# Check terminal output
```

---

### Customs Manager Backend Not Starting

#### Symptom
```
Error: Cannot find module 'express'
```

#### Cause
Backend dependencies not installed.

#### Solution
```bash
# Install backend dependencies
pnpm install --dir external/M-Customs-Manager/backend

# Verify installation
ls external/M-Customs-Manager/backend/node_modules/express
```

---

### Git Submodule Issues

#### Symptom
```
fatal: not a git repository
```

#### Solution
Initialize and update submodules:

```bash
# Initialize submodules
git submodule update --init --recursive

# Update to latest
git submodule update --remote

# If submodules are broken, reset them
git submodule deinit -f .
git submodule update --init --recursive
```

---

### Environment Variables Not Loading

#### Symptom
Services start but features don't work (e.g., Companies House API, JWT auth).

#### Solution
1. Copy example env files:
```bash
cp external/M-Practice-Manager/.env.example external/M-Practice-Manager/.env
cp external/M-Customs-Manager/.env.example external/M-Customs-Manager/.env
cp external/M-Customs-Manager/backend/.env.example external/M-Customs-Manager/backend/.env
```

2. Update with your values:
```bash
# Edit each .env file
nano external/M-Practice-Manager/.env
```

3. Restart services for changes to take effect.

---

### Turbo Cache Issues

#### Symptom
Builds fail or produce unexpected results.

#### Solution
Clear Turbo cache:

```bash
# Clear root turbo cache
rm -rf .turbo/cache

# Clear Practice Manager turbo cache
rm -rf external/M-Practice-Manager/.turbo/cache

# Clear Customs Manager turbo cache
rm -rf external/M-Customs-Manager/.turbo/cache
```

---

## Verification Commands

Run these to verify your setup:

```bash
# 1. Check all required tools
node --version    # Should be >= 18.0.0
pnpm --version    # Should be 10.28.2

# 2. Run verification script
./scripts/verify-setup.sh

# 3. Test individual services
pnpm portal          # Should start on :4000
pnpm practice        # Should start on :3000
pnpm practice-api    # Should start on :3001
pnpm customs         # Should start on :5173
pnpm customs-backend # Should start on :3100

# 4. Test full suite
pnpm suite           # All 5 services should start
```

---

## Getting Help

If you're still experiencing issues:

1. Check the logs:
   - LaunchAgent: `tail -f /tmp/msuite.log`
   - Individual services: Check terminal output

2. Verify setup:
   ```bash
   ./scripts/verify-setup.sh
   ```

3. Clean install:
   ```bash
   # Nuclear option - clean everything and reinstall
   rm -rf node_modules apps/*/node_modules external/*/node_modules
   rm -rf external/M-Customs-Manager/backend/node_modules
   rm -rf external/M-Practice-Manager/apps/*/node_modules
   pnpm install
   pnpm -C external/M-Practice-Manager db:generate
   ```

4. Check documentation:
   - `SETUP.md` - Initial setup guide
   - `FIXES_APPLIED.md` - Recent fixes and changes
   - `README.md` - Project overview

---

## Debug Mode

To run services with more verbose logging:

```bash
# Practice API with debug
NODE_ENV=development LOG_LEVEL=debug pnpm -C external/M-Practice-Manager dev:api

# Next.js with debug
DEBUG=* pnpm portal

# Check what's running
ps aux | grep -E "node|nest|vite|next"
```
