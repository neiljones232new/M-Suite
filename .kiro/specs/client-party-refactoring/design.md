# Design Document: Client-Party Relationship Refactoring

## Overview

This design refactors the Practice Manager's client-party relationship model to simplify director management by storing directors as individual clients rather than in a separate Person table. This change enables directors to have full client capabilities (services, tasks, documents) and supports many-to-many relationships between directors and companies.

### Current Architecture Problems

1. **Separate Person Table**: Directors stored in `people` table with CUID ids, separate from `clients` table
2. **Limited Functionality**: Directors cannot have services, tasks, or other client features
3. **Complex Relationships**: `client_parties` table uses `personId` foreign key, creating tight coupling
4. **No Multi-Company Support**: Difficult to link one director to multiple companies

### Proposed Architecture Benefits

1. **Unified Client Model**: Directors are clients with type INDIVIDUAL
2. **Full Client Features**: Directors can have services, tasks, documents, etc.
3. **Pure Many-to-Many**: `client_parties` becomes a simple linking table
4. **Multi-Company Support**: One director client can link to multiple company clients
5. **Consistent ID Scheme**: Director IDs follow pattern `{companyCode}{letter}` (e.g., `4P001A`)

## Architecture

### Data Model Changes

#### Client Table (Modified)
- **No schema changes needed** - already supports type INDIVIDUAL
- Directors will use type: `INDIVIDUAL`
- Director IDs will follow pattern: `{companyCode}{letter}` (e.g., `4P001A`, `4P001B`)

#### ClientParty Table (Modified)
```prisma
model ClientParty {
  id               String    @id @default(cuid())
  clientId         String    // Company client ID (e.g., "4P001")
  relatedClientId  String?   // NEW: Director client ID (e.g., "4P001A")
  personId         String?   // DEPRECATED: Keep for migration, make optional
  primaryContact   Boolean   @default(false)
  suffixLetter     String?
  ownershipPercent Float?
  appointedAt      DateTime?
  resignedAt       DateTime?
  role             String?   // DIRECTOR, SHAREHOLDER, etc.
  partyRef         String?   // e.g., "4P001A"
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  client          Client    @relation("CompanyParties", fields: [clientId], references: [id], onDelete: Cascade)
  relatedClient   Client?   @relation("DirectorParties", fields: [relatedClientId], references: [id])
  person          Person?   @relation(fields: [personId], references: [id]) // DEPRECATED
}
```

#### Person Table (Deprecated)
- Keep table for backward compatibility during migration
- No new records will be created
- Existing records will be migrated to Client table

### ID Generation Strategy

**Company Clients**: Existing pattern (e.g., `4P001`)
- Portfolio code (1 digit) + P + sequential number (3 digits)

**Director Clients**: New pattern (e.g., `4P001A`)
- Company client ID + alphabetic suffix (A-Z)
- First director of 4P001 → `4P001A`
- Second director of 4P001 → `4P001B`
- If director serves multiple companies, they keep their original ID

**Multi-Company Directors**:
- Director `4P001A` can be linked to both `4P001` and `4P002`
- Two `client_parties` records:
  - Record 1: clientId=`4P001`, relatedClientId=`4P001A`, partyRef=`4P001A`
  - Record 2: clientId=`4P002`, relatedClientId=`4P001A`, partyRef=`4P002X`
    - Note: partyRef for second company gets a new suffix for that company's context

## Components and Interfaces

### 1. Database Migration Service

**Purpose**: Migrate existing Person records to Individual Client records

**Key Methods**:
```typescript
class ClientPartyMigrationService {
  // Backup existing data
  async backupTables(): Promise<void>
  
  // Migrate person records to individual clients
  async migratePersonsToClients(): Promise<MigrationResult>
  
  // Update client_parties to use relatedClientId
  async updateClientPartyReferences(): Promise<void>
  
  // Validate migration results
  async validateMigration(): Promise<ValidationReport>
  
  // Rollback if needed
  async rollback(): Promise<void>
}
```

**Migration Algorithm**:
1. Create backup of `people` and `client_parties` tables
2. For each Person record:
   - Find associated ClientParty records
   - Determine primary company (first alphabetically or by appointedAt)
   - Generate client ID: `{primaryCompanyId}{suffixLetter}`
   - Create Individual Client with person's data
   - Update all ClientParty records to use new relatedClientId
3. Validate all relationships are preserved
4. Keep Person table for rollback capability

### 2. Companies House Import Service (Modified)

**Purpose**: Import directors as individual clients during company import

