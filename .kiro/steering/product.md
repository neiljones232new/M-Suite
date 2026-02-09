# Product Overview

M-Suite is a unified launcher and management portal for multiple business applications serving professional services firms.

## Core Applications

**Practice Manager** - Client management and compliance platform for professional services
- Web UI on port 3000
- API service on port 3001

**Customs Manager** - Duty and VAT repayment automation suite for customs compliance
- Web UI on port 5173  
- Backend API on port 3100

## Portal Functionality

The portal (port 4000) provides:
- Centralized application launcher with status monitoring
- LaunchAgent control for starting/stopping/restarting services
- Real-time health checks for all services
- Unified branding and navigation

## Architecture

Monorepo structure with:
- Portal app (Next.js) in `apps/portal`
- External submodules in `external/` for Practice and Customs managers
- Each application runs independently but is orchestrated through the portal
