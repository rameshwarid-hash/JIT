# Manual Test Cases — Projects & Create Project

| Field | Value |
|-------|-------|
| Module | Projects |
| Roles | SA (CRUD), PM/FR (read assigned) |

---

## Positive — Create / Publish (SA)

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| PRJ-P-01 | Open create | Projects → Create | Form sections visible |
| PRJ-P-02 | Publish happy path | Name, code, location, client, vendor, PM, FR → Create | POST 200/201; listed in All Projects |
| PRJ-P-03 | Save as Draft | Fill minimum → Draft | Draft publish state; not forced live |
| PRJ-P-04 | Multi PM assign | Select 2 managers | “N managers selected” |
| PRJ-P-05 | Multi FR assign | Select 2 FRs | Both assigned |
| PRJ-P-06 | Search by name/code | All Projects search | Row with name+code |
| PRJ-P-07 | Status filters | Active / On Hold / Completed | Correct subset |
| PRJ-P-08 | Publish state filter | Draft / Published | Correct subset |
| PRJ-P-09 | Combined filters | Status+Client+Manager | AND behaviour |
| PRJ-P-10 | Clear filters | Apply many → Clear | Full list |

## Positive — Role views

| ID | Scenario | Role | Expected |
|----|----------|------|----------|
| PRJ-P-20 | Assigned only | PM | Only assigned projects |
| PRJ-P-21 | Assigned only | FR | My Projects = assigned |
| PRJ-P-22 | Overview tab | PM/FR | Description, location, client, vendor, managers, counts |
| PRJ-P-23 | Users / Documents / Activity Logs tabs | PM/FR | Content loads |
| PRJ-P-24 | SA update notes sync | SA edit → PM/FR view | Updated notes visible |

## Negative

| ID | Scenario | Expected |
|----|----------|----------|
| PRJ-N-01 | Blank name/code/location | Validation; no publish |
| PRJ-N-02 | Duplicate project code | Reject |
| PRJ-N-03 | Invalid search | Empty state |
| PRJ-N-04 | PM create project URL | Denied |
| PRJ-N-05 | FR edit/delete controls | Absent |
| PRJ-N-06 | FR sees unassigned project | Must not |

## Boundary

| ID | Scenario | Expected |
|----|----------|----------|
| PRJ-B-01 | Max project name | Limit enforced |
| PRJ-B-02 | Leading/trailing spaces in name | Trim or reject |
| PRJ-B-03 | Very long description/notes | Handled |
| PRJ-B-04 | Code length limit | Enforce (E2E uses ≤24) |

## UI / A11y

| ID | Scenario | Expected |
|----|----------|----------|
| PRJ-U-01 | Table columns complete | Name, code, status, manager, client, members, logs today… |
| PRJ-U-02 | Status badges | Correct colours |
| PRJ-U-03 | Breadcrumb | Dashboard > Projects |
| PRJ-A-01 | Create form labels | All inputs labelled |
| PRJ-A-02 | Keyboard through assign search | Usable |

## Permission / Security

| ID | Scenario | Expected |
|----|----------|----------|
| PRJ-R-01 | PM cannot DELETE project via UI | No control |
| PRJ-R-02 | API create with PM token | 403 |
| PRJ-R-03 | FR GET unassigned project by ID | 403/404 |
| PRJ-S-01 | Documents upload on create | Authz + virus/type checks **[VERIFY]** |

## Regression

| ID | Scenario | Expected |
|----|----------|----------|
| PRJ-G-01 | E2E_001 setup | Masters + publish + searchable |
| PRJ-G-02 | E2E_002 PM sees project | Assignment correct |
| PRJ-G-03 | E2E_008 notes sync | If Edit exists; else log bug |

## Performance

| ID | Scenario | Expected |
|----|----------|----------|
| PRJ-PF-01 | Large project list scroll/page | Smooth; pagination OK |

## Exploratory / Edge

| ID | Scenario | Notes |
|----|----------|-------|
| PRJ-E-01 | Publish without client/vendor | Document required vs optional |
| PRJ-E-02 | Assign then deactivate employee | Project still lists user? |
| PRJ-E-03 | Double-click Create Project | Single record only |
| PRJ-E-04 | Edit missing on staging | File as product gap |
| PRJ-E-05 | Access & Permissions section | Toggle behaviours |
| PRJ-E-06 | Logs Today / Users Logged Today filters | Correct membership |