**Modified Method**:
```typescript
class CompaniesHouseService {
  private async importCompanyOfficers(
    clientId: string,
    companyNumber: string,
    options?: {
      createOfficerClients?: boolean;
      portfolioCode?: number;
      selectedOfficerNames?: string[];
    }
  ): Promise<void> {
    // For each officer:
    // 1. Check if director client already exists (by name matching)
    // 2. If exists, reuse existing client ID
    // 3. If new, generate ID: {companyId}{nextLetter}
    // 4. Create Individual Client record
    // 5. Create ClientParty linking record
  }
}
```

**Director Matching Logic**:
- Check for existing Individual Client by full name (case-insensitive)
- If found, reuse that client ID
- If not found, create new Individual Client with generated ID

### 3. Client Service (Modified)

**Purpose**: Handle client operations for both companies and individuals

**New Methods**:
```typescript
class ClientsService {
  // Generate director client ID
  async generateDirectorClientId(companyId: string): Promise<string>
  
  // Find director by name
  async findDirectorByName(name: string): Promise<Client | null>
  
  // Get all companies for a director
  async getDirectorCompanies(directorId: string): Promise<Client[]>
  
  // Get all directors for a company
  async getCompanyDirectors(companyId: string): Promise<Client[]>
  
  // Link existing director to company
  async linkDirectorToCompany(
    directorId: string,
    companyId: string,
    role: string
  ): Promise<ClientParty>
}
```

### 4. Client Party Service (New)

**Purpose**: Manage relationships between companies and directors

**Key Methods**:
```typescript
class ClientPartyService {
  // Create party relationship
  async createPartyRelationship(
    companyId: string,
    directorId: string,
    data: CreatePartyDto
  ): Promise<ClientParty>
  
  // Remove party relationship
  async removePartyRelationship(partyId: string): Promise<void>
  
  // Update party relationship
  async updatePartyRelationship(
    partyId: string,
    data: UpdatePartyDto
  ): Promise<ClientParty>
  
  // Get all parties for a client
  async getClientParties(clientId: string): Promise<ClientParty[]>
  
  // Generate next party reference
  async generatePartyRef(companyId: string): Promise<string>
}
```

### 5. People Service (Deprecated)

**Purpose**: Maintain backward compatibility during transition

**Status**: Mark as deprecated, redirect to ClientsService
- All person operations should use ClientsService instead
- Keep for API compatibility during migration period

## Data Models

### Client Model (Existing, No Changes)
```typescript
interface Client {
  id: string;                    // "4P001" or "4P001A"
  name: string;
  type: ClientType;              // COMPANY or INDIVIDUAL
  status: ClientStatus;
  mainEmail: string | null;
  mainPhone: string | null;
  portfolioCode: number;
  // ... other fields
}
```

### ClientParty Model (Modified)
```typescript
interface ClientParty {
  id: string;
  clientId: string;              // Company client ID
  relatedClientId: string | null; // NEW: Director client ID
  personId: string | null;       // DEPRECATED
  role: string | null;           // DIRECTOR, SHAREHOLDER, etc.
  partyRef: string | null;       // e.g., "4P001A"
  suffixLetter: string | null;
  appointedAt: DateTime | null;
  resignedAt: DateTime | null;
  primaryContact: boolean;
  ownershipPercent: number | null;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### Migration DTOs
```typescript
interface MigrationResult {
  personsProcessed: number;
  clientsCreated: number;
  partiesUpdated: number;
  errors: MigrationError[];
}

interface MigrationError {
  personId: string;
  personName: string;
  error: string;
}

