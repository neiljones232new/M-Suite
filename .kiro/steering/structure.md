# Project Structure

## Monorepo Layout

```
M-Suite/
├── apps/                    # Internal applications
│   └── portal/             # Next.js portal app (port 4000)
│       ├── app/            # Next.js App Router
│       │   ├── api/        # API routes
│       │   │   ├── control/    # LaunchAgent control endpoints
│       │   │   └── status/     # Service health checks
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── globals.css
│       ├── public/         # Static assets (logos, offline.html)
│       └── package.json
│
├── external/               # Git submodules for external apps
│   ├── M-Practice-Manager/ # Practice management system
│   └── M-Customs-Manager/  # Customs management system
│       ├── backend/        # Express API (port 3100)
│       │   ├── src/
│       │   │   ├── config/
│       │   │   ├── middleware/
│       │   │   ├── routes/
│       │   │   ├── services/
│       │   │   └── server.js
│       │   ├── data/       # SQLite databases
│       │   └── uploads/    # File upload storage
│       └── (frontend files) # Vite app (port 5173)
│
├── .kiro/                  # Kiro configuration
│   ├── steering/           # AI assistant guidance docs
│   └── specs/              # Feature specifications
│
└── package.json            # Root workspace config
```

## Key Conventions

### Portal Application
- **App Router**: Use Next.js 13+ app directory structure
- **Client Components**: Mark with `"use client"` directive when using hooks/interactivity
- **API Routes**: Place in `app/api/[route]/route.ts`
- **Path Aliases**: Use `@/*` for imports from app root
- **Styling**: Inline styles currently used; Tailwind available via `tailwindcss` package

### Backend Services
- **ES Modules**: Use `import/export` syntax (type: "module" in package.json)
- **Environment**: Load config via dotenv from `.env` files
- **Database**: SQLite files stored in `backend/data/`
- **Uploads**: File storage in `backend/uploads/`

### External Submodules
- Located in `external/` directory
- Managed as git submodules (see `.gitmodules`)
- Each has independent package.json and dependencies
- Run via npm/pnpm commands from root workspace

## File Naming

- **React Components**: PascalCase (e.g., `StatusLight.tsx`)
- **API Routes**: lowercase with hyphens (e.g., `app/api/control/route.ts`)
- **Config Files**: lowercase with dots (e.g., `next.config.ts`, `eslint.config.mjs`)
- **TypeScript**: Use `.ts` for Node, `.tsx` for React components

## Import Patterns

Portal uses path alias:
```typescript
import { Component } from '@/components/Component'
```

Backend uses relative imports:
```javascript
import { authMiddleware } from './middleware/auth.js'
```

## Asset Management

- **Logos**: Multiple color variants in `public/` (Gold, Silver, PurpleD, etc.)
- **Static Files**: Place in `apps/portal/public/`
- **Offline Page**: `public/offline.html` shown when services stop
