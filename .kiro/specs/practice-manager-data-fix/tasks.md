# Implementation Plan: Practice Manager Data Display Fix

## Overview

This implementation plan provides a systematic approach to audit and fix data display issues in the M-Practice-Manager application. The plan follows a bottom-up approach: audit and fix the service layer first, then the API layer, then the UI layer, followed by comprehensive testing. Each task builds on previous tasks to ensure a solid foundation before moving to the next layer.

## Tasks

- [x] 1. Set up audit infrastructure and tooling
  - Create audit tracking spreadsheet/document
  - Set up test database for integration testing
  - Configure property-based testing library (fast-check)
  - Create audit scripts for static analysis (optional)
  - _Requirements: 9.1_

- [x] 2. Audit service layer for Prisma usage
  - [x] 2.1 Audit dashboard service
    - Review `apps/api/src/modules/dashboard/dashboard.service.ts`
    - Verify all data retrieval methods use Prisma queries
    - Check for hardcoded data arrays or objects
    - Document any issues found
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [x] 2.2 Audit compliance service
    - Review `apps/api/src/modules/filings/compliance.service.ts`
    - Verify all data retrieval methods use Prisma queries
    - Check for hardcoded data arrays or objects
    - Document any issues found
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [x] 2.3 Audit calendar service
    - Review `apps/api/src/modules/calendar/calendar.service.ts`
    - Verify all data retrieval methods use Prisma queries
    - Check for hardcoded data arrays or objects
    - Document any issues found
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [x] 2.4 Audit remaining services
    - Review documents, people, portfolios, staff, tax-calculations, templates, accounts-production services
    - Verify all data retrieval methods use Prisma queries
    - Check for hardcoded data arrays or objects
    - Document all issues found with file paths and line numbers
    - _Requirements: 1.1, 1.2, 1.4_

- [x] 3. Audit API controllers for service delegation
  - [x] 3.1 Audit dashboard controller
    - Review `apps/api/src/modules/dashboard/dashboard.controller.ts`
    - Verify all endpoints delegate to service methods
    - Check for hardcoded response objects
    - Document any issues found
    - _Requirements: 2.1, 2.5_
  
  - [x] 3.2 Audit compliance controller
    - Review `apps/api/src/modules/filings/compliance.controller.ts`
    - Verify all endpoints delegate to service methods
    - Check for hardcoded response objects
    - Document any issues found
    - _Requirements: 2.1, 2.5_
  
  - [x] 3.3 Audit remaining controllers
    - Review all other controllers in `apps/api/src/modules/*/`
    - Verify all endpoints delegate to service methods
    - Check for hardcoded response objects
    - Document all issues found with file paths and line numbers
    - _Requirements: 2.1, 2.5_

- [x] 4. Audit web UI pages for API calls
  - [x] 4.1 Audit compliance list page
    - Review `apps/web/src/app/compliance/page.tsx`
    - Verify page fetches data from API endpoint
    - Check for hardcoded data arrays
    - Verify field mappings are correct
    - Document any issues found
    - _Requirements: 5.1, 5.5, 5.7_
  
  - [x] 4.2 Audit calendar page
    - Review `apps/web/src/app/calendar/page.tsx`
    - Verify page fetches data from API endpoint
    - Check for hardcoded data arrays
    - Verify field mappings are correct
    - Document any issues found
    - _Requirements: 5.1, 5.7_
  
  - [x] 4.3 Audit documents page
    - Review `apps/web/src/app/documents/page.tsx`
    - Verify page fetches data from API endpoint
    - Check for hardcoded data arrays
    - Verify field mappings are correct
    - Document any issues found
    - _Requirements: 5.1, 5.7_
  
  - [x] 4.4 Audit remaining list pages
    - Review people, tax-calculations, templates, accounts-production, settings pages
    - Verify all pages fetch data from API endpoints
    - Check for hardcoded data arrays
    - Verify field mappings are correct
    - Document all issues found
    - _Requirements: 5.1, 5.7_
  
  - [x] 4.5 Audit detail pages
    - Review all `[id]/page.tsx` files in each module
    - Verify pages fetch complete records from API
    - Check for hardcoded data or placeholder text
    - Verify related data is fetched and displayed
    - Document all issues found
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 5. Create comprehensive audit report
  - Compile all findings from service, controller, and page audits
  - Categorize issues by severity (critical, high, medium, low)
  - Prioritize fixes based on user impact
  - Create field mapping reference document
  - Document expected vs actual behavior for each issue
  - _Requirements: 9.5_

