# Design Document: Practice Manager Data Display Fix

## Overview

This design provides a systematic approach to audit and fix data display issues in the M-Practice-Manager application. The application follows a three-tier architecture:

1. **Data Layer**: PostgreSQL database accessed via Prisma ORM
2. **API Layer**: NestJS backend services and controllers (port 3001)
3. **Presentation Layer**: Next.js frontend pages and components (port 3000)

The fix involves auditing each layer to ensure data flows correctly from database to UI without hardcoded values or field mapping errors. Based on initial code review, the core architecture appears sound, but a comprehensive audit is needed to identify any specific pages or endpoints with issues.

## Architecture

### Current Data Flow

```
PostgreSQL Database
    ↓ (Prisma ORM)
NestJS Services (e.g., ClientsService, ServicesService, TasksService)
    ↓ (Dependency Injection)
NestJS Controllers (e.g., ClientsController, DashboardController)
    ↓ (HTTP REST API)
Next.js API Client (lib/api.ts)
    ↓ (React Hooks / useEffect)
Next.js Page Components (app/*/page.tsx)
    ↓ (JSX Rendering)
User Interface
```

### Key Components

**Database Layer:**
- PostgreSQL database with comprehensive schema
- Prisma ORM for type-safe database access
- Schema location: `apps/api/prisma/schema.prisma`

**API Layer:**
- NestJS modules organized by domain (clients, services, tasks, etc.)
- Services handle business logic and database queries
- Controllers expose REST API endpoints
- Base URL: `http://localhost:3001/api/v1`

**Presentation Layer:**
- Next.js 13+ App Router architecture
- Client-side data fetching using `api.get()` helper
- Pages located in `apps/web/src/app/*/page.tsx`
- Shared API client: `apps/web/src/lib/api.ts`

### Audit Strategy

The audit will follow a bottom-up approach:

1. **Database Schema Review**: Verify Prisma schema matches expected data structure
2. **Service Layer Audit**: Verify all service methods use Prisma queries
3. **Controller Layer Audit**: Verify controllers call services and return database data
4. **API Client Audit**: Verify frontend API client correctly calls backend endpoints
5. **Page Component Audit**: Verify pages fetch and display API data correctly
6. **Field Mapping Audit**: Verify field names match across all layers
7. **Integration Testing**: Verify end-to-end data flow

## Components and Interfaces

### Service Layer Interface

All NestJS services follow this pattern:

```typescript
@Injectable()
export class ExampleService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: Filters): Promise<Entity[]> {
    // MUST use Prisma query
    return this.prisma.entity.findMany({
      where: buildWhereClause(filters),
      include: buildIncludeClause(),
    });
  }

  async findOne(id: string): Promise<Entity | null> {
    // MUST use Prisma query
    return this.prisma.entity.findUnique({
      where: { id },
      include: buildIncludeClause(),
    });
  }
}
```

**Key Requirements:**
- All data retrieval methods MUST use `this.prisma.*` queries
- NO hardcoded arrays or objects simulating database responses
- Handle null/undefined values from database gracefully
- Return Prisma-generated types for type safety

### Controller Layer Interface

All NestJS controllers follow this pattern:

```typescript
@Controller('api/v1/entities')
export class ExampleController {
  constructor(private readonly service: ExampleService) {}

  @Get()
  async findAll(@Query() filters: FiltersDto) {
    // MUST call service method
    return this.service.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // MUST call service method
    const entity = await this.service.findOne(id);
    if (!entity) throw new NotFoundException();
    return entity;
  }
}
```

**Key Requirements:**
- Controllers MUST delegate to service methods
- NO hardcoded response objects in controllers
- Use appropriate HTTP status codes and exceptions
- Return data directly from services (NestJS handles serialization)

### API Client Interface

The frontend API client (`apps/web/src/lib/api.ts`) provides a centralized interface:

```typescript
class ApiClient {
  private baseURL = 'http://localhost:3001/api/v1';

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
  }

  // Convenience methods
  async getClients(): Promise<ClientContext[]> {
    return this.get('/clients/contexts');
  }

  async getServices(): Promise<Service[]> {
    return this.get('/services/with-client-details');
  }
}

export const api = new ApiClient();
```

**Key Requirements:**
- All API calls MUST go through this client
- NO direct fetch calls with hardcoded URLs in pages
- Handle errors consistently
- Return typed responses

### Page Component Interface

Next.js pages follow this pattern:

```typescript
'use client';

export default function ExamplePage() {
  const [data, setData] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // MUST fetch from API
        const result = await api.getEntities();
        setData(result);
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        data.map(item => <div key={item.id}>{item.name}</div>)
      )}
    </div>
  );
}
```

