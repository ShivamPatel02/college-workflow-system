# Requirements Document

## Introduction

A college workflow management system that enables students and staff to submit requests and route them through a role-based approval hierarchy. The system supports 14 request types across three workflow tiers, six departments, priority levels, and file attachments. It enforces access control via session-based authentication and provides real-time tracking of request status and full approval history.

## Glossary

- **System**: The College Workflow Management System
- **User**: Any authenticated person interacting with the system
- **Student**: A college student who initiates workflow requests
- **Coordinator**: Department-level staff; first approver in all workflows
- **HOD**: Head of Department; approves medium and complex requests after the Coordinator
- **Director**: Highest authority; approves complex requests after the HOD; views all departments
- **Department**: One of six supported departments: CSE, ECE, MECH, CIVIL, EEE, IT
- **Request**: A workflow item submitted by any user
- **Priority**: Urgency level of a request: LOW, MEDIUM, HIGH, or URGENT
- **Simple_Workflow**: Coordinator only (Leave, Lab Access, Assignment Extension, Library Extension)
- **Medium_Workflow**: Coordinator → HOD (Fee Concession, Certificate, Scholarship, Course Change, Exam Re-evaluation)
- **Complex_Workflow**: Coordinator → HOD → Director (Project, Equipment, Research, Industrial Visit, Other)
- **Session**: An authenticated user session with a 30-minute inactivity timeout
- **Approval_History**: Immutable log of all approval, rejection, and escalation actions on a request
- **Status**: Current state of a request: PENDING, ESCALATED, APPROVED, or REJECTED
- **ESCALATED**: Internal status meaning the request has been forwarded to the next approver; displayed as PENDING in the UI

---

## Requirements

### Requirement 1: User Authentication

**User Story:** As a User, I want to log in with my credentials so that I can securely access the system according to my role.

#### Acceptance Criteria

1. WHEN a User submits valid credentials, THE System SHALL authenticate the User and create a Session with a 30-minute inactivity timeout.
2. WHEN a User submits invalid credentials, THE System SHALL return a generic error message without revealing which field is incorrect.
3. WHEN a Session has been inactive for 30 minutes, THE System SHALL invalidate the Session and require the User to log in again.
4. THE System SHALL store Session tokens in secure, HttpOnly cookies with SameSite set to Strict.
5. WHEN a User logs out, THE System SHALL immediately invalidate the Session and clear the Session cookie.
6. IF a User attempts to access a protected resource without a valid Session, THE System SHALL return 401 Unauthorized.

---

### Requirement 2: Role-Based Access Control

**User Story:** As a system administrator, I want each role to have clearly defined permissions so that Users can only perform actions appropriate to their role.

#### Acceptance Criteria

1. THE System SHALL enforce a four-level role hierarchy: STUDENT, COORDINATOR, HOD, DIRECTOR.
2. WHEN a Student is authenticated, THE System SHALL permit the Student to submit new Requests and view only their own Requests.
3. WHEN a Coordinator is authenticated, THE System SHALL permit the Coordinator to view and act on Requests assigned to the Coordinator within their Department, view all Requests in their Department, and submit their own Requests.
4. WHEN an HOD is authenticated, THE System SHALL permit the HOD to view and act on Requests escalated to the HOD within their Department, view all Requests in their Department, and submit their own Requests.
5. WHEN a Director is authenticated, THE System SHALL permit the Director to view and act on Requests escalated to the Director across all Departments, and view all Requests across all Departments.
6. IF a User attempts to perform an action outside their role permissions, THE System SHALL return 403 Forbidden.

---

### Requirement 3: Multi-Department Support

**User Story:** As a college administrator, I want the system to support all six departments so that each department manages its own workflows independently.

#### Acceptance Criteria