- [ ] 6. Checkpoint - Review audit findings with stakeholders
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Fix service layer issues
  - [ ] 7.1 Fix services with hardcoded data
    - Replace hardcoded arrays/objects with Prisma queries
    - Ensure all data comes from database
    - Add proper error handling
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [ ] 7.2 Fix services with missing Prisma queries
    - Add Prisma queries for any methods not querying database
    - Ensure correct query parameters and filters
    - Add proper error handling
    - _Requirements: 1.1, 1.2_
  
  - [ ] 7.3 Fix service aggregation methods
    - Ensure aggregation methods query all required tables
    - Verify calculations are correct
    - Add proper error handling
    - _Requirements: 1.3_
  
  - [ ] 7.4 Add error handling to services
    - Add try-catch blocks for Prisma queries
    - Log errors with sufficient context
    - Throw errors instead of returning fallback data
    - _Requirements: 1.5_
  
  - [ ]* 7.5 Write unit tests for fixed services
    - Test that service methods call Prisma with correct parameters
    - Test error handling
    - Mock Prisma to isolate service logic
    - _Requirements: 10.1_

- [ ] 8. Fix API controller issues
  - [ ] 8.1 Fix controllers with hardcoded responses
    - Remove hardcoded response objects
    - Delegate to service methods
    - Return service results directly
    - _Requirements: 2.1, 2.5_
  
  - [ ] 8.2 Fix controllers not calling services
    - Add service method calls
    - Remove any direct database access
    - Add proper HTTP exception handling
    - _Requirements: 2.1_
  
  - [ ] 8.3 Add error handling to controllers
    - Add NotFoundException for missing records
    - Let NestJS handle other exceptions
    - Ensure proper HTTP status codes
    - _Requirements: 2.1_
  
  - [ ]* 8.4 Write integration tests for fixed endpoints
    - Test complete request/response cycle
    - Use test database
    - Verify responses match database state
    - Test error scenarios
    - _Requirements: 10.2_

- [ ] 9. Fix UI page issues
  - [ ] 9.1 Fix pages with hardcoded data
    - Remove hardcoded data arrays
    - Add API calls to fetch data
    - Add loading and error states
    - _Requirements: 5.1, 5.7, 6.1, 6.6_
  
  - [ ] 9.2 Fix pages not calling API
    - Add useEffect hooks to fetch data
    - Use api client for all API calls
    - Add loading and error states
    - _Requirements: 5.1, 6.1_
  
  - [ ] 9.3 Fix field mapping errors
    - Correct field names to match API responses
    - Fix typos in field names
    - Ensure nested fields are accessed correctly
    - _Requirements: 3.2_
  
  - [ ] 9.4 Add null/undefined handling
    - Use nullish coalescing (??) for nullable fields
    - Display "—" or "N/A" for null values
    - Use optional chaining (?.) for nested fields
    - Ensure no "null" or "undefined" text appears
    - _Requirements: 3.4, 8.1, 8.4_
  
  - [ ] 9.5 Add error handling and loading states
    - Add loading indicators while fetching
    - Display error messages for failed requests
    - Add retry mechanism
    - Ensure pages don't crash on errors
    - _Requirements: 8.3, 8.5_
  
  - [ ] 9.6 Fix date formatting
    - Ensure all dates use consistent format (DD/MM/YYYY)
    - Handle null dates gracefully
    - Use toLocaleDateString('en-GB') for formatting
    - _Requirements: 3.5_
  
  - [ ]* 9.7 Write component tests for fixed pages
    - Test that pages fetch from API
    - Test loading and error states
    - Test null handling
    - Test field display
    - _Requirements: 10.3_

