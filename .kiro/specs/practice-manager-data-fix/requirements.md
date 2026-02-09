# Requirements Document: Practice Manager Data Display Fix

## Introduction

This specification addresses data display issues in the M-Practice-Manager application where pages may be showing hardcoded data instead of actual database data. The system uses a NestJS API (port 3001) with PostgreSQL/Prisma ORM for data persistence, and a Next.js web UI (port 3000) for presentation. This fix ensures all pages correctly display data from the PostgreSQL database through the complete data flow: Database → Prisma → NestJS Services → API Controllers → Next.js Pages → UI.

## Glossary

- **System**: The M-Practice-Manager application (API + Web UI)
- **API**: The NestJS backend service running on port 3001
- **Web_UI**: The Next.js frontend application running on port 3000
- **Database**: The PostgreSQL database accessed via Prisma ORM
- **Service**: A NestJS service module that queries the database
- **Page**: A Next.js page component that displays data to users
- **API_Endpoint**: A REST API route exposed by the NestJS backend
- **Prisma_Query**: A database query executed through the Prisma ORM
- **Data_Flow**: The complete path from database to UI display
- **Field_Mapping**: The correspondence between database fields and UI display fields
- **Hardcoded_Data**: Static data embedded in code rather than fetched from database

## Requirements

### Requirement 1: Database Query Verification

**User Story:** As a developer, I want to verify that all API services correctly query the PostgreSQL database through Prisma, so that the application displays real data instead of hardcoded values.

#### Acceptance Criteria

1. WHEN an API service method is called, THE System SHALL execute a Prisma query against the PostgreSQL database
2. WHEN a Prisma query executes, THE System SHALL return actual database records, not mock or hardcoded data
3. WHEN a service aggregates data from multiple sources, THE System SHALL query all required database tables through Prisma
4. THE System SHALL NOT contain hardcoded data arrays or objects that simulate database responses in service methods
5. WHEN a database query fails, THE System SHALL return an appropriate error response, not fallback hardcoded data

### Requirement 2: API Endpoint Response Validation

**User Story:** As a developer, I want to verify that all API endpoints return database-sourced data, so that the Web UI receives accurate information.

#### Acceptance Criteria

1. WHEN an API endpoint is called, THE System SHALL return data retrieved from database queries
2. WHEN the dashboard KPIs endpoint is called, THE System SHALL aggregate data from clients, services, tasks, compliance, and calendar tables
3. WHEN a list endpoint is called, THE System SHALL return all matching records from the database with correct field mappings
4. WHEN a detail endpoint is called, THE System SHALL return the complete record with all related data from the database
5. THE System SHALL NOT return hardcoded response objects from API controllers

### Requirement 3: Field Mapping Correctness

**User Story:** As a developer, I want to ensure that database field names correctly map to API response fields and UI display fields, so that data displays accurately without field mismatch errors.

#### Acceptance Criteria

1. WHEN the API returns data, THE System SHALL map database field names to API response field names correctly
2. WHEN the Web UI receives API data, THE System SHALL map API response fields to UI display fields correctly
3. WHEN a Prisma model field is renamed or changed, THE System SHALL update all corresponding API and UI field references
4. THE System SHALL handle optional fields (nullable database columns) without displaying undefined or null in the UI
5. WHEN date fields are retrieved from the database, THE System SHALL format them consistently for UI display

### Requirement 4: Dashboard Data Accuracy

**User Story:** As a user, I want the dashboard to display accurate real-time metrics from the database, so that I can make informed decisions based on current data.

#### Acceptance Criteria

1. WHEN the dashboard loads, THE System SHALL fetch KPI data from the `/dashboard/kpis` endpoint
2. WHEN the dashboard service calculates KPIs, THE System SHALL query actual client, service, task, and compliance counts from the database
3. WHEN the dashboard displays client metrics, THE System SHALL show the actual count of active, inactive, and new clients from the database
4. WHEN the dashboard displays service metrics, THE System SHALL calculate total annual fees from actual service records in the database
5. WHEN the dashboard displays task metrics, THE System SHALL count actual open, in-progress, completed, and overdue tasks from the database
6. WHEN the dashboard displays compliance metrics, THE System SHALL count actual pending, overdue, and filed compliance items from the database
7. THE System SHALL NOT display placeholder or example values on the dashboard