1. THE System SHALL support the following Departments: CSE, ECE, MECH, CIVIL, EEE, IT.
2. THE System SHALL associate every User with exactly one Department.
3. WHILE a Coordinator or HOD is processing a Request, THE System SHALL restrict them to Requests belonging to their own Department.
4. THE System SHALL allow the Director to access Requests from all Departments without restriction.

---

### Requirement 4: Request Types and Priority

**User Story:** As a User, I want to choose from a categorised list of request types and set a priority level so that my request is routed correctly and handled with appropriate urgency.

#### Acceptance Criteria

1. THE System SHALL support 14 request types: LEAVE, LAB_ACCESS, ASSIGNMENT_EXT, LIBRARY_EXT, FEE_CONCESSION, CERTIFICATE, SCHOLARSHIP, COURSE_CHANGE, EXAM_REEVAL, PROJECT, EQUIPMENT, RESEARCH, INDUSTRIAL_VISIT, OTHER.
2. THE System SHALL present request types grouped by workflow tier in the submission form.
3. THE System SHALL support four priority levels: LOW, MEDIUM, HIGH, URGENT; defaulting to MEDIUM if not specified.
4. THE System SHALL allow any authenticated User to attach an optional document file to a Request.
5. THE System SHALL require a title and description for every Request.

---

### Requirement 5: Simple Workflow

**User Story:** As a User, I want simple requests to be resolved by the Coordinator alone so that routine approvals are fast.

#### Acceptance Criteria

1. WHEN a Request of type LEAVE, LAB_ACCESS, ASSIGNMENT_EXT, or LIBRARY_EXT is submitted, THE System SHALL create it with Status PENDING and route it to the Department Coordinator.
2. WHEN the Coordinator approves a Simple_Workflow Request, THE System SHALL set Status to APPROVED.
3. WHEN the Coordinator rejects a Simple_Workflow Request, THE System SHALL set Status to REJECTED and record the reason in Approval_History.

---

### Requirement 6: Medium Workflow

**User Story:** As a User, I want medium-complexity requests to be reviewed by both the Coordinator and HOD so that departmental oversight is maintained.

#### Acceptance Criteria

1. WHEN a Request of type FEE_CONCESSION, CERTIFICATE, SCHOLARSHIP, COURSE_CHANGE, or EXAM_REEVAL is submitted, THE System SHALL create it with Status PENDING and route it to the Department Coordinator.
2. WHEN the Coordinator approves a Medium_Workflow Request, THE System SHALL escalate it to the HOD and record an ESCALATED entry in Approval_History.
3. WHEN the HOD approves a Medium_Workflow Request, THE System SHALL set Status to APPROVED.
4. WHEN the Coordinator or HOD rejects a Medium_Workflow Request, THE System SHALL set Status to REJECTED and record the reason in Approval_History.

---

### Requirement 7: Complex Workflow

**User Story:** As a User, I want complex requests to be reviewed at all authority levels so that high-impact decisions have full institutional sign-off.

#### Acceptance Criteria

1. WHEN a Request of type PROJECT, EQUIPMENT, RESEARCH, INDUSTRIAL_VISIT, or OTHER is submitted, THE System SHALL create it with Status PENDING and route it to the Department Coordinator.
2. WHEN the Coordinator approves a Complex_Workflow Request, THE System SHALL escalate it to the HOD and record an ESCALATED entry in Approval_History.
3. WHEN the HOD approves a Complex_Workflow Request, THE System SHALL escalate it to the Director and record an ESCALATED entry in Approval_History.
4. WHEN the Director approves a Complex_Workflow Request, THE System SHALL set Status to APPROVED.
5. WHEN any approver rejects a Complex_Workflow Request, THE System SHALL set Status to REJECTED and record the reason in Approval_History.

---

### Requirement 8: Approval Actions with Comments

**User Story:** As an approver, I want to add a comment when approving or rejecting a request so that my reasoning is recorded for transparency.

#### Acceptance Criteria