- [ ] 10. Verify data consistency across pages
  - [ ] 10.1 Test dashboard vs detail page consistency
    - Verify client counts match between dashboard and clients list
    - Verify service totals match between dashboard and services list
    - Verify task counts match between dashboard and tasks list
    - Document any inconsistencies
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ] 10.2 Test cross-page field consistency
    - Verify client names match across clients list and services list
    - Verify annual fees match across dashboard and client detail
    - Verify task counts match across dashboard and client detail
    - Document any inconsistencies
    - _Requirements: 7.1, 7.4_
  
  - [ ] 10.3 Fix any consistency issues found
    - Ensure same data source for all pages
    - Fix calculation differences
    - Ensure cache invalidation works correctly
    - _Requirements: 7.1, 7.5_

- [ ] 11. Checkpoint - Verify all fixes are complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Write property-based tests
  - [ ]* 12.1 Write property test for Prisma query execution
    - **Property 1: Prisma Query Execution**
    - **Validates: Requirements 1.1, 1.2**
    - Test that service methods execute Prisma queries
    - Mock Prisma and verify it's called
    - Run 100 iterations with random service methods
  
  - [ ]* 12.2 Write property test for API endpoint database sourcing
    - **Property 2: API Endpoint Database Sourcing**
    - **Validates: Requirements 2.1, 2.3, 2.4**
    - Test that API responses match database state
    - Seed database with random data
    - Call endpoints and verify responses match
    - Run 100 iterations with random data
  
  - [ ]* 12.3 Write property test for field mapping consistency
    - **Property 3: Field Mapping Consistency**
    - **Validates: Requirements 3.1**
    - Test that database fields match API response fields
    - Query database directly and compare with API response
    - Run 100 iterations with random records
  
  - [ ]* 12.4 Write property test for UI field mapping correctness
    - **Property 4: UI Field Mapping Correctness**
    - **Validates: Requirements 3.2**
    - Test that UI correctly accesses API response fields
    - Render components with random API responses
    - Verify no undefined or field-not-found errors
    - Run 100 iterations with random data
  
  - [ ]* 12.5 Write property test for null value handling
    - **Property 5: Null Value Handling**
    - **Validates: Requirements 3.4, 8.1**
    - Test that null fields display placeholders
    - Create records with random null fields
    - Render UI and verify no "null" or "undefined" text
    - Run 100 iterations with random null patterns
  
  - [ ]* 12.6 Write property test for date formatting consistency
    - **Property 6: Date Formatting Consistency**
    - **Validates: Requirements 3.5**
    - Test that dates are formatted consistently
    - Create records with random dates
    - Verify all dates use DD/MM/YYYY format
    - Run 100 iterations with random dates
  
  - [ ]* 12.7 Write property test for list filtering accuracy
    - **Property 7: List Filtering Accuracy**
    - **Validates: Requirements 5.6**
    - Test that filtered results match database query
    - Apply random filters
    - Verify displayed records match filter criteria
    - Run 100 iterations with random filters
  
  - [ ]* 12.8 Write property test for related data fetching
    - **Property 8: Related Data Fetching**
    - **Validates: Requirements 6.5**
    - Test that detail pages fetch all related data
    - Create records with random related data
    - Verify all relations are fetched and displayed
    - Run 100 iterations with random relations
  
  - [ ]* 12.9 Write property test for cross-page data consistency
    - **Property 9: Cross-Page Data Consistency**
    - **Validates: Requirements 7.1**
    - Test that same data displays identically across pages
    - Render multiple pages with same data
    - Verify values are identical
    - Run 100 iterations with random data
  
  - [ ]* 12.10 Write property test for data update propagation
    - **Property 10: Data Update Propagation**
    - **Validates: Requirements 7.5**
    - Test that updates propagate to all pages
    - Update database records
    - Refresh pages and verify new values display
    - Run 100 iterations with random updates
  
  - [ ]* 12.11 Write property test for optional field handling
    - **Property 11: Optional Field Graceful Handling**
    - **Validates: Requirements 8.4**
    - Test that missing optional fields don't cause errors
    - Create records with random missing optional fields
    - Render UI and verify no errors
    - Run 100 iterations with random missing fields
  
  - [ ]* 12.12 Write property test for null field robustness
    - **Property 12: Null Field Robustness**
    - **Validates: Requirements 8.5**
    - Test that null fields don't cause crashes
    - Create records with random null fields
    - Render UI and verify no JavaScript errors
    - Run 100 iterations with random null patterns

