# Requirements Document

## Introduction

The hotel information policies feature is currently experiencing issues where policies are not being saved properly. Users receive conflicting messages ("successfully saved" and "no condition/policy to be saved") and when they return to the page, no conditions are displayed. This is due to database table name mismatches and missing columns in the backend controller.

## Requirements

### Requirement 1

**User Story:** As a hotel administrator, I want to create and save hotel conditions/policies so that they persist in the system and are displayed when I return to the page.

#### Acceptance Criteria

1. WHEN I create a new hotel condition/policy THEN the system SHALL save it to the correct database tables
2. WHEN I save a policy THEN the system SHALL display only one success message
3. WHEN I return to the policies page THEN the system SHALL display all previously saved policies
4. WHEN I save a policy with details THEN the system SHALL properly handle the `default` field in policy item details

### Requirement 2

**User Story:** As a developer, I want the backend controller to use the correct database table names so that data is stored in the proper location.

#### Acceptance Criteria

1. WHEN the controller creates policies THEN it SHALL use table names with the `onboarding_` prefix
2. WHEN inserting policy item details THEN the system SHALL handle the `default` column properly
3. WHEN querying policies THEN the system SHALL retrieve data from the correct tables

### Requirement 3

**User Story:** As a user, I want clear and accurate feedback messages so that I understand the status of my actions.

#### Acceptance Criteria

1. WHEN I save policies successfully THEN the system SHALL display only one success message
2. WHEN there are no policies to save THEN the system SHALL not display a "no policies to save" message alongside a success message
3. WHEN an error occurs THEN the system SHALL display a clear error message explaining what went wrong