### Requirement 5: List Page Data Accuracy

**User Story:** As a user, I want all list pages (clients, services, tasks, compliance, documents) to display actual database records, so that I can view and manage real data.

#### Acceptance Criteria

1. WHEN a list page loads, THE System SHALL fetch data from the appropriate API endpoint
2. WHEN the clients list page loads, THE System SHALL display all client records from the database with correct field values
3. WHEN the services list page loads, THE System SHALL display all service records with correct client names, fees, and frequencies from the database
4. WHEN the tasks list page loads, THE System SHALL display all task records with correct client names, due dates, and statuses from the database
5. WHEN the compliance list page loads, THE System SHALL display all compliance items with correct due dates and statuses from the database
6. WHEN a list page applies filters, THE System SHALL query the database with filter criteria and display matching records
7. THE System SHALL NOT display hardcoded example rows in list tables

### Requirement 6: Detail Page Data Accuracy

**User Story:** As a user, I want detail pages to display complete and accurate information from the database, so that I can view all details about a specific record.

#### Acceptance Criteria

1. WHEN a detail page loads, THE System SHALL fetch the complete record from the database via the API
2. WHEN a client detail page loads, THE System SHALL display all client fields including profile data, parties, services, and tasks from the database
3. WHEN a service detail page loads, THE System SHALL display service details including client information, fee structure, and related tasks from the database
4. WHEN a task detail page loads, THE System SHALL display task details including client information, service information, and assignee from the database
5. WHEN related data is displayed on a detail page, THE System SHALL fetch and display actual related records from the database
6. THE System SHALL NOT display placeholder text or example values on detail pages

### Requirement 7: Data Consistency Across Pages

**User Story:** As a user, I want data to be consistent across different pages, so that I see the same information regardless of where I view it.

#### Acceptance Criteria

1. WHEN the same data is displayed on multiple pages, THE System SHALL show identical values from the database
2. WHEN a client's annual fees are displayed on the dashboard and the client detail page, THE System SHALL show the same calculated value
3. WHEN a task count is displayed on the dashboard and the tasks list page, THE System SHALL show the same count from the database
4. WHEN a client name is displayed on the clients list and the services list, THE System SHALL show the same name from the database
5. WHEN data is updated in the database, THE System SHALL reflect the updated values on all pages after refresh

### Requirement 8: Error Handling for Missing Data

**User Story:** As a user, I want the application to handle missing or null data gracefully, so that pages display properly even when some data is unavailable.

#### Acceptance Criteria

1. WHEN a database field is null, THE System SHALL display a placeholder (e.g., "—" or "N/A") instead of "null" or "undefined"
2. WHEN a related record is missing, THE System SHALL display an appropriate message instead of causing an error
3. WHEN an API request fails, THE System SHALL display an error message to the user instead of showing stale or hardcoded data
4. WHEN optional fields are missing, THE System SHALL hide or gracefully handle the missing data in the UI
5. THE System SHALL NOT crash or display JavaScript errors when database fields are null or undefined

### Requirement 9: Audit and Verification Process

**User Story:** As a developer, I want a systematic process to audit all pages and API endpoints, so that I can identify and fix any data display issues.

#### Acceptance Criteria

1. THE System SHALL provide a checklist of all pages and API endpoints to audit
2. WHEN auditing a page, THE System SHALL verify that data is fetched from an API endpoint, not hardcoded
3. WHEN auditing an API endpoint, THE System SHALL verify that data is queried from the database via Prisma
4. WHEN auditing field mappings, THE System SHALL verify that database fields correctly map to API responses and UI displays
5. THE System SHALL document any identified issues with specific file paths and line numbers

### Requirement 10: Testing and Validation

**User Story:** As a developer, I want automated tests to verify data flow from database to UI, so that I can ensure data accuracy is maintained over time.

#### Acceptance Criteria

1. WHEN a service method is tested, THE System SHALL verify that it executes Prisma queries against the database
2. WHEN an API endpoint is tested, THE System SHALL verify that it returns data from service methods, not hardcoded responses
3. WHEN a page component is tested, THE System SHALL verify that it fetches data from API endpoints
4. WHEN field mappings are tested, THE System SHALL verify that database fields correctly map through the entire data flow
5. THE System SHALL include integration tests that verify end-to-end data flow from database to UI display
