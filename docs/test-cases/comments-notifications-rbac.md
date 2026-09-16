# Manual Test Cases — Comments, Notifications, My Team, RBAC

---

# A. Comments

| ID | Scenario | Role | Steps | Expected |
|----|----------|------|-------|----------|
| CMT-P-01 | Post valid comment | PM | Open activity → type → Post Comment | Comment visible with name/role/time |
| CMT-P-02 | Comment with attachment | PM | Attach PDF/image + post | Both saved |
| CMT-P-03 | View history | PM/SA | Multiple comments | Chronological |
| CMT-N-01 | Blank comment | PM | Post empty | Blocked |
| CMT-N-02 | Whitespace-only | PM | Spaces only | Blocked |
| CMT-N-03 | FR post comment | FR | Look for input | Hidden + permission message |
| CMT-B-01 | Max length | PM | 1000+ chars | Limit enforced |
| CMT-B-02 | Rapid double Post | PM | Double-click | Single comment |
| CMT-R-01 | FR reads PM comment | FR | Open same activity | **Should see text**; log defect if Comments (0) |
| CMT-S-01 | XSS in comment body | PM | `<script>alert(1)</script>` | Escaped |
| CMT-S-02 | Comment on foreign activity via API | PM/FR | Other project ID | 403 |
| CMT-G-01 | E2E_004 / 005 | PM then FR | Propagation | Document staging gap |
| CMT-A-01 | Comment field labelled | PM | A11y tree | Accessible name |
| CMT-E-01 | Count vs list | Any | Comments (N) | N equals visible items |
| CMT-U-01 | Long comment wrap | Any | Long text | Wrap/scroll OK |

---

# B. Notifications

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| NTF-P-01 | Open panel | Click Notifications | Dialog heading Notifications |
| NTF-P-02 | Unread tab | Select Unread | Unread items / empty state |
| NTF-P-03 | Read tab | Select Read | Read items / empty state |
| NTF-P-04 | Close | Close control | Dialog dismissed |
| NTF-P-05 | API load | Observe network | GET `/api/notifications` 200 |
| NTF-N-01 | API 401 | Clear token → open | Error / login |
| NTF-R-01 | Role-specific content | SA vs PM vs FR | Only relevant notifications |
| NTF-U-01 | Badge count | Create triggering event | Badge updates **[VERIFY]** |
| NTF-E-01 | Mark read | Open item | Moves to Read **[VERIFY]** |
| NTF-E-02 | Deep link | Click notification | Correct entity |
| NTF-A-01 | Dialog keyboard | Tab/Esc | Operable |
| NTF-PF-01 | Large inbox | Many notifications | Scrolls / pages |

---

# C. My Team (Project Manager)

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| TEAM-P-01 | Page load | Open My Team | Summary cards + list |
| TEAM-P-02 | Search member | Name e.g. Rahul | Match |
| TEAM-P-03 | Project filter | Select project | Members for project |
| TEAM-P-04 | Combined filters | Search+Project+Activity | Correct AND |
| TEAM-P-05 | View member | View | Profile + projects + recent activities |
| TEAM-P-06 | View activity from member | View on activity | Activity details |
| TEAM-P-07 | View All Activities | Click | Logs filtered to member |
| TEAM-P-08 | Activities button from list | Click | Member logs |
| TEAM-N-01 | FR opens My Team URL | `/project-manager/my-team` | Denied |
| TEAM-N-02 | SA may not have My Team | SA nav | No PM My Team (uses Employees) |
| TEAM-U-01 | Columns complete | Inspect | Name, Email, Phone, Projects, Submitted, Critical, Last Activity |
| TEAM-B-01 | Member with zero activities | Open | Empty recent state |
| TEAM-S-01 | Member details IDOR | Other PM’s team IDs | 403 |
| TEAM-E-01 | Card totals vs list | Compare | Reconcile |
| TEAM-A-01 | Dialog close focus | Close X | Focus returns |

---

# D. RBAC & Permissions (cross-cutting)

| ID | Scenario | Actor | Target | Expected |
|----|----------|-------|--------|----------|
| RBAC-P-01 | SA clients allowed | SA | `/super-admin/masters/clients` | 200 UI |
| RBAC-N-01 | PM clients denied | PM | same | Redirect `/project-manager/` |
| RBAC-N-02 | FR clients denied | FR | same | Redirect `/field-resource/` |
| RBAC-N-03 | PM create project denied | PM | `/super-admin/projects/create` | Not on create URL |
| RBAC-N-04 | FR my-team denied | FR | `/project-manager/my-team` | Not on my-team |
| RBAC-N-05 | PM SA vendors | PM | vendors URL | Denied |
| RBAC-N-06 | FR SA employees | FR | employees URL | Denied |
| RBAC-N-07 | FR SA activity logs | FR | SA logs URL | Denied |
| RBAC-API-01 | PM POST `/api/clients` | PM token | | 401/403 |
| RBAC-API-02 | FR POST `/api/projects` | FR token | | 401/403 |
| RBAC-API-03 | FR POST comment | FR token | | 403 |
| RBAC-UI-01 | Hidden buttons | FR project | | No Edit/Delete |
| RBAC-UI-02 | Hidden comment box | FR details | | No Post Comment |
| RBAC-G-01 | Menu flash | Slow network login | | No SA menus for PM/FR |
| RBAC-E-01 | History after deny | Back/forward | | Stay authorized |
| RBAC-E-02 | Open SA link in new tab while PM | | | Denied |

---

# E. E2E business workflows (manual)

| ID | Flow | Expected |
|----|------|----------|
| E2E-M-01 | SA setup masters + project | All entities exist |
| E2E-M-02 | PM sees assignment | Project + team context |
| E2E-M-03 | FR submit with attachments | Success |
| E2E-M-04 | PM comment | Visible to PM |
| E2E-M-05 | FR sees comment | **Pass only if product requires visibility** |
| E2E-M-06 | Draft lifecycle | Same draft ID submitted |
| E2E-M-07 | Critical path | PM sees Critical |
| E2E-M-08 | Project update sync | Notes/location on PM+FR |
| E2E-M-09 | Full regression loop + logout guard | Login required after logout |
