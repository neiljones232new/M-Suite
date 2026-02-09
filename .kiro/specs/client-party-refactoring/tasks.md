# Implementation Plan: Client-Party Relationship Refactoring

## Overview

This implementation plan refactors the Practice Manager's client-party relationship model to store directors as individual clients rather than in a separate Person table. The implementation follows a phased approach: schema changes, migration script, import service updates, API updates, and testing.

## Tasks

- [x] 1. Update Prisma schema and generate migration
  - Add `relatedClientId` field to ClientParty model
  - Add relation to Client model for director parties
  - Make `personId` field optional (for backward compatibility)
  - Add index on `relatedClientId` for query performance
  - Generate Prisma migration file
  - _Requirements: 2.1, 8.1, 8.2_

- [ ] 2. Create migration service for Person to Client conversion
  - [x] 2.1 Implement ClientPartyMigrationService class
    - Create service with backup, migrate, validate, and rollback methods
    - Implement table backup functionality (export to JSON)
    - _Requirements: 4.1, 4.6_
  
  - [ ]* 2.2 Write property test for migration ID generation
    - **Property 11: Migration ID Generation Consistency**
    - **Validates: Requirements 4.2**
  
  - [x] 2.3 Implement person-to-client migration logic
    - For each Person, find associated ClientParty records
    - Determine primary company (first by appointedAt or alphabetically)
    - Generate client ID using pattern {companyId}{letter}
    - Create Individual Client with person's data (name, email, phone)
    - Update all ClientParty records with new relatedClientId
    - _Requirements: 4.2, 4.3_
  
  - [ ]* 2.4 Write property test for party reference updates
    - **Property 12: Migration Updates Party References**
    - **Validates: Requirements 4.3, 4.5**
  
  - [ ]* 2.5 Write property test for relationship preservation
    - **Property 13: Migration Preserves Relationships (Round Trip)**
    - **Validates: Requirements 4.4**
  
  - [x] 2.6 Implement migration validation
    - Verify all ClientParty records have valid relatedClientId
    - Check for orphaned records
    - Generate validation report with statistics
    - _Requirements: 4.5_
  
  - [x] 2.7 Implement rollback functionality
    - Restore Person and ClientParty tables from backup
    - Verify restoration success
    - _Requirements: 4.6_
  
  - [ ]* 2.8 Write unit tests for migration edge cases
    - Test person with no company association
    - Test person with multiple companies
    - Test duplicate person names
    - Test ID collision handling

- [~] 3. Checkpoint - Ensure migration service tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Update Companies House import service
  - [x] 4.1 Modify importCompanyOfficers method
    - Remove Person table creation logic
    - Implement director name matching to find existing Individual_Client
    - Generate director client ID using {companyId}{letter} pattern
    - Create Individual_Client records with type INDIVIDUAL
    - Create ClientParty records with relatedClientId
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ]* 4.2 Write property test for director client creation
    - **Property 1: Director Client Creation Completeness**
    - **Validates: Requirements 1.1, 1.3, 1.4**
  
  - [ ]* 4.3 Write property test for ID generation pattern
    - **Property 2: Director ID Generation Pattern**
    - **Validates: Requirements 1.2**
  
  - [ ]* 4.4 Write property test for Person table immutability
    - **Property 3: Person Table Immutability Post-Refactoring**
    - **Validates: Requirements 1.5**
  
  - [ ]* 4.5 Write property test for batch entity creation
    - **Property 7: Companies House Import Creates All Entities**
    - **Validates: Requirements 3.1, 3.2**
  
  - [ ]* 4.6 Write property test for sequential suffix generation
    - **Property 8: Sequential Suffix Generation**
    - **Validates: Requirements 3.3**
  
  - [ ]* 4.7 Write property test for batch relationship creation
    - **Property 9: Batch Director Import Creates Relationships**
    - **Validates: Requirements 3.2, 3.4, 3.5**
  
  - [ ]* 4.8 Write property test for director deduplication
    - **Property 10: Director Deduplication on Import**
    - **Validates: Requirements 3.6**
  
  - [ ]* 4.9 Write unit tests for import error handling
    - Test Companies House API failure
    - Test invalid officer data (missing name)
    - Test director already linked
    - Test 26+ directors (suffix overflow)

