# Client Data Consolidation - Implementation Tasks

## Phase 1: Pre-Migration Analysis & Audit

### Task 1.1: Data Audit Script
**Priority**: HIGH  
**Estimate**: 2 hours

Create script to analyze current data:
- [ ] Count clients with profiles vs without
- [ ] Identify conflicts in duplicated fields (vatNumber, payeReference, etc.)
- [ ] Generate conflict resolution report
- [ ] Identify orphaned profiles (profile without client)
- [ ] Check for NULL values in critical fields
- [ ] Export audit report to CSV

**Files**: `scripts/audit-client-profile-data.ts`

### Task 1.2: Backup Strategy
**Priority**: HIGH  
**Estimate**: 1 hour

- [ ] Document backup procedure
- [ ] Create pre-migration backup script
- [ ] Test restore procedure
- [ ] Document rollback steps

**Files**: `scripts/backup-client-data.ts`, `docs/rollback-procedure.md`

### Task 1.3: Conflict Resolution Rules
**Priority**: HIGH  
**Estimate**: 1 hour

- [ ] Define priority rules for duplicated fields
- [ ] Create conflict resolution logic
- [ ] Document manual review process for edge cases

**Files**: `scripts/resolve-conflicts.ts`

---

## Phase 2: Schema Design & Migration

### Task 2.1: Update Prisma Schema
**Priority**: HIGH  
**Estimate**: 3 hours

- [ ] Add all ClientProfile fields to Client model
- [ ] Mark fields as nullable initially (for safe migration)
- [ ] Remove ClientProfile model
- [ ] Update enums if needed
- [ ] Add appropriate indexes
- [ ] Document field mappings in comments

**Files**: `apps/api/prisma/schema.prisma`

### Task 2.2: Create Migration SQL
**Priority**: HIGH  
**Estimate**: 4 hours

- [ ] Write SQL to add new columns to clients table
- [ ] Write SQL to copy data from client_profiles to clients
- [ ] Write SQL to resolve conflicts (using priority rules)
- [ ] Write SQL to validate data integrity
- [ ] Write SQL to drop client_profiles table
- [ ] Write SQL for rollback (reverse migration)
- [ ] Test migration on copy of production data

**Files**: `apps/api/prisma/migrations/YYYYMMDD_consolidate_client_profile/migration.sql`

### Task 2.3: Data Migration Script
**Priority**: HIGH  
**Estimate**: 4 hours

- [ ] Create TypeScript migration script
- [ ] Implement conflict resolution logic
- [ ] Add progress logging
- [ ] Add dry-run mode
- [ ] Add validation checks
- [ ] Test on development database
- [ ] Test on staging database

**Files**: `scripts/migrate-client-profile-to-client.ts`

---

## Phase 3: Update TypeScript Interfaces & DTOs ✅

### Task 3.1: Update Client Interface ✅
**Priority**: HIGH  
**Estimate**: 2 hours  
**Status**: COMPLETE

- [x] Add all profile fields to Client interface
- [x] Remove ClientProfile interface
- [x] Update CreateClientDto to include all fields
- [x] Update UpdateClientDto to include all fields
- [x] Remove CreateClientProfileDto
- [x] Remove UpdateClientProfileDto
- [x] Ensure type safety

**Files**: `apps/api/src/modules/clients/interfaces/client.interface.ts`

### Task 3.2: Simplify ClientContext DTO ✅
**Priority**: MEDIUM  
**Estimate**: 2 hours  
**Status**: COMPLETE

**Approach**: Option B - Simplified for backward compatibility
- [x] Keep ClientContext structure
- [x] Simplify buildClientContext to work directly with Client
- [x] Remove profile merging logic
- [x] Remove ClientProfileSubset interface
- [x] Updated function signature: `buildClientContext(client: Client): ClientContext`

**Files**: `apps/api/src/modules/clients/dto/client-context.dto.ts`

### Task 3.3: Update Web Types
**Priority**: MEDIUM  
**Estimate**: 1 hour

- [ ] Update ClientContext type in web app
- [ ] Update any profile-specific types
- [ ] Ensure type compatibility

**Files**: `apps/web/src/lib/types.ts`

---

## Phase 4: Update Backend Services ✅

### Task 4.1: Update ClientsService ✅
**Priority**: HIGH  
**Estimate**: 4 hours  
**Status**: COMPLETE

- [x] Remove getProfile() method
- [x] Remove createProfile() method
- [x] Remove updateProfile() method
- [x] Update findAllContexts() - removed clientProfile include, simplified buildClientContext call
- [x] Update getContextWithParties() - removed profile query, simplified buildClientContext call
- [x] Remove profile-related imports

**Files**: `apps/api/src/modules/clients/clients.service.ts`

### Task 4.2: Update ClientsController ✅
**Priority**: HIGH  
**Estimate**: 2 hours  
**Status**: COMPLETE

- [x] Remove GET /clients/:id/profile endpoint
- [x] Remove POST /clients/:id/profile endpoint
- [x] Remove PUT /clients/:id/profile endpoint
- [x] Remove profile-related imports (CreateClientProfileDto, UpdateClientProfileDto)
- [x] Swagger documentation automatically updated

**Files**: `apps/api/src/modules/clients/clients.controller.ts`

### Task 4.3: Update Related Services ✅
**Priority**: MEDIUM  
**Estimate**: 3 hours  
**Status**: COMPLETE

Services that referenced client profiles:
- [x] Update PrismaDatabaseService.getClientByNumber() - removed clientProfile include, read directly from client
- [x] Update PrismaDatabaseService.addClient() - removed nested clientProfile.create, moved all fields to client level

**Files**: `apps/api/src/modules/database/prisma-database.service.ts`

---

## Phase 5: Update Frontend ✅

