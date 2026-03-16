# College Workflow Management System

A full-stack web app for managing student and staff requests through a role-based approval workflow.

**Stack:** React (frontend) + Node.js/Express (backend) + MySQL

---

## Setup

### Prerequisites
- Node.js
- MySQL 8.0 (root password: configure in `.env`)

### Database Setup

```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p1234 -e "SOURCE backend/db/schema.sql"
```

Or run the schema manually in MySQL Workbench against a fresh `college_workflow` database.

### Backend

```bash
cd backend
npm install
cp .env.example .env   # update DB credentials
npm start              # runs on port 5000
```

### Frontend

```bash
cd frontend
npm install
npm start              # runs on port 3000
```

---

## Default Login Credentials

All passwords are `123`.

### Students
| Username | Department |
|---|---|
| student_cse | CSE |
| student_ece | ECE |
| student_mech | MECH |
| student_civil | CIVIL |
| student_eee | EEE |
| student_it | IT |

### Coordinators
| Username | Department |
|---|---|
| coordinator_cse | CSE |
| coordinator_ece | ECE |
| coordinator_mech | MECH |
| coordinator_civil | CIVIL |
| coordinator_eee | EEE |
| coordinator_it | IT |

### HODs
| Username | Department |
|---|---|
| hod_cse | CSE |
| hod_ece | ECE |
| hod_mech | MECH |
| hod_civil | CIVIL |
| hod_eee | EEE |
| hod_it | IT |

### Director
| Username | Department |
|---|---|
| director | CSE (cross-dept) |

---

## Roles & Permissions

| Role | Can Submit | Can Approve | Sees |
|---|---|---|---|
| STUDENT | Yes (student types) | No | Own requests |
| COORDINATOR | Yes (teacher types) | Yes (step 1) | Pending approvals + dept requests |
| HOD | Yes (teacher types) | Yes (step 2) | Pending approvals + all dept requests |
| DIRECTOR | No | Yes (step 3) | All departments |

---

## Approval Workflows

| Type | Workflow |
|---|---|
| Leave, Lab Access, Assignment Ext, Library Ext | Coordinator only |
| Fee Concession, Certificate, Scholarship, Course Change, Exam Re-eval | Coordinator → HOD |
| Project, Equipment, Research, Industrial Visit, Other | Coordinator → HOD → Director |

---

## Features

- Session-based authentication with bcrypt passwords
- Role-aware dashboards (Student / Coordinator / HOD / Director)
- Grouped request type dropdown (student vs teacher types)
- Priority levels: Low, Medium, High, Urgent
- Quick Approve / Quick Reject from pending approvals table
- Approve/Reject modal with reason/comment input
- Approval history timeline on each request
- Department Requests view for Coordinator & HOD
- All Departments view with department filter tabs for Director
- ESCALATED status displays as PENDING in UI
- File attachment support on requests
- Indian names assigned to all seed users

---

## Ports

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`
