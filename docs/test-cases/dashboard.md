# Manual Test Cases — Dashboard

| Field | Value |
|-------|-------|
| Module | Dashboard |
| Roles | SA, PM, FR |
| Related | SA-DASH-*, PM-DASH-*, FR-DASH-* |

---

## Positive

| ID | Scenario | Role | Steps | Expected |
|----|----------|------|-------|----------|
| DASH-P-01 | SA dashboard load | SA | Login | H1 Dashboard; greeting; no console errors |
| DASH-P-02 | Cards match API | SA | Compare UI cards to `/api/dashboard` | Exact match |
| DASH-P-03 | Project status math | SA | active+on_hold+completed | Equals total projects |
| DASH-P-04 | Quick link Activity Logs | SA | Click | Opens SA Activity Logs |
| DASH-P-05 | Quick link Create Project | SA | Click | Opens create |
| DASH-P-06 | PM dashboard load | PM | Login | Assigned KPIs visible |
| DASH-P-07 | PM My Team shortcut | PM | Click | My Team opens |
| DASH-P-08 | FR dashboard load | FR | Login | Assigned project cards + log KPIs |
| DASH-P-09 | FR Log Activity CTA | FR | Click | Log Activity opens |
| DASH-P-10 | Recent activity open | Any | Click recent row | Details dialog |

## Negative

| ID | Scenario | Role | Steps | Expected |
|----|----------|------|-------|----------|
| DASH-N-01 | PM opens SA dashboard URL | PM | Goto `/super-admin/dashboard` | Denied / redirect PM |
| DASH-N-02 | FR opens SA dashboard URL | FR | Goto SA dashboard | Denied / redirect FR |
| DASH-N-03 | API 500 on dashboard | SA | Simulate failure | Error state; shell usable |

## Boundary

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| DASH-B-01 | Zero projects / logs | Empty tenant or filtered | Cards show 0; empty recent state |
| DASH-B-02 | Very large counts | High volume env | Numbers readable; no overflow |

## UI

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| DASH-U-01 | Greeting time variants | Morning/afternoon/evening | Correct salutation |
| DASH-U-02 | Charts render | Projects by status; C/V/E chart | Legends + values |
| DASH-U-03 | Profile shows email | Header/complementary | Authenticated email |
| DASH-U-04 | Responsive | 375/768/1280 | Open menu on mobile; metrics readable |

## Permission

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| DASH-R-01 | SA sees Masters shortcuts | SA | Clients/Employees links |
| DASH-R-02 | PM does not see Masters | PM | No Clients/Vendors master nav |
| DASH-R-03 | FR does not see My Team | FR | No My Team |

## Accessibility

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| DASH-A-01 | Heading structure | Inspect | Single H1 Dashboard |
| DASH-A-02 | Card labels | SR | Counts associated with labels |
| DASH-A-03 | Chart alternatives | Inspect | Text/table fallback or aria |

## Security

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| DASH-S-01 | Dashboard API without token | Direct GET | 401 |
| DASH-S-02 | PM token calling SA dashboard API | If distinct | 403 or scoped data only |

## Regression

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| DASH-G-01 | Critical deep link | Click critical card | URL contains `isCritical=true` |
| DASH-G-02 | View All recent logs | Click View All | Full Activity Logs |
| DASH-G-03 | Unique recent IDs | Inspect list | No duplicate IDs |

## Performance

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| DASH-PF-01 | Load time | Login → interactive dashboard | Within SLA |

## Exploratory / Edge

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| DASH-E-01 | Refresh spam | Rapid F5 | Stable final counts |
| DASH-E-02 | Stale cache | Create project in other tab → refresh | Counts update |
| DASH-E-03 | Chart vs cards mismatch | Compare | Document if diverge |
| DASH-E-04 | Notifications from dashboard | Open Notifications | Unread/Read tabs work |