**Key Requirements:**
- Pages MUST fetch data via API client in useEffect
- NO hardcoded data arrays in page components
- Handle loading and error states
- Display "—" or "N/A" for null/undefined fields, not "null" or "undefined"

## Data Models

### Key Prisma Models

**Client Model:**
```prisma
model Client {
  id                    String        @id
  name                  String
  type                  ClientType
  status                ClientStatus  @default(ACTIVE)
  registeredNumber      String?       @unique
  utrNumber             String?       @unique
  portfolioCode         Int
  mainEmail             String?
  mainPhone             String?
  accountsNextDue       DateTime?
  accountsLastMadeUpTo  DateTime?
  confirmationNextDue   DateTime?
  // ... additional fields
  services              Service[]
  tasks                 Task[]
  clientProfile         ClientProfile?
}
```

**Service Model:**
```prisma
model Service {
  id          String    @id @default(cuid())
  clientId    String
  kind        String
  frequency   String?
  fee         Decimal?
  annualized  Decimal?
  status      String    @default("ACTIVE")
  nextDue     DateTime?
  client      Client    @relation(fields: [clientId], references: [id])
  tasks       Task[]
}
```

**Task Model:**
```prisma
model Task {
  id          String     @id @default(cuid())
  title       String
  clientId    String?
  serviceId   String?
  dueDate     DateTime?
  assigneeId  String?
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  client      Client?    @relation(fields: [clientId], references: [id])
  service     Service?   @relation(fields: [serviceId], references: [id])
}
```

### Field Mapping Reference

Critical field mappings to verify:

| Database Field | API Response Field | UI Display Field | Notes |
|----------------|-------------------|------------------|-------|
| `Client.id` | `id` | `identifier` | Primary identifier |
| `Client.registeredNumber` | `registeredNumber` | `Company No.` | May be null |
| `Client.accountsNextDue` | `accountsNextDue` | `Year End Due` | Date field |
| `Service.annualized` | `annualized` | `Annual Value` | Calculated field |
| `Task.dueDate` | `dueDate` | `Due Date` | Date field |
| `ClientProfile.annualFee` | `profile.annualFee` | `Annual Fees` | From related table |

## Audit Checklist

### Services to Audit

Located in `apps/api/src/modules/*/`:

- [x] `clients/clients.service.ts` - ✅ Uses Prisma correctly
- [x] `services/services.service.ts` - ✅ Uses Prisma correctly
- [x] `tasks/tasks.service.ts` - ✅ Uses Prisma correctly
- [ ] `dashboard/dashboard.service.ts` - Needs verification
- [ ] `filings/compliance.service.ts` - Needs verification
- [ ] `calendar/calendar.service.ts` - Needs verification
- [ ] `documents/documents.service.ts` - Needs verification
- [ ] `people/people.service.ts` - Needs verification
- [ ] `portfolios/portfolios.service.ts` - Needs verification
- [ ] `staff/staff.service.ts` - Needs verification
- [ ] `tax-calculations/tax-calculations.service.ts` - Needs verification
- [ ] `templates/templates.service.ts` - Needs verification
- [ ] `accounts-production/accounts-production.service.ts` - Needs verification

### Controllers to Audit

Located in `apps/api/src/modules/*/`:

- [ ] `clients/clients.controller.ts`
- [ ] `services/services.controller.ts`
- [ ] `tasks/tasks.controller.ts`
- [ ] `dashboard/dashboard.controller.ts`
- [ ] `filings/compliance.controller.ts`
- [ ] `calendar/calendar.controller.ts`
- [ ] `documents/documents.controller.ts`
- [ ] All other controllers in modules

### Pages to Audit

Located in `apps/web/src/app/*/page.tsx`:

- [x] `dashboard/page.tsx` - ✅ Fetches from API correctly
- [x] `clients/page.tsx` - ✅ Fetches from API correctly
- [x] `services/page.tsx` - ✅ Fetches from API correctly
- [x] `tasks/page.tsx` - ✅ Fetches from API correctly
- [ ] `compliance/page.tsx` - Needs verification
- [ ] `calendar/page.tsx` - Needs verification
- [ ] `documents/page.tsx` - Needs verification
- [ ] `people/page.tsx` - Needs verification
- [ ] `tax-calculations/page.tsx` - Needs verification
- [ ] `templates/page.tsx` - Needs verification
- [ ] `accounts-production/page.tsx` - Needs verification
- [ ] `settings/page.tsx` - Needs verification
- [ ] All detail pages (`[id]/page.tsx`)

