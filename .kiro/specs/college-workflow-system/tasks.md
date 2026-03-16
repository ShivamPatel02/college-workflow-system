# Implementation Plan: College Workflow Management System

## Overview

Incrementally extend the existing React + Express codebase with a MySQL database layer, role-based access control, three-tier workflow routing, immutable approval history, and secure session management.

## Tasks

- [x] 1. Set up database layer and schema
  - Create `backend/db.js` with a mysql2 connection pool and a promise-based query helper
  - Write `backend/db/schema.sql` with the `users`, `requests`, and `approval_history` table definitions (ENUMs, foreign keys, defaults)
  - Define and export `WORKFLOW_MAP` constant in `backend/config/workflow.js`
  - _Requirements: 3.1, 4.1, 5.1, 6.1_

- [x] 2. Implement authentication backend
  - [x] 2.1 Extend `backend/routes/auth.js` with DB-backed login, logout, and `/me` endpoints
    - `POST /api/auth/login`: query users table, bcrypt compare, create session with `req.session.user`; return generic 401 for any failure
    - `POST /api/auth/logout`: destroy session, clear cookie
    - `GET /api/auth/me`: return `req.session.user` or 401
    - Configure `express-session` with `httpOnly`, `sameSite: 'strict'`, `maxAge: 1800000`, no `resave`
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 8.1, 8.4, 8.5_

  - [ ]* 2.2 Write unit tests for auth routes (`backend/__tests__/auth.unit.test.js`)
    - Valid credentials → 200 + cookie
    - Invalid credentials → 401 with generic message
    - Logout → subsequent request returns 401
    - `Set-Cookie` header has `HttpOnly` and `SameSite=Strict`
    - Session `maxAge` is exactly 1800000ms
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 8.1_

  - [ ]* 2.3 Write property tests for auth (`backend/__tests__/auth.prop.test.js`)
    - **Property 1: Valid login always creates a session**
    - **Validates: Requirements 1.1**
    - **Property 2: Invalid credentials always return a generic error**
    - **Validates: Requirements 1.2**
    - **Property 3: Logout invalidates the session**
    - **Validates: Requirements 1.5**
    - **Property 8: New session token on each login**
    - **Validates: Requirements 8.4**

- [x] 3. Implement auth and role middleware
  - [x] 3.1 Extend `backend/middleware/auth.js` to check `req.session.user` and attach to `req.user`; return 401 if missing
    - Reset session inactivity timer on every authenticated request (`req.session.touch()`)
    - _Requirements: 1.3, 1.6, 8.2, 8.3_

  - [x] 3.2 Create `backend/middleware/role.js` with `requireRole(...roles)` factory; return 403 if role not in list
    - _Requirements: 2.1, 2.6_

  - [x] 3.3 Create `backend/middleware/department.js` to restrict Coordinators and HODs to their own department; Directors bypass
    - _Requirements: 2.3, 2.4, 3.3, 3.4_

  - [ ]* 3.4 Write property tests for access control (`backend/__tests__/auth.prop.test.js`)
    - **Property 4: Unauthenticated and unauthorized requests are denied**
    - **Validates: Requirements 1.6, 2.6**

