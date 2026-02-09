# Client Data Consolidation - Design

## Overview

Merge the `ClientProfile` table into the `Client` table, creating a single unified entity for all client data.

## Current State Analysis

### Duplicated Fields (MUST RESOLVE)

| Field | In Client | In ClientProfile | Resolution |
|-------|-----------|------------------|------------|
| `vatNumber` | ✓ (unique) | ✓ | Keep in Client (core tax ID) |
| `utrNumber` | ✓ (unique) | ✗ | Already in Client only |
| `corporationTaxUtr` | ✗ | ✓ | Rename to `utrNumber` (same thing) |
| `payeReference` | ✓ (unique) | ✓ | Keep in Client |
| `accountsOfficeReference` | ✓ | ✓ (as `payeAccountsOfficeReference`) | Keep in Client, standardize name |
| `cisUtr` | ✓ (unique) | ✓ | Keep in Client |
| `personalUtr` | ✗ | ✓ | Move to Client (for INDIVIDUAL type) |
| `annualFees` | ✓ (as Decimal) | ✓ (as `annualFee` Decimal) | Keep in Client, standardize name |

### ClientProfile-Only Fields (MOVE TO CLIENT)

**Lifecycle & Engagement:**
- `mainContactName`, `partnerResponsible`, `clientManager`
- `lifecycleStatus`, `engagementType`, `engagementLetterSigned`
- `onboardingDate`, `disengagementDate`, `onboardingStartedAt`, `wentLiveAt`, `ceasedAt`, `dormantSince`

**Tax & Compliance:**
- `accountingPeriodEnd`, `nextAccountsDueDate`, `nextCorporationTaxDueDate`, `statutoryYearEnd`
- `vatRegistrationDate`, `vatPeriodStart`, `vatPeriodEnd`, `vatStagger`
- `vatScheme`, `vatReturnFrequency`, `vatQuarter`
- `payrollPayDay`, `payrollPeriodEndDay`, `payrollFrequency`
- `cisRegistered`, `payrollRtiRequired`, `selfAssessmentRequired`, `selfAssessmentFiled`

**AML & Risk:**
- `amlCompleted`, `clientRiskRating`

**Fees & Payment:**
- `monthlyFee`, `feeArrangement`, `businessBankName`, `accountLastFour`
- `directDebitInPlace`, `paymentIssues`

**Contact Details:**
- `contactPosition`, `telephone`, `mobile`, `email`, `preferredContactMethod`
- `correspondenceAddress`, `registeredAddress`, `personalAddress`

**Company Details:**
- `tradingName`, `companyType`, `authenticationCode`, `employeeCount`
- `companyStatusDetail`, `jurisdiction`, `sicCodes`, `sicDescriptions`, `registeredOfficeFull`
- `directorCount`, `pscCount`, `currentDirectors`, `currentPscs`, `lastChRefresh`

**Individual Details:**
- `nationalInsuranceNumber`, `dateOfBirth`, `personalTaxYear`, `selfAssessmentTaxYear`
- `linkedCompanyNumber`, `directorRole`

**Compliance Tracking:**
- `accountsOverdue`, `confirmationStatementOverdue`
- `nextAccountsMadeUpTo`, `nextAccountsDueBy`, `lastAccountsMadeUpTo`
- `nextConfirmationStatementDate`, `confirmationStatementDueBy`, `lastConfirmationStatementDate`

**Notes:**
- `notes`, `specialCircumstances`, `seasonalBusiness`, `dormant`, `doNotContact`

## Proposed Schema

### Consolidated Client Table