### Common Issues to Check

1. **Hardcoded Data Arrays:**
   - Search for: `const data = [{ ... }]` in services/controllers
   - Search for: `useState([{ ... }])` with hardcoded objects in pages

2. **Field Mapping Errors:**
   - Verify database field names match API response fields
   - Verify API response fields match UI display code
   - Check for typos: `registeredNumber` vs `registrationNumber`

3. **Null/Undefined Handling:**
   - Search for: direct display of nullable fields without fallback
   - Verify: `{field ?? '—'}` or `{field || 'N/A'}` patterns used

4. **Missing Prisma Queries:**
   - Search for: service methods that don't call `this.prisma.*`
   - Verify: all data retrieval goes through Prisma

5. **Direct Database Access:**
   - Verify: NO raw SQL queries bypassing Prisma
   - Verify: NO direct database connections in controllers/pages



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Prisma Query Execution

*For any* service method that retrieves data, calling that method should result in at least one Prisma query being executed against the database.

**Validates: Requirements 1.1, 1.2**

### Property 2: API Endpoint Database Sourcing

*For any* API endpoint response, the returned data should match the current state of the database (no hardcoded responses).

**Validates: Requirements 2.1, 2.3, 2.4**

### Property 3: Field Mapping Consistency

*For any* database record, the field values should be identical when accessed through the API response and when queried directly from the database.

**Validates: Requirements 3.1**

### Property 4: UI Field Mapping Correctness

*For any* API response field, the UI should correctly access and display that field without undefined or field-not-found errors.

**Validates: Requirements 3.2**

### Property 5: Null Value Handling

*For any* nullable database field that is null, the UI should display a placeholder value ("—" or "N/A") instead of the string "null" or "undefined".

**Validates: Requirements 3.4, 8.1**

### Property 6: Date Formatting Consistency

*For any* date field retrieved from the database, the UI should format it consistently using the same date format (DD/MM/YYYY for en-GB locale).

**Validates: Requirements 3.5**

### Property 7: List Filtering Accuracy

*For any* list page with applied filters, the displayed records should exactly match the set of database records that satisfy the filter criteria.

**Validates: Requirements 5.6**

### Property 8: Related Data Fetching

*For any* detail page displaying related data, all related records should be fetched from the database and displayed (not hardcoded or omitted).

**Validates: Requirements 6.5**

### Property 9: Cross-Page Data Consistency

*For any* data value displayed on multiple pages, the value should be identical across all pages when viewing the same underlying database record.

**Validates: Requirements 7.1**

### Property 10: Data Update Propagation

*For any* database record that is updated, refreshing any page that displays that record should show the updated values (not stale or cached hardcoded data).

**Validates: Requirements 7.5**

### Property 11: Optional Field Graceful Handling

*For any* record with missing optional fields, the UI should display without errors and handle the missing fields gracefully (hide or show placeholder).

**Validates: Requirements 8.4**

### Property 12: Null Field Robustness

*For any* record with null fields, the UI should render without JavaScript errors or crashes.

**Validates: Requirements 8.5**

## Error Handling

### Service Layer Error Handling

**Database Query Failures:**
- Services MUST throw exceptions when Prisma queries fail
- Services MUST NOT return empty arrays or null as fallback for query failures
- Services MUST log errors with sufficient context for debugging

```typescript
async findAll(filters?: Filters): Promise<Entity[]> {
  try {
    return await this.prisma.entity.findMany({
      where: buildWhereClause(filters),
    });
  } catch (error) {
    this.logger.error('Failed to fetch entities', error);
    throw error; // Re-throw, don't return []
  }
}
```

**Not Found Handling:**
- Services SHOULD return `null` for `findOne` when record doesn't exist
- Services SHOULD return empty array `[]` for `findMany` when no records match
- Services MUST distinguish between "no results" and "query failed"

### Controller Layer Error Handling

**HTTP Status Codes:**
- 200 OK: Successful data retrieval
- 404 Not Found: Record doesn't exist (throw `NotFoundException`)
- 500 Internal Server Error: Database or service errors (NestJS handles automatically)

```typescript
@Get(':id')
async findOne(@Param('id') id: string) {
  const entity = await this.service.findOne(id);
  if (!entity) {
    throw new NotFoundException(`Entity with ID ${id} not found`);
  }
  return entity;
}
```

### API Client Error Handling

**Network Errors:**
- API client MUST throw errors for non-2xx responses
- API client MUST include response status in error messages
- API client SHOULD retry on network failures (optional enhancement)