### Task 5.1: Update API Client
**Priority**: HIGH  
**Estimate**: 2 hours  
**Status**: NOT NEEDED

- [x] No separate API client file exists - API calls are inline
- [x] Profile endpoints already removed from backend

**Files**: N/A

### Task 5.2: Update Client Edit Page ✅
**Priority**: HIGH  
**Estimate**: 3 hours  
**Status**: COMPLETE

- [x] Updated to use `context.client` instead of `context.node` and `context.profile`
- [x] Removed separate profile API call (`PUT /clients/:id/profile`)
- [x] Merged all fields into single update payload
- [x] Simplified form initialization to read directly from client
- [x] Updated all references throughout the component

**Files**: `apps/web/src/app/clients/[id]/edit/page.tsx`

### Task 5.3: Update Client Parties Page ✅
**Priority**: HIGH  
**Estimate**: 1 hour  
**Status**: COMPLETE

- [x] Updated to use `context.client` instead of `context.node`
- [x] Updated client name and ID display

**Files**: `apps/web/src/app/clients/[id]/parties/page.tsx`

### Task 5.4: Update Client Forms
**Priority**: HIGH  
**Estimate**: 3 hours

- [ ] Update new client wizard
- [ ] Merge profile fields into main form
- [ ] Update validation rules
- [ ] Test form submission

**Files**: `apps/web/src/app/clients/new/wizard/page.tsx`

### Task 5.5: Update Other Client References
**Priority**: MEDIUM  
**Estimate**: 2 hours

- [ ] Update Companies House sync page
- [ ] Update client summary page
- [ ] Update any client-related components
- [ ] Search for all remaining context.node/context.profile references

**Files**: Multiple component files

---

## Phase 6: Testing

### Task 6.1: Unit Tests
**Priority**: HIGH  
**Estimate**: 4 hours

- [ ] Update ClientsService tests
- [ ] Update ClientsController tests
- [ ] Add tests for migration script
- [ ] Test conflict resolution logic
- [ ] Test data validation

**Files**: `apps/api/src/modules/clients/*.spec.ts`

### Task 6.2: Integration Tests
**Priority**: HIGH  
**Estimate**: 3 hours

- [ ] Test GET /clients endpoint
- [ ] Test GET /clients/:id endpoint
- [ ] Test POST /clients endpoint
- [ ] Test PUT /clients/:id endpoint
- [ ] Test DELETE /clients/:id endpoint
- [ ] Test with-parties endpoint
- [ ] Verify response structure

**Files**: `apps/api/test/clients.e2e-spec.ts`

### Task 6.3: Frontend Tests
**Priority**: MEDIUM  
**Estimate**: 2 hours

- [ ] Test client list rendering
- [ ] Test client detail rendering
- [ ] Test client creation
- [ ] Test client editing
- [ ] Test filters and sorting

**Files**: `apps/web/src/app/clients/__tests__/`

### Task 6.4: Migration Testing
**Priority**: HIGH  
**Estimate**: 3 hours

- [ ] Test migration on development database
- [ ] Test migration on staging database
- [ ] Verify no data loss
- [ ] Verify conflict resolution
- [ ] Test rollback procedure
- [ ] Performance benchmarks

---

## Phase 7: Documentation

### Task 7.1: API Documentation
**Priority**: MEDIUM  
**Estimate**: 2 hours

- [ ] Update Swagger/OpenAPI specs
- [ ] Document removed endpoints
- [ ] Document changed request/response formats
- [ ] Add migration guide for API consumers

**Files**: `docs/api-changes.md`

### Task 7.2: Developer Documentation
**Priority**: MEDIUM  
**Estimate**: 2 hours

- [ ] Document schema changes
- [ ] Document migration procedure
- [ ] Document rollback procedure
- [ ] Update architecture diagrams
- [ ] Add troubleshooting guide

**Files**: `docs/client-consolidation.md`

### Task 7.3: Update README
**Priority**: LOW  
**Estimate**: 30 minutes

- [ ] Update data model description
- [ ] Update setup instructions if needed
- [ ] Note breaking changes

**Files**: `README.md`

---

## Phase 8: Deployment

### Task 8.1: Pre-Deployment Checklist
**Priority**: HIGH  
**Estimate**: 1 hour

- [ ] All tests passing
- [ ] Code review completed
- [ ] Migration script tested on staging
- [ ] Backup procedure documented
- [ ] Rollback procedure documented
- [ ] Monitoring alerts configured

### Task 8.2: Deployment Execution
**Priority**: HIGH  
**Estimate**: 2 hours

- [ ] Create database backup
- [ ] Run migration script
- [ ] Validate data integrity
- [ ] Deploy new code
- [ ] Run smoke tests
- [ ] Monitor for errors

### Task 8.3: Post-Deployment Validation
**Priority**: HIGH  
**Estimate**: 1 hour

- [ ] Verify all clients visible in UI
- [ ] Test create/update/delete operations
- [ ] Check API response times
- [ ] Review error logs
- [ ] Verify no data loss

---

## Summary

**Total Estimated Time**: ~60 hours (~7.5 days)

### Critical Path
1. Data audit (Task 1.1)
2. Schema migration (Task 2.1, 2.2, 2.3)
3. Service updates (Task 4.1, 4.2)
4. Frontend updates (Task 5.1, 5.2, 5.3)
5. Testing (Task 6.1, 6.2, 6.4)
6. Deployment (Task 8.1, 8.2, 8.3)

### Risk Mitigation
- Comprehensive testing at each phase
- Dry-run migrations before production
- Rollback plan ready
- Incremental deployment with feature flags (optional)

### Success Metrics
- Zero data loss
- All tests passing
- API response time improved by 20%+
- No production incidents
- Clean TypeScript compilation
