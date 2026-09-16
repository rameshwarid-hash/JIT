# Manual Test Cases — Log Activity & Activity Logs

| Field | Value |
|-------|-------|
| Modules | Log Activity, Activity Logs, Activity Details |
| Roles | FR / PM (write logs); SA / PM / FR (view scoped) |

---

# A. Log Activity (FR / PM)

## Positive
| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| LA-P-01 | Page load | Open Log Activity | Project, date, work fields visible |
| LA-P-02 | Assigned projects only | Open Project dropdown | Only assigned |
| LA-P-03 | Submit with photo+PDF | Fill General + Pune Site + PNG + PDF → Submit | Success; appears in logs |
| LA-P-04 | Save Draft | Partial/complete → Save Draft | Draft saved; listed under drafts |
| LA-P-05 | Edit draft → submit | Open draft → edit → submit | Submitted; not stuck draft |
| LA-P-06 | Mark Critical | Toggle + submit Inspection | Critical badge for PM/SA |
| LA-P-07 | Category selection | Each category | Persists on details |
| LA-P-08 | Rich text formatting | Bold/italic/list | Rendered on details |
| LA-P-09 | Cancel | Enter data → Cancel | No save **[VERIFY]** |

## Negative
| ID | Scenario | Expected |
|----|----------|----------|
| LA-N-01 | Submit blank Work Performed | Validation; no create |
| LA-N-02 | Submit without project | Validation |
| LA-N-03 | Upload .exe | Rejected |
| LA-N-04 | Upload >10MB | Rejected |
| LA-N-05 | Invalid Time Spent | Rejected |
| LA-N-06 | Unassigned project via API | 403 |

## Boundary
| ID | Scenario | Expected |
|----|----------|----------|
| LA-B-01 | Work Performed max length | Enforce / truncate with message |
| LA-B-02 | Remarks >300 chars | Blocked |
| LA-B-03 | 0-byte upload | Rejected |
| LA-B-04 | Many attachments | Document limit |
| LA-B-05 | Double-click Submit | Single activity only |

## UI / A11y / Perf
| ID | Scenario | Expected |
|----|----------|----------|
| LA-U-01 | Character counter | Accurate |
| LA-U-02 | Photos vs Documents tabs | Correct inputs |
| LA-A-01 | Editor keyboard operable | Yes |
| LA-PF-01 | Large image upload | Progress + success within SLA |

## Exploratory
| ID | Scenario | Notes |
|----|----------|-------|
| LA-E-01 | Change project → location auto-update | Confirm ACT-03 |
| LA-E-02 | Offline mid-upload | Recovery UX |
| LA-E-03 | XSS in Work Performed | Escaped for PM viewer |
| LA-E-04 | Draft edit false path | Ensure same record ID updated |

---

# B. Activity Logs list

## Positive
| ID | Scenario | Role | Expected |
|----|----------|------|----------|
| AL-P-01 | Page load + title | SA/PM/FR | Activity Logs H1 |
| AL-P-02 | Search by project | SA | Matching rows |
| AL-P-03 | Search by user / work text | SA | Matching |
| AL-P-04 | Status filter Submitted/Draft | Any | Filtered |
| AL-P-05 | Category / Project / User filters | SA/PM | Filtered |
| AL-P-06 | Valid From–To range | Any | Inclusive results |
| AL-P-07 | Summary cards | Any | Match scoped counts |
| AL-P-08 | My Logs toggle | SA | Only current user |
| AL-P-09 | Pagination | Any | Next/Prev work |
| AL-P-10 | Open details from row | Any | Dialog matches row |

## Negative / Boundary
| ID | Scenario | Expected |
|----|----------|----------|
| AL-N-01 | Invalid search | Empty state |
| AL-N-02 | From > To | Validation or empty |
| AL-N-03 | FR opens SA logs URL | Denied |
| AL-B-01 | Same From=To | That day’s logs only |
| AL-B-02 | Future dates | Empty or validation |

## UI / Permission / Security
| ID | Scenario | Expected |
|----|----------|----------|
| AL-U-01 | Columns Date, Submitted By, Project, Category, Summary, Location, Time, Status | Present |
| AL-U-02 | Status/Critical badge colours | Correct |
| AL-R-01 | FR sees only allowed logs | No foreign projects |
| AL-S-01 | Guess another activity ID in API | 403 |

## Regression / Exploratory
| ID | Scenario | Expected |
|----|----------|----------|
| AL-G-01 | Critical from FR visible to PM | Badge + details |
| AL-G-02 | Sort by Date/User/Project | Correct order **[VERIFY]** |
| AL-E-01 | Filter + search + page compose | Stable |
| AL-E-02 | Escape closes details | Yes |
| AL-PF-01 | Heavy log volume | Acceptable load |

---

# C. Activity Details popup

| ID | Scenario | Expected |
|----|----------|----------|
| AD-P-01 | Project name/code/location | Match selected |
| AD-P-02 | Status / Critical / Category badges | Correct |
| AD-P-03 | Work Performed full text | No harmful truncation |
| AD-P-04 | PDF + image attachments | Visible; open/download |
| AD-P-05 | Logged By name + role | Correct |
| AD-P-06 | Close X | Returns to list |
| AD-U-01 | Long content scroll | No overlap |
| AD-A-01 | Dialog accessible name | Present |
| AD-E-01 | Materials/Remarks empty | Placeholder/empty state |