```typescript
async get<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${this.baseURL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }
  return response.json();
}
```

### Page Component Error Handling

**Loading States:**
- Pages MUST show loading indicator while fetching data
- Pages MUST NOT show stale data during loading

**Error States:**
- Pages MUST catch API errors and display user-friendly messages
- Pages MUST provide retry mechanism for failed requests
- Pages MUST NOT crash or show blank screen on errors

```typescript
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.getEntities();
      setData(result);
    } catch (e: any) {
      console.error('Failed to load data', e);
      setError(e?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);

// In JSX:
{error && (
  <div className="error-message">
    {error}
    <button onClick={() => fetchData()}>Try Again</button>
  </div>
)}
```

**Null/Undefined Handling:**
- Pages MUST use nullish coalescing or optional chaining for nullable fields
- Pages MUST display placeholder values for null fields

```typescript
// Good:
<td>{client.registeredNumber ?? '—'}</td>
<td>{client.mainPhone || 'N/A'}</td>
<td>{client.accountsNextDue ? formatDate(client.accountsNextDue) : '—'}</td>

// Bad:
<td>{client.registeredNumber}</td> // Shows "null" or "undefined"
<td>{formatDate(client.accountsNextDue)}</td> // Crashes if null
```

## Testing Strategy

### Unit Tests

**Service Layer Tests:**
- Test that service methods call Prisma with correct parameters
- Test that service methods handle Prisma errors appropriately
- Test that service methods return correct data types
- Mock Prisma to isolate service logic

```typescript
describe('ClientsService', () => {
  it('should call Prisma findMany when fetching all clients', async () => {
    const prismaMock = {
      client: {
        findMany: jest.fn().mockResolvedValue([mockClient]),
      },
    };
    const service = new ClientsService(prismaMock as any);
    
    await service.findAll();
    
    expect(prismaMock.client.findMany).toHaveBeenCalled();
  });
});
```

**Controller Layer Tests:**
- Test that controllers call service methods
- Test that controllers return service results
- Test that controllers throw appropriate HTTP exceptions
- Mock services to isolate controller logic

### Integration Tests

**API Endpoint Tests:**
- Test complete request/response cycle
- Test with real database (test database, not production)
- Verify response data matches database state
- Test error scenarios (not found, invalid input)

```typescript
describe('GET /api/v1/clients', () => {
  it('should return all clients from database', async () => {
    // Seed test database
    await prisma.client.create({ data: mockClientData });
    
    // Call API
    const response = await request(app.getHttpServer())
      .get('/api/v1/clients')
      .expect(200);
    
    // Verify response matches database
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe(mockClientData.name);
  });
});
```

**End-to-End Tests:**
- Test complete data flow from database to UI
- Use real database and real API
- Verify UI displays correct data
- Test user interactions (filtering, sorting, pagination)

### Property-Based Tests

**Configuration:**
- Minimum 100 iterations per property test
- Use fast-check library for TypeScript/JavaScript
- Tag each test with feature name and property number

**Example Property Test:**