- [ ] 13. Run comprehensive test suite
  - [ ]* 13.1 Run all unit tests
    - Execute unit tests for all services
    - Verify all tests pass
    - Fix any failing tests
    - _Requirements: 10.1_
  
  - [ ]* 13.2 Run all integration tests
    - Execute integration tests for all endpoints
    - Verify all tests pass
    - Fix any failing tests
    - _Requirements: 10.2_
  
  - [ ]* 13.3 Run all property-based tests
    - Execute all 12 property tests
    - Verify all properties hold
    - Fix any failing properties
    - _Requirements: 10.5_
  
  - [ ]* 13.4 Run all component tests
    - Execute tests for all page components
    - Verify all tests pass
    - Fix any failing tests
    - _Requirements: 10.3_

- [ ] 14. Perform manual testing
  - [ ] 14.1 Test dashboard page
    - Load dashboard and verify all KPIs display
    - Verify no "null" or "undefined" text
    - Verify dates are formatted correctly
    - Verify data matches database
    - Check browser console for errors
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  
  - [ ] 14.2 Test all list pages
    - Load each list page (clients, services, tasks, compliance, etc.)
    - Verify data displays correctly
    - Test filters and verify results
    - Test with empty database
    - Verify no hardcoded data
    - Check browser console for errors
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [ ] 14.3 Test all detail pages
    - Load detail pages for various records
    - Verify all fields display correctly
    - Verify related data displays
    - Verify no placeholder text
    - Test with missing optional fields
    - Check browser console for errors
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ] 14.4 Test data consistency
    - Verify same data displays identically across pages
    - Update data and verify changes propagate
    - Test with various data scenarios
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 14.5 Test error handling
    - Test with API down
    - Test with invalid IDs
    - Test with network errors
    - Verify error messages display
    - Verify retry mechanisms work
    - _Requirements: 8.2, 8.3_

- [ ] 15. Checkpoint - Final verification
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Create documentation
  - [ ] 16.1 Document all changes made
    - List all files modified
    - Describe changes for each file
    - Document any breaking changes
    - Create migration guide if needed
    - _Requirements: 9.5_
  
  - [ ] 16.2 Update coding standards
    - Add guidelines for data fetching
    - Add guidelines for null handling
    - Add guidelines for error handling
    - Add guidelines for field mapping
    - _Requirements: 9.1_
  
  - [ ] 16.3 Create developer guide
    - Document data flow architecture
    - Explain Prisma usage patterns
    - Explain API client usage
    - Explain page component patterns
    - Include code examples
    - _Requirements: 9.1_
  
  - [ ] 16.4 Update field mapping reference
    - Document all database to API mappings
    - Document all API to UI mappings
    - Include examples for each mapping
    - _Requirements: 3.1, 3.2_

- [ ] 17. Final review and handoff
  - Review all changes with team
  - Conduct code walkthrough
  - Answer questions
  - Get sign-off from product owner
  - Close out project

## Notes

- Tasks marked with `*` are optional testing tasks that can be skipped for faster delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout the process
- Property tests validate universal correctness properties across all inputs
- Manual testing provides final verification before handoff
- The audit phase (tasks 1-5) must be completed before fixes begin
- Service layer fixes (task 7) must be completed before API layer fixes (task 8)
- API layer fixes (task 8) must be completed before UI layer fixes (task 9)
- All fixes must be completed before comprehensive testing (tasks 12-14)
