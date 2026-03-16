# Design Document: College Workflow Management System

## Overview

The College Workflow Management System is a full-stack web application that allows students and staff to submit requests and route them through a role-based approval hierarchy. Built on React + Express + MySQL.

**Key capabilities:**
- 14 request types across three workflow tiers (Simple / Medium / Complex)
- Four roles: STUDENT, COORDINATOR, HOD, DIRECTOR
- Six departments: CSE, ECE, MECH, CIVIL, EEE, IT
- Priority levels: LOW, MEDIUM, HIGH, URGENT
- Optional file attachment per request
- Immutable approval history with comments
- Role-aware dashboards and views
- Session-based auth with 30-minute timeout

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend (port 3000)            │
│  Login → Dashboard → Requests / Approvals / Detail       │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/axios (withCredentials)
┌────────────────────▼────────────────────────────────────┐
│                  Express Backend (port 5000)             │
│  /api/auth          /api/requests                        │
│  Session middleware │ Role middleware │ Upload middleware │
└────────────────────┬────────────────────────────────────┘
                     │ mysql2 connection pool
┌────────────────────▼────────────────────────────────────┐
│                    MySQL Database                        │
│  users  │  requests  │  approval_history                 │
└─────────────────────────────────────────────────────────┘
```

---

## Workflow Routing

```
Type                                    Tier      Chain
──────────────────────────────────────────────────────────────────
LEAVE, LAB_ACCESS,                      Simple    COORDINATOR
  ASSIGNMENT_EXT, LIBRARY_EXT

FEE_CONCESSION, CERTIFICATE,            Medium    COORDINATOR → HOD
  SCHOLARSHIP, COURSE_CHANGE, EXAM_REEVAL

PROJECT, EQUIPMENT, RESEARCH,           Complex   COORDINATOR → HOD → DIRECTOR
  INDUSTRIAL_VISIT, OTHER
```

Each approval step either:
- **Approves with next role remaining** → status = `ESCALATED`, `current_role` advances, history entry `action = ESCALATED`
- **Approves at final step** → status = `APPROVED`, history entry `action = APPROVED`
- **Rejects at any step** → status = `REJECTED`, history entry `action = REJECTED`

The UI always displays `ESCALATED` as `PENDING`.

---

## Backend Components

### `backend/middleware/auth.js`
Checks `req.session.user` exists; attaches to `req.user`. Returns 401 if missing.

### `backend/middleware/role.js`
Factory: `requireRole(...roles)` — returns 403 if `req.user.role` not in allowed list.

### `backend/middleware/upload.js`
Multer middleware for single file upload; stores to `backend/uploads/`.

### `backend/routes/auth.js`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Validate credentials, create session |
| POST | `/api/auth/logout` | Destroy session, clear cookie |
| GET  | `/api/auth/me` | Return current session user |

### `backend/routes/requests.js`
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/api/requests` | ALL | Create request; routes to COORDINATOR |
| GET  | `/api/requests` | ALL | List requests filtered by role |
| GET  | `/api/requests/department` | COORDINATOR, HOD | All requests in own department |
| GET  | `/api/requests/all-departments` | DIRECTOR | All requests across all departments |
| GET  | `/api/requests/:id` | ALL | Single request + full approval history |
| POST | `/api/requests/:id/approve` | COORDINATOR, HOD, DIRECTOR | Approve or escalate |
| POST | `/api/requests/:id/reject` | COORDINATOR, HOD, DIRECTOR | Reject with comment |

**GET /api/requests filtering logic:**
- STUDENT → own requests only
- COORDINATOR → dept requests where `current_role = COORDINATOR` and status IN (PENDING, ESCALATED)
- HOD → dept requests where `current_role = HOD` and status IN (PENDING, ESCALATED)
- DIRECTOR → all requests where `current_role = DIRECTOR` and status IN (PENDING, ESCALATED)

### `backend/config/workflow.js`
Exports `WORKFLOW_MAP` — the single source of truth for approval chains.

### `backend/db.js`
MySQL2 connection pool; exports a promise-based `query(sql, params)` helper.

---

## Frontend Components

### `Login.js`
Dark glass card. Username/password form. Demo users panel. Generic error message on failure.