1. WHEN an approver approves a Request, THE System SHALL accept an optional comment and record it in Approval_History.
2. WHEN an approver rejects a Request, THE System SHALL accept an optional comment and record it in Approval_History; the UI SHALL prompt the approver to provide a rejection reason before submitting.
3. THE System SHALL prevent any approver from acting on a Request that is already APPROVED or REJECTED.
4. THE System SHALL prevent an approver from acting on a Request whose current_role does not match their role.

---

### Requirement 9: Request Tracking and Approval History

**User Story:** As a User, I want to see the real-time status and full history of any Request I am involved in so that I can stay informed about progress.

#### Acceptance Criteria

1. THE System SHALL record every approval, rejection, and escalation action in Approval_History with: actor name, actor role, action type, timestamp, and comment.
2. THE Approval_History SHALL be immutable; no User SHALL be permitted to modify or delete existing entries.
3. WHEN a User views a Request detail, THE System SHALL display the current Status, all Request metadata, and the complete Approval_History in chronological order.
4. THE System SHALL display the ESCALATED status as PENDING in all UI views.
5. THE System SHALL show the full approval workflow chain and highlight the current active step on the Request detail page.

---

### Requirement 10: Role-Aware Dashboards

**User Story:** As a User, I want a dashboard tailored to my role so that I can quickly access the actions most relevant to me.

#### Acceptance Criteria

1. WHEN a Student logs in, THE System SHALL display total request count, pending count, and links to submit a new request and view request history.
2. WHEN a Coordinator or HOD logs in, THE System SHALL display pending approval count and links to Pending Approvals, Department Requests, and Submit Request.
3. WHEN a Director logs in, THE System SHALL display pending approval count and links to Pending Approvals and All Departments view.
4. THE System SHALL display the approval workflow reference on all dashboards.

---

### Requirement 11: Department and Cross-Department Views

**User Story:** As an approver, I want a dedicated view of all requests in my scope so that I can monitor overall department activity beyond just my pending queue.

#### Acceptance Criteria

1. WHEN a Coordinator or HOD accesses the Department Requests view, THE System SHALL display all Requests in their Department regardless of status or current_role.
2. WHEN a Director accesses the All Departments view, THE System SHALL display all Requests across all Departments with a department filter tab bar.
3. WHEN a Coordinator or HOD views their own submitted Requests, THE System SHALL make those Requests accessible via the Department Requests view; the Pending Approvals view SHALL only surface Requests awaiting that approver's action and SHALL NOT include Requests submitted by that approver.

---

### Requirement 12: Session Management

**User Story:** As a security administrator, I want sessions to expire after inactivity so that unattended sessions cannot be exploited.

#### Acceptance Criteria

1. THE System SHALL set the Session inactivity timeout to exactly 30 minutes (1,800,000 ms).
2. THE System SHALL issue a new Session token on each successful login and SHALL NOT reuse previously invalidated tokens.
3. THE System SHALL use HttpOnly, SameSite=Strict session cookies.
4. WHEN running in production, THE System SHALL set the Secure flag on session cookies.

---

### Requirement 13: Seed Data for Development and Demo

**User Story:** As a developer, I want the database to be pre-populated with representative users and departments so that the system can be demonstrated and tested without manual setup.

#### Acceptance Criteria

1. THE System SHALL provide a seed script that inserts at least one User per role (STUDENT, COORDINATOR, HOD, DIRECTOR) for each supported Department.
2. THE seed script SHALL populate all required User fields, including username, password hash, role, department, and name.
3. THE seed script SHALL be idempotent; running it multiple times SHALL NOT create duplicate records.

---

### Requirement 14: API Response Consistency

**User Story:** As a frontend developer, I want all API responses for Request lists to include consistent fields so that the UI can render data without special-casing per role.

#### Acceptance Criteria

1. WHEN the System returns a Request list to any authenticated User, THE System SHALL include both `created_by_username` and `created_by_name` fields in each Request object.
2. THE System SHALL use the same Request object shape across all list endpoints regardless of the requesting User's role.
