# Technology Stack

## Build System

**Package Manager**: pnpm (v10.28.2)
**Monorepo Tool**: Turborepo for task orchestration
**Node Version**: >=18.0.0 (specified in backend)

## Portal Application

**Framework**: Next.js 16.1.6 (App Router)
**Runtime**: React 19.2.3
**Language**: TypeScript 5 (strict mode enabled)
**Styling**: Tailwind CSS 4
**Linting**: ESLint 9 with Next.js config

### TypeScript Configuration
- Target: ES2017
- Strict mode enabled
- Path alias: `@/*` maps to root
- JSX: react-jsx

## Backend Services

**Customs Manager Backend**:
- Runtime: Node.js (ES modules)
- Framework: Express 4
- Database: SQLite (better-sqlite3) + PostgreSQL (pg)
- Auth: JWT + bcrypt
- File uploads: Multer
- Dev server: Nodemon

## Common Commands

### Development
```bash
# Start all services
pnpm suite

# Start individual services
pnpm portal          # Portal on :4000
pnpm practice        # Practice web on :3000
pnpm practice-api    # Practice API on :3001
pnpm customs         # Customs UI on :5173
pnpm customs-backend # Customs backend on :3100

# Start suite and open apps
pnpm suite:open
```

### Portal Commands
```bash
# Development (from apps/portal)
pnpm dev    # Runs on port 4000

# Production
pnpm build
pnpm start
```

### Customs Backend Commands
```bash
# Development (from external/M-Customs-Manager/backend)
npm run dev   # Nodemon with hot reload
npm start     # Production mode
```

## Port Allocation

- 3000: Practice Manager Web UI
- 3001: Practice Manager API
- 3100: Customs Manager Backend API
- 4000: M-Suite Portal
- 5173: Customs Manager Web UI