- [ ] 5. Create ClientPartyService for relationship management
  - [x] 5.1 Implement ClientPartyService class
    - Create service with CRUD methods for party relationships
    - Implement createPartyRelationship method
    - Implement removePartyRelationship method
    - Implement updatePartyRelationship method
    - Implement getClientParties method
    - Implement generatePartyRef method
    - _Requirements: 2.1, 2.2, 2.3, 5.4, 7.3, 7.4, 7.5_
  
  - [ ]* 5.2 Write property test for party record completeness
    - **Property 4: Party Record Completeness**
    - **Validates: Requirements 2.1, 2.2, 2.3**
  
  - [ ]* 5.3 Write property test for many-to-many relationships
    - **Property 5: Many-to-Many Director Relationships**
    - **Validates: Requirements 2.4, 5.1**
  
  - [ ]* 5.4 Write property test for multi-company linking
    - **Property 14: Director Can Link to Multiple Companies**
    - **Validates: Requirements 5.4, 7.3**
  
  - [ ]* 5.5 Write property test for relationship independence
    - **Property 15: Relationship Independence**
    - **Validates: Requirements 5.5**
  
  - [ ]* 5.6 Write property test for atomic creation and linking
    - **Property 18: Atomic Director Creation and Linking**
    - **Validates: Requirements 7.4**
  
  - [ ]* 5.7 Write property test for unlinking preserves client
    - **Property 19: Unlinking Preserves Director Client**
    - **Validates: Requirements 7.5**

- [~] 6. Checkpoint - Ensure relationship management tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Update ClientsService for director operations
  - [x] 7.1 Add director-specific methods to ClientsService
    - Implement generateDirectorClientId method
    - Implement findDirectorByName method
    - Implement getDirectorCompanies method
    - Implement getCompanyDirectors method
    - Implement linkDirectorToCompany method
    - _Requirements: 2.5, 2.6, 5.4, 6.2, 6.3, 6.4, 6.5_
  
  - [ ]* 7.2 Write property test for bidirectional queries
    - **Property 6: Bidirectional Relationship Queries**
    - **Validates: Requirements 2.5, 2.6**
  
  - [ ]* 7.3 Write property test for director capabilities
    - **Property 16: Director Client Capabilities**
    - **Validates: Requirements 6.2, 6.3, 6.4**
  
  - [ ]* 7.4 Write property test for search includes all types
    - **Property 17: Search Includes All Client Types**
    - **Validates: Requirements 6.5**

- [ ] 8. Add validation and constraints
  - [x] 8.1 Implement referential integrity validation
    - Add validation for clientId references COMPANY type
    - Add validation for relatedClientId references INDIVIDUAL type
    - Add database foreign key constraints
    - _Requirements: 8.1, 8.2_
  
  - [x] 8.2 Implement cascade protection
    - Add check for active relationships before client deletion
    - Implement cascade delete or prevent deletion logic
    - _Requirements: 8.3_
  
  - [x] 8.3 Implement party reference uniqueness validation
    - Add unique constraint on (clientId, partyRef)
    - Add validation in service layer
    - _Requirements: 8.4_
  
  - [x] 8.4 Implement party role validation
    - Create enum for valid party roles
    - Add validation in DTOs and service layer
    - _Requirements: 8.5_
  
  - [ ]* 8.5 Write property test for referential integrity
    - **Property 20: Referential Integrity for Party Relationships**
    - **Validates: Requirements 8.1, 8.2**
  
  - [ ]* 8.6 Write property test for cascade protection
    - **Property 21: Cascade Protection for Directors**
    - **Validates: Requirements 8.3**
  
  - [ ]* 8.7 Write property test for party reference uniqueness
    - **Property 22: Party Reference Uniqueness Per Company**
    - **Validates: Requirements 8.4**
  
  - [ ]* 8.8 Write property test for role validation
    - **Property 23: Party Role Validation**
    - **Validates: Requirements 8.5**

