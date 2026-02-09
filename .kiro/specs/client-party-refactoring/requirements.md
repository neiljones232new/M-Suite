# Requirements Document

## Introduction

This document specifies the requirements for refactoring the client-party relationship model in the Practice Manager application. The current architecture stores directors in a separate `people` table, creating complexity and limiting functionality. The refactored model will store directors as individual clients, enabling them to be managed as full clients with services, tasks, and the ability to be linked to multiple companies.

## Glossary

- **Client**: An entity (company or individual) that receives services from the firm, stored in the `clients` table
- **Company_Client**: A client record with type COMPANY (e.g., id `4P001`)
- **Individual_Client**: A client record with type INDIVIDUAL representing a person (e.g., id `4P001A`)
- **Director**: An individual who serves as a director of one or more companies
- **Client_Parties_Table**: A many-to-many linking table that connects Company_Clients to Individual_Clients
- **Party_Reference**: A unique identifier for a party relationship (e.g., `4P001A` for the first director of company `4P001`)
- **Companies_House**: UK government registry providing company and director information
- **Person_Table**: Legacy table that currently stores director information (to be deprecated)
- **Related_Client_Id**: Foreign key in client_parties table pointing to an Individual_Client record
- **Party_Role**: The type of relationship between a company and an individual (DIRECTOR, SHAREHOLDER, etc.)

## Requirements

### Requirement 1: Individual Client Creation

**User Story:** As a system administrator, I want directors to be stored as individual clients, so that they can be managed with the full capabilities of the client system.

#### Acceptance Criteria

1. WHEN a director is imported from Companies House, THE System SHALL create an Individual_Client record in the clients table
2. WHEN creating an Individual_Client for a director, THE System SHALL assign a client code derived from the parent company code with an alphabetic suffix (e.g., `4P001A`, `4P001B`)
3. WHEN an Individual_Client is created, THE System SHALL set the client type field to INDIVIDUAL
4. WHEN storing director information, THE System SHALL store name, email, and phone in the Individual_Client record fields
5. THE System SHALL NOT create new records in the Person_Table for directors imported after this refactoring

### Requirement 2: Client-Party Relationship Management

**User Story:** As a system administrator, I want the client_parties table to act as a pure many-to-many linking table, so that directors can be linked to multiple companies without data duplication.

#### Acceptance Criteria

1. WHEN linking a director to a company, THE System SHALL create a record in the Client_Parties_Table with both clientId and relatedClientId
2. THE Client_Parties_Table SHALL store the Party_Reference in the partyRef field
3. THE Client_Parties_Table SHALL store the Party_Role in the role field (e.g., DIRECTOR, SHAREHOLDER)
4. WHEN a director serves multiple companies, THE System SHALL create multiple Client_Parties_Table records with the same relatedClientId
5. THE System SHALL allow querying all companies for a given director by filtering Client_Parties_Table on relatedClientId
6. THE System SHALL allow querying all directors for a given company by filtering Client_Parties_Table on clientId

### Requirement 3: Companies House Import Integration

**User Story:** As a user importing company data, I want the system to automatically create director clients and link them to the company, so that I don't have to manually manage director relationships.

#### Acceptance Criteria

1. WHEN importing a company from Companies_House, THE System SHALL create a Company_Client record with the company information
2. WHEN importing a company with directors, THE System SHALL create an Individual_Client record for each director
3. WHEN creating director Individual_Clients during import, THE System SHALL generate sequential alphabetic suffixes (A, B, C, etc.)
4. WHEN importing directors, THE System SHALL create Client_Parties_Table records linking each director to the company
5. WHEN importing directors, THE System SHALL set the Party_Role to DIRECTOR in the Client_Parties_Table records
6. IF a director already exists as an Individual_Client, THE System SHALL reuse the existing Individual_Client record and create only the Client_Parties_Table link

### Requirement 4: Schema Migration

**User Story:** As a database administrator, I want to migrate existing person records to the new client-based model, so that all historical data is preserved and accessible.

#### Acceptance Criteria

1. THE System SHALL provide a migration script that converts Person_Table records to Individual_Client records
2. WHEN migrating a person record, THE System SHALL generate an appropriate client code based on the associated company
3. WHEN migrating person records, THE System SHALL update Client_Parties_Table records to use relatedClientId instead of personId
4. THE migration script SHALL preserve all existing relationship data between companies and directors
5. WHEN migration is complete, THE System SHALL verify that all Client_Parties_Table records have valid relatedClientId values
6. THE migration script SHALL create a backup of the Person_Table and Client_Parties_Table before making changes

### Requirement 5: Multi-Company Director Support

**User Story:** As a user managing directors, I want a single director to be linkable to multiple companies, so that I can accurately represent real-world business relationships.

#### Acceptance Criteria

1. WHEN a director serves multiple companies, THE System SHALL allow creating multiple Client_Parties_Table records with the same relatedClientId
2. WHEN displaying a director's profile, THE System SHALL show all companies they are associated with
3. WHEN displaying a company's directors, THE System SHALL show all Individual_Clients linked via Client_Parties_Table
4. THE System SHALL allow adding an existing Individual_Client as a director to a new company
5. THE System SHALL allow removing a director from one company without affecting their relationships with other companies

### Requirement 6: Director Client Management

**User Story:** As a user managing clients, I want directors to have full client capabilities, so that I can assign services, create tasks, and manage them like any other client.

#### Acceptance Criteria

1. WHEN viewing an Individual_Client record for a director, THE System SHALL display all standard client fields and capabilities
2. THE System SHALL allow assigning services to Individual_Client records
3. THE System SHALL allow creating tasks for Individual_Client records
4. THE System SHALL allow adding notes and documents to Individual_Client records
5. WHEN searching for clients, THE System SHALL include Individual_Client records in search results

### Requirement 7: User Interface Updates

**User Story:** As a user viewing company information, I want to see director relationships clearly displayed, so that I understand the company structure.

#### Acceptance Criteria

1. WHEN viewing a Company_Client, THE System SHALL display a list of all linked directors with their names and roles
2. WHEN viewing an Individual_Client who is a director, THE System SHALL display a list of all companies they are associated with
3. THE System SHALL provide a way to add an existing Individual_Client as a director to a company
4. THE System SHALL provide a way to create a new Individual_Client and link them as a director in one operation
5. THE System SHALL provide a way to remove a director relationship without deleting the Individual_Client record

### Requirement 8: Data Integrity and Validation

**User Story:** As a system administrator, I want the system to maintain data integrity in the refactored model, so that relationships remain consistent and valid.

#### Acceptance Criteria

1. THE System SHALL enforce that relatedClientId in Client_Parties_Table references a valid Individual_Client
2. THE System SHALL enforce that clientId in Client_Parties_Table references a valid Company_Client
3. THE System SHALL prevent deletion of an Individual_Client if they have active Client_Parties_Table relationships
4. THE System SHALL validate that Party_Reference values are unique within the context of a company
5. WHEN a Client_Parties_Table record is created, THE System SHALL validate that the Party_Role is a valid enum value
