# M-Suite

Unified launcher and management portal for multiple business applications serving professional services firms.

## Overview

M-Suite is a monorepo containing:
- **Portal** - Centralized application launcher with service orchestration
- **Practice Manager** - Client management and compliance platform
- **Customs Manager** - Duty and VAT repayment automation suite

## Architecture

```
M-Suite/
├── apps/
│   └── portal/              # Next.js portal (port 4000)
├── external/
│   ├── M-Practice-Manager/  # Practice management (ports 3000, 3001)
│   └── M-Customs-Manager/   # Customs management (ports 5173, 3100)
└── .kiro/                   # AI assistant configuration
```

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm 10.28.2
- PostgreSQL (for Practice Manager)

### Installation

```bash
# Install dependencies
pnpm install

# Start all services
pnpm suite
```

### Individual Services

```bash
pnpm portal          # Portal on :4000
pnpm practice        # Practice web on :3000
pnpm practice-api    # Practice API on :3001
pnpm customs         # Customs UI on :5173
pnpm customs-backend # Customs backend on :3100
```

## Port Allocation

- **4000** - M-Suite Portal
- **3000** - Practice Manager Web UI
- **3001** - Practice Manager API
- **5173** - Customs Manager Web UI
- **3100** - Customs Manager Backend API

## Technology Stack

### Portal
- Next.js 16.1.6 (App Router)
- React 19.2.3
- TypeScript 5
- Tailwind CSS 4

### Practice Manager
- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: NestJS, Prisma, PostgreSQL
- **Features**: Client CRM, Companies House integration, tax calculations

### Customs Manager
- **Frontend**: Vite, React
- **Backend**: Express, SQLite
- **Features**: Duty repayment automation, VAT compliance

## Development

### Build Commands

```bash
# Build all apps
pnpm build

# Build specific app
pnpm -C apps/portal build
pnpm -C external/M-Practice-Manager/apps/api build
```

### Database Migrations

```bash
# Practice Manager API
cd external/M-Practice-Manager/apps/api
npm run prisma:migrate
npm run prisma:generate
```

## Recent Updates

### Client Data Consolidation (Feb 2026)
- Removed ClientProfile table
- Consolidated 80+ fields into Client model
- Updated DTOs and interfaces
- All client data now in single unified model

## Project Structure

- **Monorepo**: Turborepo for task orchestration
- **Submodules**: External apps managed as git submodules
- **Package Manager**: pnpm with workspace support

## Documentation

- `.kiro/steering/` - AI assistant guidance and project conventions
- `apps/portal/` - Portal application documentation
- `external/M-Practice-Manager/` - Practice Manager documentation
- `external/M-Customs-Manager/` - Customs Manager documentation

## License

Proprietary - All rights reserved