- [x] 4. Implement request creation and listing
  - [x] 4.1 Extend `backend/routes/requests.js` with `POST /api/requests` (STUDENT only)
    - Validate required fields (`title`, `description`, `type`); return 400 on missing/invalid
    - Insert into `requests` table with `status = PENDING`, `current_role = COORDINATOR`, `department` from session
    - _Requirements: 4.1, 5.1, 6.1_

  - [x] 4.2 Implement `GET /api/requests` with role-based filtering
    - STUDENT: only own requests (`created_by = req.user.id`)
    - COORDINATOR/HOD: requests in their department matching `current_role`
    - DIRECTOR: all requests
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 3.3, 3.4_

  - [ ]* 4.3 Write unit tests for request routes (`backend/__tests__/requests.unit.test.js`)
    - `WORKFLOW_MAP` simple types have exactly 1 approver role
    - `WORKFLOW_MAP` medium types have exactly 2 approver roles
    - `WORKFLOW_MAP` complex types have exactly 3 approver roles
    - _Requirements: 4.4, 5.5, 6.6_

  - [ ]* 4.4 Write property tests for request listing (`backend/__tests__/requests.prop.test.js`)
    - **Property 5: Students only see their own requests**
    - **Validates: Requirements 2.2**
    - **Property 6: Coordinators and HODs are scoped to their department**
    - **Validates: Requirements 2.3, 2.4, 3.3**
    - **Property 7: Director sees requests from all departments**
    - **Validates: Requirements 2.5, 3.4**
    - **Property 9: All requests are initially routed to the Coordinator**
    - **Validates: Requirements 4.1, 5.1, 6.1**

- [x] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement approval and rejection workflow
  - [x] 6.1 Implement `GET /api/requests/:id` returning request + full `approval_history` array
    - Return 404 if not found or not visible to current user
    - _Requirements: 7.4, 7.5_

  - [x] 6.2 Implement `POST /api/requests/:id/approve`
    - Gate with `requireRole` and `department` middleware
    - Return 400 if request is already APPROVED or REJECTED
    - Look up next role in `WORKFLOW_MAP`; if next role exists: set `current_role`, insert ESCALATED history entry; if no next role: set `status = APPROVED`, insert APPROVED history entry
    - _Requirements: 4.2, 5.2, 5.3, 6.2, 6.3, 6.4, 7.2_

  - [x] 6.3 Implement `POST /api/requests/:id/reject`
    - Gate with `requireRole` and `department` middleware
    - Return 400 if request is already APPROVED or REJECTED
    - Set `status = REJECTED`, insert REJECTED history entry with comment
    - _Requirements: 4.3, 5.4, 6.5, 7.2_

  - [ ]* 6.4 Write property tests for workflow (`backend/__tests__/requests.prop.test.js`)
    - **Property 10: Approval escalates to the next role in the chain**
    - **Validates: Requirements 4.2, 5.2, 5.3, 6.2, 6.3, 6.4**
    - **Property 11: Rejection at any step terminates the workflow**
    - **Validates: Requirements 4.3, 5.4, 6.5**
    - **Property 12: Approval history entries contain all required fields**
    - **Validates: Requirements 7.2**
    - **Property 13: Request detail always includes status and full history**
    - **Validates: Requirements 7.4, 7.5**

  - [ ]* 6.5 Write unit tests for approval history immutability (`backend/__tests__/requests.unit.test.js`)
    - No DELETE or UPDATE endpoint exists for `approval_history`
    - Approval history entries are never modified after creation
    - _Requirements: 7.3_

- [x] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement frontend role-aware views
  - [x] 8.1 Extend `Dashboard.js` to call `GET /api/auth/me` on mount and render role-appropriate navigation links
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 8.2 Extend `CreateRequest.js` with a `requestType` dropdown (Leave, Lab Access, Fee Concession, Certificate, Project, Equipment); restrict visibility to STUDENT role
    - _Requirements: 4.1, 5.1, 6.1_

  - [x] 8.3 Extend `Requests.js` to display the role-filtered request list from `GET /api/requests`
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

  - [x] 8.4 Create `RequestDetail.js` showing the approval history timeline and, for approvers, approve/reject action buttons that call the respective endpoints
    - _Requirements: 7.4, 7.5_

  - [x] 8.5 Extend `Login.js` to display a generic error message that does not reveal which field is wrong
    - _Requirements: 1.2_

- [x] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use [fast-check](https://github.com/dubzzz/fast-check) with a minimum of 100 iterations each
- Unit tests use Jest + Supertest
- All error responses follow `{ "error": "<message>" }` — never expose stack traces or SQL details
