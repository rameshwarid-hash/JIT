# BUSINESS RULES — JIT Project Activity Reporting System

> Inferred from Excel TC packs, page objects, API assertions, and E2E workflows.  
> Rules marked **[OBSERVED DEFECT]** or **[UNVERIFIED]** need product confirmation before treating as pass criteria.

---

## 1. Authentication & Session

| ID | Rule |
|----|------|
| AUTH-01 | Valid credentials return HTTP 200, `success: true`, and an access token. |
| AUTH-02 | Access token is stored in `sessionStorage` as `ji_access_token` (refresh as `ji_refresh_token`). |
| AUTH-03 | Successful login leaves `/login` and lands on role home path. |
| AUTH-04 | Invalid credentials keep user on `/login` and show an error/alert. |
| AUTH-05 | Logout clears session/local storage and returns to `/login` with no access token. |
| AUTH-06 | After logout, direct navigation to role dashboard redirects to `/login`. |
| AUTH-07 | Remember me and Forgot Password controls exist on login (full behaviour **[UNVERIFIED]**). |
| AUTH-08 | Session is tab/session scoped (sessionStorage), not cookie-based SPA auth. |

---

## 2. Role-Based Access

| ID | Rule |
|----|------|
| RBAC-01 | Only three assignable roles: Super Administrator, Project Manager, Field Resource. |
| RBAC-02 | Each role has an isolated URL namespace (`/super-admin`, `/project-manager`, `/field-resource`). |
| RBAC-03 | PM cannot open SA masters/clients/create-project; redirect into PM portal. |
| RBAC-04 | FR cannot open SA masters or PM My Team; redirect into FR portal. |
| RBAC-05 | Unauthenticated users cannot access any role dashboard. |
| RBAC-06 | Menu items must match role (SA Masters; PM My Team; FR Log Activity / My Projects). |
| RBAC-07 | **[UNVERIFIED]** API must reject unauthorized resource access even if UI is bypassed. |

---

## 3. Dashboard

### Super Admin

| ID | Rule |
|----|------|
| SA-DASH-01 | Greeting uses time-of-day + “Super Administrator”. |
| SA-DASH-02 | Summary cards must match `/api/dashboard` values. |
| SA-DASH-03 | `active + on_hold + completed === projects.total`. |
| SA-DASH-04 | Clients + Vendors + Employees chart totals reconcile to master totals. |
| SA-DASH-05 | Active counts never exceed totals. |
| SA-DASH-06 | Recent activity log IDs are unique. |
| SA-DASH-07 | Critical card deep-link includes `isCritical=true`. |
| SA-DASH-08 | Quick links navigate to correct modules. |
| SA-DASH-09 | Layout remains usable on tablet/mobile (Open menu on mobile). |

### Project Manager / Field Resource

| ID | Rule |
|----|------|
| PM-DASH-01 | KPIs reflect **assigned** scope only (projects, logs, team). |
| FR-DASH-01 | KPIs reflect **assigned** projects and **own** logs/drafts/critical. |
| FR-DASH-02 | Project cards show code, name, location, PM, status. |
| BOTH-DASH-01 | Recent logs order newest-first **[VERIFY]**. |

---

## 4. Clients (Super Admin)

| ID | Rule |
|----|------|
| CL-01 | Client Name is mandatory; blank must not POST `/api/clients`. |
| CL-02 | Contact email must be valid format; invalid must not POST. |
| CL-03 | Client Code is auto-generated and disabled on create. |
| CL-04 | New client defaults to **Active**. |
| CL-05 | Successful create → HTTP 201, `success: true`, code generated, success message. |
| CL-06 | Search by name/code; invalid search → empty / “No clients found”. |
| CL-07 | Status filter: All / Active / Inactive. |
| CL-08 | Details: Overview + Users tabs; status/code/email visible. |
| CL-09 | Delete requires confirmation; Cancel must not DELETE. |
| CL-10 | Columns: Name, Code, Users, Contact Email, Phone, Status. |
| CL-11 | **[OBSERVED DEFECT]** Duplicate name `Internal QA` may still return 201. |
| CL-12 | **[OBSERVED DEFECT]** Alphabetic phone may be accepted by API. |
| CL-13 | **[OBSERVED DEFECT]** Pagination may request page 2 while UI `aria-current` / Showing stays on page 1. |
| CL-14 | **[OBSERVED DEFECT]** No column sort / `aria-sort` support. |

---