### `Dashboard.js`
Role-aware layout:
- **Student**: total/pending stats, Submit Request + My Requests cards, workflow reference
- **Coordinator/HOD**: pending count, Pending Approvals + Department Requests + Submit Request cards
- **Director**: pending count, Pending Approvals + All Departments cards

### `CreateRequest.js`
Grouped request type dropdown (student types vs teacher types based on role). Title, department, priority selector (4 buttons), description textarea, optional file upload.

### `Requests.js`
- **Approvers**: table view of pending approvals with Quick Approve / Quick Reject inline actions
- **Students**: card view of own request history with status badges

### `ClassRequests.js`
Table of all requests in the Coordinator/HOD's department (all statuses). Accessible from dashboard.

### `AllDepartments.js`
Director-only. Table of all requests across all departments with department filter tabs (ALL + 6 depts).

### `RequestDetail.js`
Full request detail with:
- Request Information card (type, dept, priority, status)
- Workflow Information card (submitter, current approver, final approver, workflow chain with active step highlighted)
- Request Details card (description, document download link)
- Approve / Reject buttons (shown only to the current approver)
- Approve/Reject modal with optional/required comment textarea
- Approval History timeline (dot per action, actor name + role, action badge, comment, timestamp)

---

## Data Models

### Database Schema

