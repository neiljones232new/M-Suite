# M-Suite Quick Start

## First Time Setup (5 minutes)

```bash
# 1. Install dependencies
pnpm install

# 2. Generate Prisma client (Practice Manager)
pnpm -C external/M-Practice-Manager db:generate

# 3. Copy environment files (optional)
cp external/M-Practice-Manager/.env.example external/M-Practice-Manager/.env
cp external/M-Customs-Manager/.env.example external/M-Customs-Manager/.env

# 4. Start everything
pnpm suite

# 5. Open Portal
open http://localhost:4000
```

## Daily Development

```bash
# Start all services
pnpm suite

# Or start individually
pnpm portal          # Portal on :4000
pnpm practice        # Practice Web on :3000
pnpm practice-api    # Practice API on :3001
pnpm customs         # Customs UI on :5173
pnpm customs-backend # Customs Backend on :3100
```

## Common Commands

```bash
# Verify setup
./scripts/verify-setup.sh

# Clean build artifacts
rm -rf apps/portal/.next
rm -rf external/M-Practice-Manager/apps/web/.next
rm -rf external/M-Practice-Manager/apps/api/dist
rm -rf external/M-Customs-Manager/dist

# Regenerate Prisma
pnpm -C external/M-Practice-Manager db:generate

# Kill all services
kill -9 $(lsof -ti:3000,3001,3100,4000,5173)
```

## Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Portal | http://localhost:4000 | Main dashboard |
| Practice Web | http://localhost:3000 | Client management UI |
| Practice API | http://localhost:3001/api/v1/docs | API documentation |
| Customs UI | http://localhost:5173 | Customs management |
| Customs Backend | http://localhost:3100/health | Backend API |

## Troubleshooting

**API won't start?**
```bash
pnpm -C external/M-Practice-Manager db:generate
```

**Port in use?**
```bash
kill -9 $(lsof -ti:3001)  # Replace 3001 with your port
```

**Dependencies broken?**
```bash
rm -rf node_modules
pnpm install
```

See `TROUBLESHOOTING.md` for more help.

## LaunchAgent (Optional)

For automatic startup and Portal control:

```bash
# Install
cp com.msuite.dev.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.msuite.dev.plist

# Control from Portal UI at http://localhost:4000
```

## Documentation

- `SETUP.md` - Detailed setup guide
- `TROUBLESHOOTING.md` - Common issues and solutions
- `FIXES_APPLIED.md` - Recent changes
- `README.md` - Project overview