interface ValidationReport {
  totalParties: number;
  partiesWithRelatedClient: number;
  partiesWithPersonOnly: number;
  orphanedParties: number;
  issues: ValidationIssue[];
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Director Client Creation Completeness
*For any* director imported from Companies House, the system should create an Individual_Client record with type INDIVIDUAL, and store the director's name, email, and phone in the client record fields (not in the Person table).
**Validates: Requirements 1.1, 1.3, 1.4**

### Property 2: Director ID Generation Pattern
*For any* company client and any director being created for that company, the generated director client ID should follow the pattern `{companyId}{letter}` where letter is an alphabetic suffix (A-Z).
**Validates: Requirements 1.2**

### Property 3: Person Table Immutability Post-Refactoring
*For any* director import operation after refactoring, the count of records in the Person table should not increase.
**Validates: Requirements 1.5**

### Property 4: Party Record Completeness
*For any* director-company relationship, the Client_Parties_Table record should have both clientId and relatedClientId populated, along with partyRef and role fields.
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 5: Many-to-Many Director Relationships
*For any* director linked to N companies, there should be exactly N Client_Parties_Table records, all with the same relatedClientId but different clientId values.
**Validates: Requirements 2.4, 5.1**

### Property 6: Bidirectional Relationship Queries
*For any* director-company relationship, querying parties by relatedClientId should return all companies for that director, and querying by clientId should return all directors for that company.
**Validates: Requirements 2.5, 2.6**

### Property 7: Companies House Import Creates All Entities
*For any* valid Companies House company data with N directors, importing should create one Company_Client record and N Individual_Client records.
**Validates: Requirements 3.1, 3.2**

### Property 8: Sequential Suffix Generation
*For any* company with multiple directors imported in sequence, the alphabetic suffixes should be assigned sequentially (A, B, C, ...) based on import order.
**Validates: Requirements 3.3**

### Property 9: Batch Director Import Creates Relationships
*For any* company with N directors imported from Companies House, the system should create N Client_Parties_Table records, each linking one director to the company with role set to DIRECTOR.
**Validates: Requirements 3.2, 3.4, 3.5**

### Property 10: Director Deduplication on Import
*For any* director that already exists as an Individual_Client, importing them again for a different company should reuse the existing client record and create only a new Client_Parties_Table link.
**Validates: Requirements 3.6**

### Property 11: Migration ID Generation Consistency
*For any* person record being migrated with an associated company, the generated client ID should follow the same pattern as new imports: `{companyId}{letter}`.
**Validates: Requirements 4.2**

### Property 12: Migration Updates Party References
*For any* Client_Parties_Table record after migration, it should have a valid relatedClientId that references an existing Individual_Client record.
**Validates: Requirements 4.3, 4.5**

### Property 13: Migration Preserves Relationships (Round Trip)
*For any* set of company-director relationships before migration, after migration completes, the same relationships should exist with the same data (role, appointedAt, etc.), just using relatedClientId instead of personId.
**Validates: Requirements 4.4**

### Property 14: Director Can Link to Multiple Companies
*For any* existing Individual_Client (director) and any company, the system should allow creating a new Client_Parties_Table record linking them together.
**Validates: Requirements 5.4, 7.3**

### Property 15: Relationship Independence
*For any* director with relationships to companies A and B, removing the relationship with company A should not affect the relationship with company B (the party record for B should remain unchanged).
**Validates: Requirements 5.5**

### Property 16: Director Client Capabilities
*For any* Individual_Client record (director), the system should allow creating associated services, tasks, and documents, just like any other client.
**Validates: Requirements 6.2, 6.3, 6.4**

### Property 17: Search Includes All Client Types
*For any* client search query, the results should include both COMPANY and INDIVIDUAL type clients that match the search criteria.
**Validates: Requirements 6.5**

### Property 18: Atomic Director Creation and Linking
*For any* new director being created and linked to a company in one operation, either both the Individual_Client and Client_Parties_Table records should be created, or neither should be created (atomic transaction).
**Validates: Requirements 7.4**

### Property 19: Unlinking Preserves Director Client
*For any* director-company relationship, removing the Client_Parties_Table record should not delete the Individual_Client record.
**Validates: Requirements 7.5**

### Property 20: Referential Integrity for Party Relationships
*For any* Client_Parties_Table record, the clientId should reference a valid client with type COMPANY, and the relatedClientId should reference a valid client with type INDIVIDUAL.
**Validates: Requirements 8.1, 8.2**

### Property 21: Cascade Protection for Directors
*For any* Individual_Client with active Client_Parties_Table relationships, attempting to delete the client should fail or cascade delete the relationships first.
**Validates: Requirements 8.3**

### Property 22: Party Reference Uniqueness Per Company
*For any* company, all Client_Parties_Table records for that company should have unique partyRef values.
**Validates: Requirements 8.4**

### Property 23: Party Role Validation
*For any* Client_Parties_Table record being created, the role field should only accept valid enum values (DIRECTOR, SHAREHOLDER, PARTNER, MEMBER, OWNER, UBO, SECRETARY, CONTACT).
**Validates: Requirements 8.5**

## Error Handling

### Migration Errors

**Person Without Company Association**:
- Error: Person record has no associated ClientParty records
- Handling: Skip person, log warning, continue migration
- Recovery: Manual review of orphaned person records

**Duplicate Director Names**:
- Error: Multiple persons with same name during migration
- Handling: Create separate Individual_Client records with unique IDs
- Recovery: Manual deduplication after migration if needed

**ID Generation Collision**:
- Error: Generated director ID already exists
- Handling: Try next available suffix letter
- Recovery: If all 26 letters exhausted, use double letters (AA, AB, etc.)

### Import Errors

**Companies House API Failure**:
- Error: Cannot fetch company or officer data
- Handling: Return error to user, do not create partial records
- Recovery: Retry import after API is available

**Invalid Officer Data**:
- Error: Officer missing required fields (name)
- Handling: Skip that officer, log warning, continue with others
- Recovery: Manual data entry for skipped officers

**Director Already Linked**:
- Error: Attempting to create duplicate party relationship
- Handling: Return error or silently skip (idempotent)
- Recovery: No action needed, relationship already exists

### Runtime Errors

**Invalid Client Type for Party**:
- Error: Attempting to link two COMPANY clients or two INDIVIDUAL clients
- Handling: Validate types before creating party record, return validation error
- Recovery: User corrects client types

**Orphaned Party Record**:
- Error: Party record references deleted client
- Handling: Database foreign key constraints prevent this
- Recovery: If constraints bypassed, cleanup script to remove orphaned records

**Concurrent ID Generation**:
- Error: Two directors created simultaneously for same company
- Handling: Use database transactions and unique constraints
- Recovery: Retry with next available suffix

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and error conditions
- Test migration of a specific person record
- Test import of a company with zero directors
- Test import of a company with 26+ directors (suffix overflow)
- Test error handling for invalid Companies House data
- Test concurrent director creation
- Test deletion cascade behavior

**Property-Based Tests**: Verify universal properties across all inputs
- Use fast-check library for TypeScript/JavaScript
- Configure each test to run minimum 100 iterations
- Each property test must reference its design document property
- Tag format: `// Feature: client-party-refactoring, Property {number}: {property_text}`

### Property-Based Testing Configuration

**Library**: fast-check (already in dependencies)
**Minimum Iterations**: 100 per property test
**Test Organization**: Group by component (migration, import, queries, validation)

**Example Property Test Structure**:
```typescript
// Feature: client-party-refactoring, Property 2: Director ID Generation Pattern
it('should generate director IDs following pattern {companyId}{letter}', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.string({ minLength: 5, maxLength: 5 }), // company ID
      fc.integer({ min: 0, max: 25 }), // suffix index
      async (companyId, suffixIndex) => {
        const letter = String.fromCharCode(65 + suffixIndex); // A-Z
        const directorId = await service.generateDirectorClientId(companyId);
        expect(directorId).toMatch(new RegExp(`^${companyId}[A-Z]$`));
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Coverage Requirements

**Migration Tests**:
- Property 11: Migration ID generation
- Property 12: Party reference updates
- Property 13: Relationship preservation (round trip)

**Import Tests**:
- Property 1: Director client creation
- Property 2: ID generation pattern
- Property 3: Person table immutability
- Property 7: Batch entity creation
- Property 8: Sequential suffix generation
- Property 9: Batch relationship creation
- Property 10: Director deduplication

**Query Tests**:
- Property 6: Bidirectional queries
- Property 17: Search includes all types

**Relationship Tests**:
- Property 4: Party record completeness
- Property 5: Many-to-many relationships
- Property 14: Multi-company linking
- Property 15: Relationship independence
- Property 19: Unlinking preserves client

**Validation Tests**:
- Property 20: Referential integrity
- Property 21: Cascade protection
- Property 22: Party reference uniqueness
- Property 23: Role validation

**Capability Tests**:
- Property 16: Director client capabilities
- Property 18: Atomic creation and linking

### Integration Testing

**End-to-End Scenarios**:
1. Import company from Companies House with directors
2. Verify all entities created correctly
3. Link existing director to second company
4. Verify multi-company relationships
5. Remove director from one company
6. Verify other relationships unaffected
7. Assign service to director
8. Verify director has full client capabilities

**Migration Testing**:
1. Create test database with legacy Person records
2. Run migration script
3. Verify all relationships preserved
4. Verify no data loss
5. Test rollback capability

### Performance Testing

**Scalability Tests**:
- Import company with 100+ directors
- Query directors for company with 50+ directors
- Query companies for director linked to 20+ companies
- Migration of 1000+ person records

**Benchmarks**:
- Director ID generation: < 10ms
- Party relationship creation: < 50ms
- Bidirectional query: < 100ms
- Migration per person: < 200ms
