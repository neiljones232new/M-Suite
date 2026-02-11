# M-Suite Copilot Instructions

## Architecture Overview

M-Suite is a monorepo containing three business applications for professional services firms:

- **Portal** (Next.js 16, React 19) - Centralized launcher on port 4000
- **Practice Manager** (Next.js 16 frontend + NestJS API) - Client CRM on ports 3000 (web) & 3001 (API)
- **Customs Manager** (Vite + React frontend + Express backend) - VAT/duty automation on ports 5173 & 3100

**Key architectural fact**: Services communicate via HTTP APIs. Portal acts as an orchestration layer, not a monolithic app. Each service is independently deployable.

## Monorepo Structure & Tools

- **Package Manager**: pnpm 10.28.2 (use `pnpm` not `npm`)
- **Monorepo Tool**: Turbo (for build orchestration across workspaces)
- **Workspace Config**: `pnpm-workspace.yaml` declares packages under `apps/*/` and `external/*/`

### Workspace commands
- `pnpm install` - Install all dependencies across workspaces
- `pnpm build` - Build all apps (respects Turbo task dependencies)
- `pnpm suite` - Concurrently run all dev servers (portal, practice, customs)
- `pnpm suite:open` - Run suite AND open browser to portal (http://localhost:4000)

## Technology Stack Specifics

### Portal (`apps/portal/`)
- Next.js 16 with App Router (not Pages Router)
- React 19 with Tailwind CSS 4
- TypeScript 5
- Runs on port 4000
- Minimal—acts as service orchestrator/launcher
- No database; uses iframes or redirects to other services

### Practice Manager (`external/M-Practice-Manager/`)
**Frontend** (`apps/web/`): Next.js 16, React 18, React Query, React Hook Form
**API** (`apps/api/`): NestJS 10 + Prisma 5.7 + PostgreSQL
**Templates** (`assets/templates/`): HTML letter templates for client documents
**PM UI Components** (`apps/web/src/components-pm-ui/`): Reusable Practice Manager UI components

Data Schema: See [schema.prisma](external/M-Practice-Manager/apps/api/prisma/schema.prisma)
- Central models: `Practice`, `Client`, `User`, `Service`, `FileStorage`
- Audit logging built-in via `@Audit()` decorator

**Dev startup**: `pnpm practice` (frontend) + `pnpm practice-api` (API)
**Database**: PostgreSQL (managed by docker-compose); migrations use Prisma Migrate

### Customs Manager (`external/M-Customs-Manager/`)
**Frontend** (`src/`): Vite + React 18, Tailwind CSS 3, React Router on port 5173
**Backend** (`backend/src/`): Express.js with better-sqlite3 for file-based DB on port 3100

Features: Tauri desktop app support, CSV import/export for duty calculations, VAT compliance automation.

**Dev startup**: `pnpm customs` (frontend) + `pnpm customs-backend` (API)

## Critical Developer Workflows

### Starting All Services
```bash
pnpm suite              # Runs all 5 servers: portal, practice, practice-api, customs, customs-backend
pnpm suite:open        # Runs suite + opens browser to http://localhost:4000
```

### Individual Service Development
```bash
pnpm portal            # Portal on :4000
pnpm practice          # Practice web UI on :3000  
pnpm practice-api      # Practice API on :3001
pnpm customs           # Customs UI on :5173
pnpm customs-backend   # Customs backend on :3100
```

### Database Management (Practice Manager)
```bash
# From workspace root:
pnpm db:generate       # Regenerate Prisma client
pnpm db:migrate        # Run interactive migration (creates .sql files in prisma/migrations/)
pnpm db:deploy         # Run pending migrations in production
pnpm db:push           # Push schema without creating migration files (dev-only)
pnpm db:up             # Start postgres via docker-compose
pnpm db:down           # Stop postgres
pnpm db:reset          # Destroy and recreate postgres database
```

### Testing & Linting
```bash
pnpm test              # Run all tests via Turbo
pnpm -C external/M-Practice-Manager/apps/api test:watch
pnpm -C apps/portal lint
```

### Build for Production
```bash
pnpm build             # Builds all apps (can take 2-3 min)
pnpm -C apps/portal build
pnpm -C external/M-Practice-Manager/apps/api build
```

## NestJS API Patterns (Practice Manager)

Core modules in [apps/api/src/modules/](external/M-Practice-Manager/apps/api/src/modules/):
- **auth**: JWT strategy, GetUser decorator, role-based guards
- **clients**: Client CRM main module
- **companies-house**: Integration with UK company registry
- **file-storage**: Abstract file service (supports local JSON for dev, cloud storage in prod)
- **audit**: Tracks changes via interceptor + decorator
- **integrations**: External API coordination

### Key Patterns
- `@Controller()`, `@Service()` standard NestJS structure
- `@Audit()` decorator logs changes automatically
- `@AllowDemoUser()` decorator for demo mode compatibility
- `PrismaService` injected for database access
- Config via `@nestjs/config` with `.env` files

### File Storage Pattern
```typescript
// Service uses abstract FileStorageService
const user = await this.fileStorageService.readJson<User>('users', userId);
await this.fileStorageService.writeJson('users', userId, user);
```
Location depends on env: local filesystem in dev, S3/cloud in production.

## Cross-Service Communication

**No direct database sharing**—services expose HTTP APIs only:
- Portal calls Practice Manager API (`http://localhost:3001`) for client data
- Portal calls Customs Manager backend (`http://localhost:3100`) for duty info
- Practice Manager integrates with external APIs: Companies House, HMRC

**Demo Mode**: All services support `?demo=true` query param for local dev without external APIs.

## Important File Locations

| Purpose | Location |
|---------|----------|
| Root scripts | [scripts/](scripts/) — `start-msuite.sh`, `restart-msuite.sh` |
| Portal entry | [apps/portal/app/layout.tsx](apps/portal/app/layout.tsx) |
| Practice schema | [external/M-Practice-Manager/apps/api/prisma/schema.prisma](external/M-Practice-Manager/apps/api/prisma/schema.prisma) |
| Practice API boot | [external/M-Practice-Manager/apps/api/src/main.ts](external/M-Practice-Manager/apps/api/src/main.ts) |
| Practice letter templates | [external/M-Practice-Manager/assets/templates/](external/M-Practice-Manager/assets/templates/) |
| Customs frontend | [external/M-Customs-Manager/src/](external/M-Customs-Manager/src/) |
| Customs backend | [external/M-Customs-Manager/backend/src/server.js](external/M-Customs-Manager/backend/src/server.js) |

## Debugging Tips

- **Port conflicts**: Kill process on port via `lsof -i :PORT` then `kill -9 PID`
- **Prisma client out of sync**: Run `pnpm db:generate` after schema changes
- **Docker postgres stuck**: `pnpm db:reset` (destroys data; use backups in prod)
- **pnpm lock conflicts**: Delete `pnpm-lock.yaml` and run `pnpm install`
- **Turbo cache issues**: Delete `.turbo/` folder to force full rebuild

## Node.js & Package Manager Versions

- Node.js >= 18.0.0 required
- pnpm 10.28.2 pinned in [package.json](package.json)
- Use `pnpm` exclusively—avoid `npm` or `yarn` to prevent lock file conflicts

## Common Data Flows

1. **User logs in to Practice Manager**: Portal redirects to `/login` on `:3000` → NestJS auth validates → JWT token stored
2. **Client created in Practice Manager**: React form → NestJS POST → Prisma writes to PostgreSQL → File storage backup created
3. **Duty calculation in Customs**: React form → Express endpoint → SQLite lookup + calculation → CSV export

## When Adding New Features

1. **New NestJS endpoint?** Create controller in module, add Prisma model if data needed, add integration test
2. **New React component?** Follow existing file structure in respective app (`apps/web/`, `external/M-Customs-Manager/src/`)
3. **Database change?** Modify [schema.prisma](external/M-Practice-Manager/apps/api/prisma/schema.prisma), run `pnpm db:migrate dev --name describe_change`, commit the migration file
4. **New service communication?** Add HTTP client call—prefer axios (already installed in both web apps)

---

**Last updated**: February 2026 | For questions, check README.md or examine existing module patterns.