```prisma
model Client {
  id                               String              @id
  name                             String
  type                             ClientType
  status                           ClientStatus        @default(ACTIVE)
  portfolioCode                    Int
  
  // === CONTACT INFORMATION ===
  mainEmail                        String?
  mainPhone                        String?
  telephone                        String?             // Additional phone
  mobile                           String?             // Mobile phone
  mainContactName                  String?             // Primary contact person
  contactPosition                  String?             // Contact's role/position
  preferredContactMethod           String?             // Email, Phone, etc.
  
  // === ADDRESS INFORMATION ===
  addressId                        String?
  correspondenceAddress            String?             // Text address for correspondence
  registeredAddress                String?             // Registered office (text)
  registeredOfficeFull             String?             // Full CH registered address
  personalAddress                  String?             // For individuals
  
  // === TAX REGISTRATION (CORE IDENTITY) ===
  registeredNumber                 String?             @unique  // Company number
  utrNumber                        String?             @unique  // Corporation Tax / Self Assessment UTR
  vatNumber                        String?             @unique  // VAT registration
  payeReference                    String?             @unique  // PAYE reference
  accountsOfficeReference          String?             // PAYE Accounts Office ref
  cisUtr                           String?             @unique  // CIS UTR
  eoriNumber                       String?             @unique  // EORI number
  personalUtr                      String?             // Personal UTR (for individuals)
  nationalInsuranceNumber          String?             // NI number (for individuals)
  
  // === HMRC STATUS FLAGS ===
  mtdVatEnabled                    Boolean             @default(false)
  mtdItsaEnabled                   Boolean             @default(false)
  hmrcCtStatus                     String?
  hmrcSaStatus                     String?
  hmrcVatStatus                    String?
  hmrcPayeStatus                   String?
  hmrcCisStatus                    String?
  hmrcMtdVatStatus                 String?
  hmrcMtdItsaStatus                String?
  hmrcEoriStatus                   String?
  
  // === COMPANY INFORMATION ===
  tradingName                      String?
  companyType                      String?
  companyStatusDetail              String?
  jurisdiction                     String?
  sicCodes                         String?             // Comma-separated
  sicDescriptions                  String?             // Comma-separated
  incorporationDate                DateTime?
  authenticationCode               String?             // HMRC auth code
  
  // === ACCOUNTING DATES ===
  yearEnd                          DateTime?           // Accounting year end
  accountingPeriodEnd              DateTime?           // Current period end
  statutoryYearEnd                 DateTime?           // Statutory year end
  accountsAccountingReferenceDay   Int?
  accountsAccountingReferenceMonth Int?
  
  // === ACCOUNTS FILING ===
  accountsNextDue                  DateTime?           // Next accounts due date
  accountsLastMadeUpTo             DateTime?           // Last accounts made up to
  nextAccountsDueDate              DateTime?           // Duplicate of accountsNextDue?
  nextAccountsMadeUpTo             DateTime?           // Next accounts period end
  nextAccountsDueBy                DateTime?           // Next accounts filing deadline
  lastAccountsMadeUpTo             DateTime?           // Last accounts period
  accountsOverdue                  Boolean             @default(false)
  
  // === CONFIRMATION STATEMENT ===
  confirmationNextDue              DateTime?           // Next CS due
  confirmationLastMadeUpTo         DateTime?           // Last CS made up to
  nextConfirmationStatementDate    DateTime?           // Next CS date
  confirmationStatementDueBy       DateTime?           // CS filing deadline
  lastConfirmationStatementDate    DateTime?           // Last CS date
  confirmationStatementOverdue     Boolean             @default(false)
  
  // === TAX COMPLIANCE ===
  nextCorporationTaxDueDate        DateTime?
  vatRegistrationDate              DateTime?
  vatPeriodStart                   DateTime?
  vatPeriodEnd                     DateTime?
  vatStagger                       VatStagger          @default(NONE)
  vatScheme                        String?
  vatReturnFrequency               String?
  vatQuarter                       String?
  cisRegistered                    Boolean             @default(false)
  
  // === PAYROLL ===
  payrollRtiRequired               Boolean             @default(false)
  payrollPayDay                    Int?
  payrollPeriodEndDay              Int?
  payrollFrequency                 String?
  employeeCount                    Int?
  
  // === SELF ASSESSMENT (INDIVIDUALS) ===
  selfAssessmentRequired           Boolean             @default(false)
  selfAssessmentFiled              Boolean             @default(false)
  personalTaxYear                  String?
  selfAssessmentTaxYear            String?
  dateOfBirth                      DateTime?
  linkedCompanyNumber              String?             // If individual is linked to company
  directorRole                     String?             // Role in linked company
  
  // === LIFECYCLE & ENGAGEMENT ===
  lifecycleStatus                  LifecycleStatus     @default(PROSPECT)
  engagementType                   String?
  engagementLetterSigned           Boolean             @default(false)
  onboardingDate                   DateTime?
  disengagementDate                DateTime?
  onboardingStartedAt              DateTime?
  wentLiveAt                       DateTime?
  ceasedAt                         DateTime?
  dormantSince                     DateTime?
  
  // === TEAM ASSIGNMENT ===
  partnerResponsible               String?
  clientManager                    String?
  
  // === AML & RISK ===
  amlCompleted                     Boolean             @default(false)
  clientRiskRating                 String?
  
  // === FEES & BILLING ===
  annualFees                       Decimal?            // Standardized name
  monthlyFee                       Decimal?
  feeArrangement                   String?
  businessBankName                 String?
  accountLastFour                  String?
  directDebitInPlace               Boolean             @default(false)
  paymentIssues                    String?
  
  // === COMPANIES HOUSE SYNC ===
  directorCount                    Int?
  pscCount                         Int?
  currentDirectors                 String?             // JSON or comma-separated
  currentPscs                      String?             // JSON or comma-separated
  lastChRefresh                    DateTime?           // Last CH sync
  
  // === OPERATIONAL FLAGS ===
  seasonalBusiness                 Boolean             @default(false)
  dormant                          Boolean             @default(false)
  doNotContact                     Boolean             @default(false)
  
  // === NOTES ===
  notes                            String?             // General notes
  specialCircumstances             String?             // Special handling notes
  
  // === METADATA ===
  tasksDueCount                    Int                 @default(0)
  source                           String?             // Import source
  lastSyncedAt                     DateTime?           // Last external sync
  createdAt                        DateTime            @default(now())
  updatedAt                        DateTime            @updatedAt
  
  // === RELATIONS ===
  address                          Address?            @relation(fields: [addressId], references: [id])
  portfolio                        Portfolio           @relation(fields: [portfolioCode], references: [code])
  parties                          ClientParty[]       @relation("CompanyParties")
  directorParties                  ClientParty[]       @relation("DirectorParties")
  companiesHouseData               CompaniesHouseData?
  accountsSets                     AccountsSet[]
  calendarEvents                   CalendarEvent[]
  complianceItems                  ComplianceItem[]
  documents                        Document[]
  auditEvents                      Event[]             @relation("ClientEvents")
  filings                          Filing[]
  generatedReports                 GeneratedReport[]
  services                         Service[]
  tasks                            Task[]
  taxCalculations                  TaxCalculation[]

  @@index([portfolioCode])
  @@index([name])
  @@index([registeredNumber])
  @@index([lifecycleStatus])
  @@index([type])
  @@index([status])
  @@map("clients")
}
```

