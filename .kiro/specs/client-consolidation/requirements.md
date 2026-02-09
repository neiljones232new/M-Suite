# Client Data Consolidation - Requirements

## Problem Statement

The Practice Manager currently splits client data across two tables:
- `Client` - Core identity and tax registration data
- `ClientProfile` - Extended profile and operational data

This creates:
1. **Data duplication** - Tax fields (VAT, UTR, PAYE, CIS) exist in both tables
2. **Ambiguity** - No clear source of truth for duplicated fields
3. **Complexity** - ClientContext DTO merges both sources with fallback logic
4. **Maintenance burden** - Updates must be synchronized across tables
5. **Query overhead** - Always need joins to get complete client data

## Goal

Consolidate all client data into a **single Client table** with no duplication, making it the sole source of truth for all client information.

## Success Criteria

1. ✅ All client data exists in one table only
2. ✅ No field duplication between tables
3. ✅ Zero data loss during migration
4. ✅ All existing queries continue to work
5. ✅ Web app displays data correctly
6. ✅ API responses maintain backward compatibility
7. ✅ Performance is maintained or improved (fewer joins)

## Scope

### In Scope
- Merge ClientProfile fields into Client table
- Remove ClientProfile table entirely
- Update all services, controllers, and DTOs
- Update Prisma schema
- Create migration script with rollback capability
- Update web app queries
- Update API documentation

### Out of Scope
- Changes to ClientParty relationships (separate spec)
- Changes to Person table structure (separate spec)
- UI/UX redesign
- New features

## Constraints

1. **Zero downtime** - Migration must be reversible
2. **Data integrity** - No data loss permitted
3. **Backward compatibility** - API should maintain existing response structure during transition
4. **Type safety** - All TypeScript types must be updated

## Stakeholders

- Backend developers (API changes)
- Frontend developers (query updates)
- Database administrators (migration execution)
- QA team (testing)

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss during migration | HIGH | Comprehensive backup, dry-run testing, rollback script |
| Breaking API changes | HIGH | Maintain response structure, version API if needed |
| Performance degradation | MEDIUM | Benchmark before/after, optimize indexes |
| Missed field references | MEDIUM | Comprehensive grep search, TypeScript compilation checks |
| Conflicting data in duplicated fields | HIGH | Pre-migration audit, conflict resolution strategy |

## Dependencies

- Prisma ORM (schema changes)
- PostgreSQL/SQLite (database migration)
- NestJS services (code updates)
- Next.js web app (query updates)

## Timeline Estimate

- Analysis & Planning: 1 day
- Schema design: 0.5 day
- Migration script development: 1 day
- Service layer updates: 2 days
- API updates: 1 day
- Web app updates: 1 day
- Testing: 2 days
- Documentation: 0.5 day

**Total: ~9 days**

## Non-Functional Requirements

1. **Performance**: Queries should be faster (no joins needed)
2. **Maintainability**: Single source of truth simplifies code
3. **Scalability**: Fewer tables = simpler schema
4. **Testability**: Easier to mock and test single entity