## 5. Vendors (Super Admin)

| ID | Rule |
|----|------|
| VN-01 | Vendor Name mandatory. |
| VN-02 | Code auto-generated / disabled. |
| VN-03 | Invalid email rejected (dialog remains open at minimum). |
| VN-04 | Status filter All / Active / Inactive. |
| VN-05 | Phone validation expected for non-numeric **[VERIFY — may share client defect]**. |
| VN-06 | Cancel closes without save. |
| VN-07 | New vendor searchable after create. |
| VN-08 | Unauthorized roles cannot open Vendors URL. |

---

## 6. Employees / Users (Super Admin)

| ID | Rule |
|----|------|
| EM-01 | First name mandatory. |
| EM-02 | Email must be valid; password required on create. |
| EM-03 | Role must be one of: Super Administrator, Project Manager, Field Resource. |
| EM-04 | Role filter on list: All / Field Resource / Project Manager. |
| EM-05 | Optional phone and location. |
| EM-06 | Add Gate Pass control exists **[behaviour UNVERIFIED]**. |
| EM-07 | Successful create closes dialog; user searchable by email. |
| EM-08 | Empty state text may say “No users found” (not “employees”). |
| EM-09 | Columns: User, Code, Email, Role, Status, Phone. |

---

## 7. Projects

### Create / Publish (SA)

| ID | Rule |
|----|------|
| PRJ-01 | Mandatory: Project Name, Project Code, Project Location. |
| PRJ-02 | Project Code must be unique; duplicate rejected **[VERIFY]**. |
| PRJ-03 | Client and Vendor selectable from masters. |
| PRJ-04 | One or more Project Managers can be assigned (“N managers selected”). |
| PRJ-05 | One or more Field Resources / team members can be assigned. |
| PRJ-06 | Save as Draft keeps project unpublished. |
| PRJ-07 | Create/Publish → POST `/api/projects` 200/201 and leave create route. |
| PRJ-08 | Access & Permissions and Project Documents sections exist. |
| PRJ-09 | Cancel abandons create without publish. |
| PRJ-10 | Name max length / trim spaces **[BOUNDARY — Excel]**. |

### List / Filters (SA)

| ID | Rule |
|----|------|
| PRJ-20 | Statuses: All, Active, On Hold, Completed. |
| PRJ-21 | Publish State: Draft, Published. |
| PRJ-22 | Filters: Client, Manager, Vendor, Logs Today, Users Logged Today. |
| PRJ-23 | Clear filters restores full list. |
| PRJ-24 | Combined filters AND together. |
| PRJ-25 | Search by name, code, partial; invalid → empty state. |
| PRJ-26 | Table shows name, code, status, manager, client, members, logs today, users logged today. |

### Role visibility

| ID | Rule |
|----|------|
| PRJ-30 | PM sees only assigned projects; no create/edit/delete. |
| PRJ-31 | FR sees only assigned projects; no create/edit/delete. |
| PRJ-32 | SA project updates (notes/location) sync to PM and FR views. |
| PRJ-33 | Detail tabs: Overview, Users, Documents, Activity Logs. |
| PRJ-34 | **[RISK]** Edit control may be missing on staging (E2E_008 skip). |

---

## 8. Activity Logging

| ID | Rule |
|----|------|
| ACT-01 | Project dropdown lists **only assigned** projects for PM/FR. |
| ACT-02 | Work Performed is mandatory (rich text / contenteditable). |
| ACT-03 | Changing project may auto-update Work Location **[VERIFY]**. |
| ACT-04 | Activity date defaults to current date. |
| ACT-05 | Categories include at least: Electrical, Plumbing, Civil, Mechanical, Inspection, General, Other. |
| ACT-06 | Mark Critical toggles critical flag; visible as Critical badge to reviewers. |
| ACT-07 | Photos accept image (PNG/JPG); Documents accept PDF. |
| ACT-08 | Unsupported types (e.g. EXE) and oversized files (>10MB Excel) rejected. |
| ACT-09 | Save Draft creates Draft status; Submit creates Submitted. |
| ACT-10 | Draft can be opened, edited, and submitted. |
| ACT-11 | Time Spent accepts valid duration; invalid formats rejected **[VERIFY]**. |
| ACT-12 | Remarks have character limit (~300) **[VERIFY]**. |
| ACT-13 | Materials/Tools optional. |
| ACT-14 | Success feedback shown after submit/draft. |
| ACT-15 | Submitted activity appears in Activity Logs / Recent logs. |
| ACT-16 | Double-submit / multi-click must not create duplicates **[RISK]**. |