### Remove ClientProfile Table

The `ClientProfile` table will be completely removed.

## Field Mapping & Conflict Resolution

### Duplicated Fields - Resolution Strategy

1. **vatNumber**: Keep Client.vatNumber (has unique constraint)
2. **payeReference**: Keep Client.payeReference (has unique constraint)
3. **cisUtr**: Keep Client.cisUtr (has unique constraint)
4. **accountsOfficeReference**: Keep Client.accountsOfficeReference, drop ClientProfile.payeAccountsOfficeReference
5. **annualFees/annualFee**: Standardize to `annualFees` (Client field name)
6. **corporationTaxUtr**: This is the same as `utrNumber` - merge into Client.utrNumber

### Migration Logic for Duplicates

```typescript
// Pseudo-code for migration
for each client:
  // Priority: ClientProfile value takes precedence if both exist
  client.vatNumber = clientProfile.vatNumber ?? client.vatNumber
  client.payeReference = clientProfile.payeReference ?? client.payeReference
  client.cisUtr = clientProfile.cisUtr ?? client.cisUtr
  client.accountsOfficeReference = clientProfile.payeAccountsOfficeReference ?? client.accountsOfficeReference
  client.annualFees = clientProfile.annualFee ?? client.annualFees
  
  // corporationTaxUtr -> utrNumber (only if client.utrNumber is null)
  if (clientProfile.corporationTaxUtr && !client.utrNumber) {
    client.utrNumber = clientProfile.corporationTaxUtr
  }
  
  // Log conflicts for manual review
  if (client.vatNumber && clientProfile.vatNumber && client.vatNumber !== clientProfile.vatNumber) {
    logConflict('vatNumber', client.id, client.vatNumber, clientProfile.vatNumber)
  }
```