```typescript
import fc from 'fast-check';

describe('Feature: practice-manager-data-fix, Property 5: Null Value Handling', () => {
  it('should display placeholder for null fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.string(),
          name: fc.string(),
          registeredNumber: fc.option(fc.string(), { nil: null }),
          mainPhone: fc.option(fc.string(), { nil: null }),
        }),
        async (clientData) => {
          // Create client with potentially null fields
          await prisma.client.create({ data: clientData });
          
          // Fetch via API
          const response = await api.get(`/clients/${clientData.id}`);
          
          // Render UI component
          const { container } = render(<ClientDetail client={response} />);
          
          // Verify null fields show placeholder, not "null" or "undefined"
          const text = container.textContent;
          expect(text).not.toContain('null');
          expect(text).not.toContain('undefined');
          
          if (clientData.registeredNumber === null) {
            expect(text).toContain('—');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Manual Testing Checklist

**For Each Page:**
1. Load page and verify data appears (not loading forever)
2. Verify data matches database records (check a few samples)
3. Verify no "null" or "undefined" text appears
4. Verify dates are formatted consistently
5. Test filters/search and verify results are correct
6. Test with empty database and verify appropriate message
7. Test with API down and verify error message appears
8. Check browser console for JavaScript errors

**For Each API Endpoint:**
1. Call endpoint and verify response structure
2. Verify response data matches database query results
3. Test with invalid IDs and verify 404 response
4. Test with filters and verify correct filtering
5. Verify no hardcoded data in response
6. Check server logs for errors

## Implementation Phases

### Phase 1: Audit and Documentation (Week 1)

**Objectives:**
- Complete audit of all services, controllers, and pages
- Document all identified issues with file paths and line numbers
- Create prioritized fix list

**Tasks:**
1. Audit all service files for Prisma usage
2. Audit all controller files for service delegation
3. Audit all page files for API calls
4. Document field mapping issues
5. Create issue tracking spreadsheet

**Deliverables:**
- Audit report with all findings
- Prioritized issue list
- Field mapping reference document

### Phase 2: Service Layer Fixes (Week 2)

**Objectives:**
- Fix all service layer issues
- Ensure all services use Prisma correctly
- Add error handling to services

**Tasks:**
1. Fix services with hardcoded data
2. Fix services with missing Prisma queries
3. Add error handling and logging
4. Write unit tests for fixed services
5. Verify all services pass tests

**Deliverables:**
- All services using Prisma correctly
- Unit tests for all services
- Updated service documentation

### Phase 3: API Layer Fixes (Week 3)

**Objectives:**
- Fix all controller issues
- Ensure controllers delegate to services
- Add proper error handling

**Tasks:**
1. Fix controllers with hardcoded responses
2. Fix controllers not calling services
3. Add HTTP exception handling
4. Write integration tests for endpoints
5. Verify all endpoints return database data

**Deliverables:**
- All controllers delegating to services
- Integration tests for all endpoints
- API documentation updated

### Phase 4: UI Layer Fixes (Week 4)

**Objectives:**
- Fix all page component issues
- Ensure pages fetch from API
- Fix field mapping issues
- Add null handling

**Tasks:**
1. Fix pages with hardcoded data
2. Fix pages not calling API
3. Fix field mapping errors
4. Add null/undefined handling
5. Add error handling and loading states
6. Write component tests

**Deliverables:**
- All pages fetching from API
- All field mappings correct
- Proper null handling throughout
- Component tests for all pages

### Phase 5: Testing and Validation (Week 5)

**Objectives:**
- Run comprehensive test suite
- Perform manual testing
- Verify all properties hold
- Fix any remaining issues

**Tasks:**
1. Run all unit tests
2. Run all integration tests
3. Run property-based tests
4. Perform manual testing of all pages
5. Verify data consistency across pages
6. Fix any issues found
7. Re-test after fixes

**Deliverables:**
- All tests passing
- Manual testing checklist completed
- All properties verified
- Zero known data display issues

### Phase 6: Documentation and Handoff (Week 6)

**Objectives:**
- Document all changes
- Update development guidelines
- Train team on best practices
- Close out project

**Tasks:**
1. Document all fixes made
2. Update coding standards
3. Create developer guide for data flow
4. Conduct team training session
5. Create monitoring/alerting for data issues
6. Final project review

**Deliverables:**
- Complete change documentation
- Updated coding standards
- Developer guide
- Team training completed
- Monitoring in place
- Project closure report

## Success Criteria

The fix is considered successful when:

1. **All Services Use Prisma**: Every service method that retrieves data executes Prisma queries
2. **No Hardcoded Data**: No hardcoded arrays or objects simulating database responses
3. **Correct Field Mappings**: All database fields correctly map through API to UI
4. **Proper Null Handling**: No "null" or "undefined" text appears in UI
5. **Data Consistency**: Same data displays identically across all pages
6. **All Tests Pass**: 100% of unit, integration, and property tests pass
7. **Manual Testing Complete**: All pages manually verified to display correct data
8. **Zero Console Errors**: No JavaScript errors in browser console
9. **Zero Server Errors**: No unhandled exceptions in server logs
10. **User Acceptance**: Product owner confirms all pages display correct data

## Maintenance Guidelines

### Code Review Checklist

When reviewing new code, verify:

- [ ] Services use Prisma queries, not hardcoded data
- [ ] Controllers delegate to services, not hardcoded responses
- [ ] Pages fetch from API, not hardcoded data
- [ ] Field names match across database, API, and UI
- [ ] Null values handled with placeholders
- [ ] Dates formatted consistently
- [ ] Error handling present at all layers
- [ ] Tests included for new functionality

### Monitoring and Alerts

Set up monitoring for:

- API response times (detect database issues)
- Error rates (detect data access failures)
- Null pointer exceptions (detect missing null handling)
- Failed API calls from UI (detect endpoint issues)

### Regular Audits

Perform quarterly audits:

- Review new pages for correct data fetching
- Review new services for Prisma usage
- Review field mappings for consistency
- Run property-based tests
- Update documentation as needed