---

## 9. Activity Logs (list & details)

| ID | Rule |
|----|------|
| LOG-01 | Search across logs, projects, users, work summary. |
| LOG-02 | Filters: Status, Project, User, Category, From/To date. |
| LOG-03 | From > To is invalid (validation or empty) **[VERIFY]**. |
| LOG-04 | Summary cards: Total, Submitted, Draft, Critical, Today — match list scope. |
| LOG-05 | SA “My Logs” toggle restricts to current user. |
| LOG-06 | Row click opens Activity Details dialog. |
| LOG-07 | Details show project name/code/location, status, priority/critical, category, dates, logged by, work performed, attachments, comments. |
| LOG-08 | Comment count matches visible comments. |
| LOG-09 | PDF/image attachments viewable/downloadable. |
| LOG-10 | Close (X) / Escape dismisses dialog. |
| LOG-11 | Pagination Next/Previous/page size updates list and Showing label. |
| LOG-12 | Unauthorized role cannot open SA Activity Logs URL. |

---

## 10. Comments

| ID | Rule |
|----|------|
| CMT-01 | PM can Post Comment on activity details. |
| CMT-02 | Blank comment blocked. |
| CMT-03 | Character limit enforced **[VERIFY]**. |
| CMT-04 | Comments show author name, role, timestamp, body. |
| CMT-05 | Order chronological. |
| CMT-06 | FR cannot post; permission message shown. |
| CMT-07 | **[OBSERVED DEFECT / INCONSISTENCY]** FR may not see PM comments on staging. |
| CMT-08 | Comment attachments supported for PM **[Excel — VERIFY]**. |

---

## 11. Notifications

| ID | Rule |
|----|------|
| NTF-01 | Notifications dialog opens from header. |
| NTF-02 | Tabs: Unread and Read. |
| NTF-03 | Close dismisses dialog. |
| NTF-04 | Feed loaded via `/api/notifications`. |
| NTF-05 | Mark-as-read / deep-link behaviour **[UNVERIFIED]**. |

---

## 12. My Team (Project Manager)

| ID | Rule |
|----|------|
| TEAM-01 | Cards: Total Members, Active Reporters, Critical Logs, Reports This Month. |
| TEAM-02 | Search by member name; filter by Project / Activity. |
| TEAM-03 | List shows Name, Email, Phone, Assigned Projects, Submitted, Critical, Last Activity. |
| TEAM-04 | View opens Team Member Details (profile, projects, recent activities). |
| TEAM-05 | View All Activities navigates to filtered Activity Logs. |
| TEAM-06 | FR cannot access My Team. |

---

## 13. Date / Timezone

| ID | Rule |
|----|------|
| DT-01 | Activity date defaults to “today” in user/local business timezone **[VERIFY]**. |
| DT-02 | Date filters inclusive of From/To boundaries **[VERIFY]**. |
| DT-03 | Displayed timestamps consistent across list vs details vs comments. |
| DT-04 | Cross-midnight submissions attributed to correct calendar day **[EDGE]**. |

---

## 14. Uploads

| ID | Rule |
|----|------|
| UP-01 | Photos tab for images; Documents tab for PDFs. |
| UP-02 | Drag-and-drop supported **[Excel]**. |
| UP-03 | Max size ~10MB **[Excel]**. |
| UP-04 | Uploaded files appear on activity details with name/size/thumbnail. |

---

## 15. Validation Rules (cross-cutting)

| ID | Rule |
|----|------|
| VAL-01 | Required fields show validation and must not call create APIs. |
| VAL-02 | Email format validated client and/or server. |
| VAL-03 | Phone should reject non-numeric **[DEFECT if accepted]**. |
| VAL-04 | Unique codes for projects; auto codes for clients/vendors. |
| VAL-05 | Cancel never persists. |
| VAL-06 | Destructive actions require confirmation dialog. |

---

## 16. Potential Product Bugs (document before automation)

1. Client pagination UI desync vs API page.  
2. Client phone accepts letters.  
3. Duplicate client names allowed.  
4. No sort on client list.  
5. FR comment read path inconsistent.  
6. Project Edit missing → update sync untestable.  
7. Employee empty-state copy inconsistency.  
8. Formal Approve/Reject workflow unclear vs badge labels.

---

*Document owner: QA Architecture — Phase 3*