```sql
CREATE TABLE users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50)  NOT NULL UNIQUE,
  name       VARCHAR(100),                    -- display name, falls back to username
  password   VARCHAR(255) NOT NULL,           -- bcrypt hash
  role       ENUM('STUDENT','COORDINATOR','HOD','DIRECTOR') NOT NULL,
  department ENUM('CSE','ECE','MECH','CIVIL','EEE','IT') NOT NULL
);

CREATE TABLE requests (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(200) NOT NULL,
  description  TEXT NOT NULL,
  type         ENUM('LEAVE','LAB_ACCESS','ASSIGNMENT_EXT','LIBRARY_EXT',
                    'FEE_CONCESSION','CERTIFICATE','SCHOLARSHIP','COURSE_CHANGE','EXAM_REEVAL',
                    'PROJECT','EQUIPMENT','RESEARCH','INDUSTRIAL_VISIT','OTHER') NOT NULL,
  status       ENUM('PENDING','ESCALATED','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  current_role ENUM('COORDINATOR','HOD','DIRECTOR') NOT NULL DEFAULT 'COORDINATOR',
  department   ENUM('CSE','ECE','MECH','CIVIL','EEE','IT') NOT NULL,
  document     VARCHAR(200),                  -- uploaded filename, nullable
  priority     ENUM('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
  created_by   INT NOT NULL REFERENCES users(id),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE approval_history (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL REFERENCES requests(id),
  actor_id   INT NOT NULL REFERENCES users(id),
  actor_role ENUM('COORDINATOR','HOD','DIRECTOR') NOT NULL,
  action     ENUM('APPROVED','REJECTED','ESCALATED') NOT NULL,
  comment    TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Workflow Map

```js
const WORKFLOW_MAP = {
  LEAVE:            ['COORDINATOR'],
  LAB_ACCESS:       ['COORDINATOR'],
  ASSIGNMENT_EXT:   ['COORDINATOR'],
  LIBRARY_EXT:      ['COORDINATOR'],
  FEE_CONCESSION:   ['COORDINATOR', 'HOD'],
  CERTIFICATE:      ['COORDINATOR', 'HOD'],
  SCHOLARSHIP:      ['COORDINATOR', 'HOD'],
  COURSE_CHANGE:    ['COORDINATOR', 'HOD'],
  EXAM_REEVAL:      ['COORDINATOR', 'HOD'],
  PROJECT:          ['COORDINATOR', 'HOD', 'DIRECTOR'],
  EQUIPMENT:        ['COORDINATOR', 'HOD', 'DIRECTOR'],
  RESEARCH:         ['COORDINATOR', 'HOD', 'DIRECTOR'],
  INDUSTRIAL_VISIT: ['COORDINATOR', 'HOD', 'DIRECTOR'],
  OTHER:            ['COORDINATOR', 'HOD', 'DIRECTOR'],
}
```

### Session Shape

```js
req.session.user = {
  id:         number,
  username:   string,
  name:       string | null,
  role:       'STUDENT' | 'COORDINATOR' | 'HOD' | 'DIRECTOR',
  department: 'CSE' | 'ECE' | 'MECH' | 'CIVIL' | 'EEE' | 'IT'
}
```

---

## API Response Shapes

**Request (list view)**
```json
{
  "id": 1,
  "title": "Lab Access for Final Year Project",
  "type": "LAB_ACCESS",
  "status": "PENDING",
  "current_role": "COORDINATOR",
  "department": "CSE",
  "priority": "HIGH",
  "created_by_username": "student_cse",
  "created_by_name": "student_cse",
  "created_at": "2025-01-15T10:00:00Z"
}
```

**Request (detail view)**
```json
{
  "id": 1,
  "title": "Lab Access for Final Year Project",
  "type": "LAB_ACCESS",
  "status": "ESCALATED",
  "current_role": "HOD",
  "department": "CSE",
  "priority": "HIGH",
  "description": "Need access to the ML lab...",
  "document": "upload_abc123.pdf",
  "created_by_username": "student_cse",
  "created_at": "2025-01-15T10:00:00Z",
  "approval_history": [
    {
      "actor_name": "coordinator_cse",
      "actor_role": "COORDINATOR",
      "action": "ESCALATED",
      "comment": "Approved, forwarding to HOD",
      "created_at": "2025-01-15T11:00:00Z"
    }
  ]
}
```

---

## Error Handling

| Scenario | HTTP Status | Response |
|----------|-------------|----------|
| No session / expired session | 401 | `{ "error": "Not authenticated" }` |
| Invalid login credentials | 401 | `{ "error": "Invalid credentials" }` |
| Insufficient role | 403 | `{ "error": "Forbidden" }` |
| Wrong department | 403 | `{ "error": "Forbidden" }` |
| Missing required fields | 400 | `{ "error": "..." }` |
| Invalid type enum | 400 | `{ "error": "Invalid type. Must be one of: ..." }` |
| Already finalised request | 400 | `{ "error": "Request is already finalised" }` |
| Wrong current_role for approver | 403 | `{ "error": "Forbidden" }` |
| Request not found / not visible | 404 | `{ "error": "Not found" }` |
| Database / unexpected error | 500 | `{ "error": "Internal server error" }` |

Stack traces and SQL details are never exposed in error responses.

---

## Correctness Properties

### Property 1: Valid login always creates a session
For any user record, submitting correct credentials returns HTTP 200 and sets a session cookie.

### Property 2: Invalid credentials always return a generic error
For any wrong username or password, login returns HTTP 401 with the same message regardless of which field is wrong.

### Property 3: Logout invalidates the session
After logout, any subsequent request to a protected endpoint with the old cookie returns HTTP 401.

### Property 4: Unauthenticated and unauthorized requests are denied
No session → 401. Valid session but wrong role → 403.

### Property 5: Students only see their own requests
`GET /api/requests` for a student returns only requests where `created_by` matches that student's ID.

### Property 6: Coordinators and HODs are scoped to their department
Every request in their list has `department` equal to their own. Acting on a different department's request returns 403.

### Property 7: Director sees requests from all departments
`GET /api/requests` for a Director returns requests from all six departments.

### Property 8: All requests start at PENDING / COORDINATOR
Any newly created request has `status = PENDING` and `current_role = COORDINATOR` regardless of type.

### Property 9: Approval advances current_role correctly
Approving a non-final step sets `current_role` to the next role in `WORKFLOW_MAP` and records `action = ESCALATED`.

### Property 10: Final approval sets status to APPROVED
Approving the last step in the chain sets `status = APPROVED` and records `action = APPROVED`.

### Property 11: Rejection at any step terminates the workflow
Rejecting at any step sets `status = REJECTED` and records `action = REJECTED` with the provided comment.

### Property 12: Approval history entries contain all required fields
Every history entry has: `actor_name`, `actor_role`, `action`, `created_at`, `comment` (nullable).

### Property 13: Already-finalised requests cannot be acted on
Approving or rejecting a request with status APPROVED or REJECTED returns HTTP 400.