- [ ] 9. Update API endpoints and DTOs
  - [x] 9.1 Create DTOs for client party operations
    - CreatePartyDto (companyId, directorId, role, appointedAt)
    - UpdatePartyDto (role, appointedAt, resignedAt, ownershipPercent)
    - CreateDirectorAndLinkDto (name, email, phone, companyId, role)
    - _Requirements: 7.3, 7.4, 7.5_
  
  - [x] 9.2 Add API endpoints to ClientPartyController
    - POST /client-parties (create relationship)
    - DELETE /client-parties/:id (remove relationship)
    - PATCH /client-parties/:id (update relationship)
    - GET /clients/:id/parties (get all parties for client)
    - POST /client-parties/create-and-link (atomic create + link)
    - _Requirements: 5.4, 7.3, 7.4, 7.5_
  
  - [x] 9.3 Update ClientsController endpoints
    - GET /clients/:id/directors (get company directors)
    - GET /clients/:id/companies (get director companies)
    - _Requirements: 2.5, 2.6_
  
  - [ ]* 9.4 Write integration tests for API endpoints
    - Test create party relationship endpoint
    - Test remove party relationship endpoint
    - Test atomic create and link endpoint
    - Test get directors for company endpoint
    - Test get companies for director endpoint

- [ ] 10. Deprecate PeopleService and update references
  - [x] 10.1 Mark PeopleService as deprecated
    - Add @deprecated JSDoc comments
    - Add console warnings when methods are called
    - Update documentation to point to ClientsService
    - _Requirements: 1.5_
  
  - [x] 10.2 Update existing code to use ClientsService
    - Find all references to PeopleService
    - Replace with ClientsService calls
    - Update imports and dependencies
    - _Requirements: 1.5_

- [ ] 11. Create migration CLI command
  - [x] 11.1 Implement migration CLI command
    - Create NestJS command using nest-commander
    - Add options for dry-run, backup, and rollback
    - Implement progress reporting
    - Add confirmation prompts
    - _Requirements: 4.1, 4.6_
  
  - [ ]* 11.2 Write unit tests for CLI command
    - Test dry-run mode
    - Test backup creation
    - Test rollback functionality
    - Test error handling

- [ ] 12. Update database seed data and fixtures
  - [x] 12.1 Update test fixtures
    - Create Individual_Client fixtures for directors
    - Update ClientParty fixtures to use relatedClientId
    - Remove Person fixtures from new tests
    - _Requirements: 1.1, 2.1_
  
  - [x] 12.2 Update seed scripts
    - Modify seed-templates.ts to create directors as clients
    - Update any hardcoded Person references
    - _Requirements: 1.1_

- [~] 13. Final checkpoint - Run full test suite
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Update documentation
  - [x] 14.1 Update API documentation
    - Document new ClientParty endpoints
    - Document deprecated People endpoints
    - Add examples for director operations
    - _Requirements: 7.3, 7.4, 7.5_
  
  - [x] 14.2 Create migration guide
    - Document migration process
    - Document rollback procedure
    - Add troubleshooting section
    - _Requirements: 4.1, 4.6_
  
  - [x] 14.3 Update developer documentation
    - Document new data model
    - Update architecture diagrams
    - Add code examples for common operations
    - _Requirements: 1.1, 2.1_

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check library
- Unit tests validate specific examples and edge cases
- Migration should be run in a maintenance window with database backup
- Consider feature flag for gradual rollout of new director management UI
