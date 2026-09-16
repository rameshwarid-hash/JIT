# ROLE MATRIX — JIT Project Activity Reporting System

> Roles discovered from employee role dropdown, login landing paths, Excel packs, and RBAC E2E specs.  
> Env aliases: `ADMIN_*` → Project Manager; `EMPLOYEE_*` → Field Resource.

---

## Roles Identified

| # | Role (UI) | Portal prefix | Env credentials |
|---|-----------|---------------|-----------------|
| 1 | Super Admin / Super Administrator | `/super-admin` | `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` |
| 2 | Project Manager | `/project-manager` | `ADMIN_EMAIL` / `ADMIN_PASSWORD` |
| 3 | Field Resource | `/field-resource` | `EMPLOYEE_EMAIL` / `EMPLOYEE_PASSWORD` |

**Not found as separate portals:** Manager, Employee, Admin (as distinct products). “Employee” in masters = user record; login role is one of the three above.

---

## 1. Super Admin

### Menus (left nav)

- Dashboard  
- Activity Logs  
- Projects → All Projects, Create Project  
- Masters → Clients, Employees, Vendors  

### Allowed pages

| Path | Access |
|------|--------|
| `/super-admin/dashboard` | Full |
| `/super-admin/activity-logs` | Full |
| `/super-admin/projects` | Full |
| `/super-admin/projects/create` | Full |
| `/super-admin/masters/clients` | Full |
| `/super-admin/masters/vendors` | Full |
| `/super-admin/masters/employees` | Full |
| `/super-admin/users` (card link) | Referenced |

### Restricted pages

- Should not operate as PM/FR for day-to-day field logging as primary persona (can create SA users).  
- No “My Team” PM module (SA has Employees master instead).

### CRUD permissions

| Entity | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| Client | Yes | Yes | Expected | Yes (details) |
| Vendor | Yes | Yes | Expected | TBD |
| Employee/User | Yes | Yes | Expected | TBD |
| Project | Yes (draft + publish) | Yes (all) | Edit if UI available | TBD |
| Activity log | View all | Yes | Comment TBD | TBD |

### Comment permissions

- Can open activity details and view comments.  
- Comment write for SA: treat as **verify** (Excel SA_AD covers permission messaging).

### Notification permissions

- Notifications button + Unread/Read tabs.  
- API: `GET /api/notifications`.

### Log permissions

- System-wide Activity Logs.  
- Filters: search, status, project, user, category, From/To date.  
- Summary cards: Total, Submitted, Draft, Critical, Today.  
- “My Logs” toggle (Excel).

### Project permissions

- Create, draft, publish, assign multiple PMs and FRs.  
- Filters: status, client, manager, vendor, publish state, logs today.  
- Access & Permissions section on create form.

### Approval permissions

- No explicit Approve/Reject workflow verified in automation.  
- Status badges in Excel mention Submitted / Approved / Rejected / Draft — **confirm with product** before asserting approvals.

### Dashboard widgets

- Greeting: Good morning/afternoon/evening, Super Administrator  
- Cards: Activity logged today, Total projects, Total users, Project managers, Total clients, People logged today  
- Recent Activity Logs (+ View All)  
- Projects by Status chart (Active / On Hold / Completed)  
- Clients, Vendors & Employees chart  
- Quick links: Activity Logs, Projects, Clients, Employees, Create Project  
- Critical activity deep-link (`isCritical=true`)

---

## 2. Project Manager

### Menus

- Dashboard  
- Projects  
- Activity Logs  
- My Team  
- Log Activity (from dashboard / nav)

### Allowed pages

| Path | Access |
|------|--------|
| `/project-manager/dashboard` | Full |
| `/project-manager/projects` | Assigned only |
| `/project-manager/activity-logs` | Team / assigned scope |
| `/project-manager/my-team` | Full |
| Log Activity (PM) | Assigned projects |

### Restricted pages

| Path | Expected |
|------|----------|
| `/super-admin/dashboard` | Denied / redirect |
| `/super-admin/masters/clients` | Denied → stay in `/project-manager/` |
| `/super-admin/masters/vendors` | Denied |
| `/super-admin/projects` | Denied |
| `/super-admin/projects/create` | Denied |
| `/super-admin/masters/employees` | Denied |
| Field Resource–only draft UX | N/A |

### CRUD permissions