## API Changes

### Before (Current)
```typescript
// Two separate queries
const client = await prisma.client.findUnique({ where: { id } });
const profile = await prisma.clientProfile.findUnique({ where: { clientId: id } });
const context = buildClientContext(client, profile);
```

### After (Consolidated)
```typescript
// Single query
const client = await prisma.client.findUnique({ where: { id } });
// client already has all data
```

### Backward Compatibility

To maintain API compatibility during transition, we can:

1. **Option A**: Keep response structure the same
```typescript
// API still returns { node, profile, computed }
return {
  node: client,
  profile: extractProfileFields(client),  // Extract profile-like fields
  computed: computeFlags(client)
};
```

2. **Option B**: Flatten response (breaking change, requires API versioning)
```typescript
// API returns flat client object
return client;
```

**Recommendation**: Use Option A initially, then migrate to Option B in v2 API.

## Service Layer Changes

### ClientsService

**Remove methods:**
- `getProfile()`
- `createProfile()`
- `updateProfile()`

**Update methods:**
- `create()` - Accept all fields in one DTO
- `update()` - Accept all fields in one DTO
- `findOne()` - Returns complete client
- `findAllContexts()` - Simplified, no join needed

### Remove Files
- `dto/client-context.dto.ts` - No longer needed (or simplify drastically)
- Profile-related DTOs in interfaces

## Migration Strategy

### Phase 1: Pre-Migration Audit
1. Identify all clients with profiles
2. Detect conflicts in duplicated fields
3. Generate conflict resolution report
4. Backup database

### Phase 2: Schema Migration
1. Add new fields to Client table (nullable initially)
2. Copy data from ClientProfile to Client
3. Resolve conflicts using priority rules
4. Validate data integrity
5. Drop ClientProfile table
6. Set NOT NULL constraints where appropriate

### Phase 3: Code Migration
1. Update Prisma schema
2. Generate new Prisma client
3. Update all services
4. Update all controllers
5. Update DTOs and interfaces
6. Update web app queries

### Phase 4: Testing
1. Unit tests for services
2. Integration tests for API
3. E2E tests for web app
4. Performance benchmarks

### Phase 5: Deployment
1. Deploy with feature flag (optional)
2. Monitor for errors
3. Rollback capability ready

## Rollback Plan

If issues arise:
1. Restore ClientProfile table from backup
2. Revert code changes
3. Restore previous Prisma schema
4. Regenerate Prisma client

## Performance Considerations

### Before
- Every client query requires JOIN with ClientProfile
- Two table scans for filters on profile fields

### After
- Single table query
- Faster filters (no JOIN)
- Simpler indexes

**Expected improvement**: 20-30% faster queries

## Testing Checklist

- [ ] All existing clients have complete data
- [ ] No data loss in migration
- [ ] All API endpoints return correct data
- [ ] Web app displays all fields correctly
- [ ] Create new client works
- [ ] Update client works
- [ ] Delete client works
- [ ] Filters work correctly
- [ ] Sorting works correctly
- [ ] Performance is improved
- [ ] TypeScript compilation succeeds
- [ ] All tests pass
