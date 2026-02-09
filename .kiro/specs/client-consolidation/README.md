# Client Data Consolidation Spec

## Overview

This specification outlines the consolidation of the `Client` and `ClientProfile` tables into a single `Client` table, eliminating data duplication and creating a single source of truth for all client information.

## Problem

Currently, client data is split across two tables:
- **Client**: Core identity, tax registration, and basic info
- **ClientProfile**: Extended profile, operational data, and metadata

This causes:
- **Data duplication**: Fields like `vatNumber`, `payeReference`, `cisUtr` exist in both tables
- **Ambiguity**: No clear source of truth when values differ
- **Complexity**: Every query requires a JOIN
- **Maintenance burden**: Updates must be synchronized

## Solution

Merge all ClientProfile fields into the Client table, making it the single source of truth.

## Benefits

1. **Single source of truth** - No ambiguity about where data lives
2. **Simpler queries** - No JOINs needed
3. **Better performance** - 20-30% faster queries expected
4. **Easier maintenance** - One table to update
5. **Type safety** - Simpler TypeScript interfaces

## Documents

- **[requirements.md](./requirements.md)** - Detailed requirements, scope, and success criteria
- **[design.md](./design.md)** - Technical design, schema changes, and migration strategy
- **[tasks.md](./tasks.md)** - Implementation tasks broken down by phase

## Quick Start

### 1. Run Data Audit

Before starting, audit the current data to identify conflicts:

```bash
cd external/M-Practice-Manager
pnpm ts-node -P tsconfig.scripts.json scripts/audit-client-profile-data.ts
```

This will:
- Count clients with/without profiles
- Identify conflicts in duplicated fields
- Generate a conflict resolution report
- Export results to `reports/` directory

### 2. Review Conflicts

If conflicts are found, review the generated CSV report and decide on resolution strategy.

### 3. Follow Implementation Tasks

Work through the tasks in [tasks.md](./tasks.md) in order:
1. Phase 1: Pre-Migration Analysis
2. Phase 2: Schema Design & Migration
3. Phase 3: Update TypeScript Interfaces
4. Phase 4: Update Backend Services
5. Phase 5: Update Frontend
6. Phase 6: Testing
7. Phase 7: Documentation
8. Phase 8: Deployment

## Key Decisions

### Field Conflict Resolution

When both Client and ClientProfile have the same field with different values:
- **Priority**: ClientProfile value takes precedence (assumed more recent)
- **Logging**: All conflicts are logged for manual review
- **Validation**: Migration script validates data integrity

### Backward Compatibility

**Option A** (Recommended): Maintain API response structure
```typescript
// API still returns { node, profile, computed }
return {
  node: client,
  profile: extractProfileFields(client),
  computed: computeFlags(client)
};
```

**Option B**: Flatten response (requires API versioning)
```typescript
// API returns flat client object
return client;
```

### Migration Strategy

1. **Add fields** to Client table (nullable)
2. **Copy data** from ClientProfile to Client
3. **Resolve conflicts** using priority rules
4. **Validate** data integrity
5. **Drop** ClientProfile table
6. **Update** code to use consolidated Client

## Timeline

**Estimated**: 8 days (60 hours)

- Analysis & Audit: 0.5 days
- Schema & Migration: 1.5 days
- Backend Updates: 2 days
- Frontend Updates: 2 days
- Testing: 2 days
- Documentation: 0.5 days
- Deployment: 0.5 days

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Data loss | Comprehensive backup, dry-run testing, rollback script |
| Breaking changes | Maintain response structure, version API if needed |
| Performance issues | Benchmark before/after, optimize indexes |
| Missed references | Comprehensive grep search, TypeScript checks |

## Success Criteria

- ✅ Zero data loss during migration
- ✅ All tests passing
- ✅ 20%+ performance improvement
- ✅ Single source of truth established
- ✅ No production incidents
- ✅ Clean TypeScript compilation

## Rollback Plan

If issues arise:
1. Restore ClientProfile table from backup
2. Revert code changes
3. Restore previous Prisma schema
4. Regenerate Prisma client
5. Redeploy previous version

## Next Steps

1. **Review this spec** with the team
2. **Run the audit script** to understand current data state
3. **Resolve any conflicts** found in the audit
4. **Begin Phase 1** tasks from tasks.md
5. **Test thoroughly** at each phase
6. **Deploy with caution** and monitor closely

## Questions?

Contact the backend team or review the detailed design document.