| Entity | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| Project | No | Assigned only | No edit/delete (Excel PM_PRJ_025) | No |
| Activity | Yes (own log) | Assigned team | Draft own | No delete of others |
| Comment | Yes (Post Comment) | Yes | TBD | TBD |
| Client/Vendor/Employee masters | No | No (SA only) | No | No |

### Comment permissions

- **Write:** Post Comment on activity details.  
- Blank comment should be blocked.  
- May attach files to comments (Excel).  
- Chronological comment history with name/role/timestamp.

### Notification permissions

- Header notifications expected (verify presence).

### Log permissions

- View activity logs for assigned projects/team.  
- Search + status/project/user/category/date filters.  
- Open details; see Critical badge.  
- Counters: Total, Submitted, Draft, Critical, Today.

### Project permissions

- Read-only list of assigned projects.  
- Detail tabs: Overview, Users, Documents, Activity Logs.  
- Cannot create/publish projects.

### Approval permissions

- Review / comment; formal Approve/Reject **not proven** in current automation — exploratory gap.

### Dashboard widgets

- Total Projects (assigned)  
- Logs Today  
- My Draft Logs  
- Critical Logs  
- Team Members  
- Quick links: Projects, Activity Logs, My Team, Log Activity  
- Recent Activity Logs  
- Top Active Team Members  
- Logs Submitted graph  

---

## 3. Field Resource

### Menus

- Dashboard  
- My Projects  
- Log Activity  
- Activity Logs (incl. drafts / critical deep links)

### Allowed pages

| Path | Access |
|------|--------|
| `/field-resource/dashboard` | Full |
| `/field-resource/projects` | Assigned only |
| `/field-resource/log-activity` | Assigned projects only |
| `/field-resource/activity-logs` | Own / assigned scope |

### Restricted pages

| Path | Expected |
|------|----------|
| Any `/super-admin/*` | Denied → `/field-resource/` |
| `/project-manager/my-team` | Denied |
| `/project-manager/*` | Denied |
| Project edit/delete | Hidden |
| Comment input | Hidden / permission message |

### CRUD permissions

| Entity | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| Project | No | Assigned | No | No |
| Activity | Yes (submit/draft) | Own | Edit draft → submit | TBD |
| Comment | **No** | May be limited on staging | No | No |
| Masters | No | No | No | No |

### Comment permissions

- Message pattern: “You do not have permission to comment…”  
- Staging risk: PM comments may not appear (`Comments (0)`).

### Notification permissions

- Notification icon on dashboard (Excel FR_DB_028).

### Log permissions

- Submit activity, save draft, edit/submit draft.  
- Mark critical.  
- View own activity list / drafts / critical filters.  
- Cannot see unassigned projects in Log Activity dropdown.

### Project permissions

- My Projects read-only.  
- Overview / Users / Documents / Activity Logs tabs.  
- Sync of SA updates (notes) expected.

### Approval permissions

- None (submitter only).

### Dashboard widgets

- Total / Active Projects  
- Logs Today, Draft Logs, Critical Logs  
- Quick actions: My Projects, Activity Logs, Drafts, Critical, Log Activity  
- Assigned project cards (code, name, location, PM, status)  
- Recent Activity Logs  

---

## Cross-Role Permission Matrix (summary)

| Capability | SA | PM | FR |
|------------|----|----|----|
| System dashboard KPIs | Yes | Scoped | Scoped |
| Create Client/Vendor | Yes | No | No |
| Create Employee + assign role | Yes | No | No |
| Create / Publish Project | Yes | No | No |
| View all projects | Yes | No (assigned) | No (assigned) |
| Edit project (if UI exists) | Yes | No | No |
| Log Activity | Possible as user | Yes (assigned) | Yes (assigned) |
| Save Draft Activity | — | Yes | Yes |
| Mark Critical | — | Yes | Yes |
| View Activity Logs | All | Team/assigned | Own/assigned |
| Post Comment | Verify | Yes | No |
| View PM Comment as FR | — | — | **Inconsistent on staging** |
| My Team | No | Yes | No |
| Notifications | Yes | Yes | Yes |
| Direct URL to foreign portal | Block | Block | Block |
| Access after logout | Block | Block | Block |

---

## Landing & JWT

| Role | Home path | Token keys |
|------|-----------|------------|
| Super Admin | `/super-admin/dashboard` | `ji_access_token`, `ji_refresh_token` |
| Project Manager | `/project-manager/dashboard` | same |
| Field Resource | `/field-resource/dashboard` | same |

---

*Document owner: QA Architecture — Phase 2*
