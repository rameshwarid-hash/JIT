# Exploratory Defect Catalog — JIT Project Activity Reporting System

> **Persona:** Senior Manual QA Engineer  
> **Mindset:** Break the product. Do not assume expected behaviour.  
> **Sources:** Staging behaviour already observed in prior QA work, Excel TC packs (SA/PM/FR), role portals, and typical SaaS failure modes.  
> **Note:** Items marked **[OBSERVED]** have evidence from prior staging investigation. All others are **high-probability risks** to validate manually on staging.

---

## Severity / Priority Legend

| Severity | Meaning |
|----------|---------|
| **S1 Critical** | Data loss, security breach, wrong role access, cannot login/submit core work |
| **S2 Major** | Core workflow broken or wrong data shown; workaround painful |
| **S3 Moderate** | Feature partially wrong; UX/validation gap; workaround exists |
| **S4 Minor** | Cosmetic, copy, polish, low impact |

| Priority | Meaning |
|----------|---------|
| **P0** | Fix before any release / stopship |
| **P1** | Fix in current sprint |
| **P2** | Next sprint / planned |
| **P3** | Backlog |

| Automation feasibility |
|------------------------|
| **High** | Stable UI + clear assert |
| **Medium** | Needs setup/data/timing care |
| **Low** | Visual/judgment/multi-tab/timing heavy |
| **Manual-only** | Exploratory judgment, devices, or flake-prone |

---

# 1. Authentication & Session

| ID | Potential Bug | Sev | Pri | Manual Test Case | Expected Result | Possible Root Cause | Auto |
|----|---------------|-----|-----|------------------|-----------------|---------------------|------|
| BUG-AUTH-001 | Invalid login shows generic/wrong error | S3 | P2 | Enter wrong password for valid SA email | Clear “Invalid email or password” (or equivalent); stay on `/login`; no token | Generic catch-all; message mismatch | High |
| BUG-AUTH-002 | Empty fields still call login API | S3 | P2 | Click Sign In with blank email/password | Client validation; no `/api/auth/login` | Missing required attributes / no form guard | High |
| BUG-AUTH-003 | Spaces-only password accepted or unclear error | S3 | P2 | Password = spaces | Rejected with validation | Trim not applied; weak validation | High |
| BUG-AUTH-004 | Remember me does nothing | S3 | P2 | Check Remember me → login → close tab → reopen | Documented behaviour (persist or not); currently JWT is sessionStorage so “Remember me” may be dead UI | Checkbox not wired; conflict with sessionStorage design | Medium |
| BUG-AUTH-005 | Forgot Password link 404 or broken | S2 | P1 | Click Forgot Password? | Working reset flow or honest “not available” | Unimplemented route | High |
| BUG-AUTH-006 | After logout, Back button restores authenticated page | S1 | P0 | Login → logout → browser Back | Must re-auth or show login; no privileged UI | Cache / history not invalidated; SPA route not guarded | Medium |
| BUG-AUTH-007 | Clearing only cookies leaves session alive | S2 | P1 | Login → clear cookies only → navigate | Session may remain (JWT in sessionStorage) — product should document; if “logout” expected, bug | Auth model misunderstanding vs cookie apps | Medium |
| BUG-AUTH-008 | Manual delete of `ji_access_token` leaves app half-working | S2 | P1 | Login → DevTools delete access token → open Projects | Force re-login; no silent empty tables / infinite spinner | No axios/fetch 401 interceptor | Medium |
| BUG-AUTH-009 | Refresh token expired → blank dashboard | S2 | P1 | Force expired refresh (or wait) → navigate | Clear session + login redirect + message | Refresh failure not handled | Medium |
| BUG-AUTH-010 | Multiple rapid Sign In clicks create race / duplicate sessions | S3 | P2 | Double/triple click Sign In | Single login; button disabled while pending | No submit debounce | High |
| BUG-AUTH-011 | Login succeeds but redirect stays on `/login` briefly then flashes | S4 | P3 | Slow network login | No confusing flash; stable landing | Race between token write and router | Low |
| BUG-AUTH-012 | Password visible in network payload over HTTP | S1 | P0 | Inspect request (must be HTTPS) | HTTPS only; no plaintext channel | Misconfigured staging TLS | Manual-only |
| BUG-AUTH-013 | Email enumeration via distinct error messages | S3 | P2 | Unknown email vs wrong password | Same generic error | Different API messages | High |
| BUG-AUTH-014 | Session not isolated across profiles on same machine | S3 | P3 | Two OS users / profiles | Independent sessions | Expected for sessionStorage | Manual-only |

---

# 2. Authorisation & Permissions

| ID | Potential Bug | Sev | Pri | Manual Test Case | Expected Result | Possible Root Cause | Auto |
|----|---------------|-----|-----|------------------|-----------------|---------------------|------|
| BUG-RBAC-001 | PM can open SA Clients via URL then briefly see data | S1 | P0 | Login PM → paste `/super-admin/masters/clients` | Immediate deny; **no** client list flash | Client-only redirect after data fetch | Medium |
| BUG-RBAC-002 | UI redirects but API still returns SA data with PM token | S1 | P0 | PM: capture token → GET `/api/clients` | 401/403 | Missing server authz | High |
| BUG-RBAC-003 | FR can POST comment via API despite UI hide | S1 | P0 | FR token → POST comment on activity | 403 | UI-only permission | High |
| BUG-RBAC-004 | FR can create project via API | S1 | P0 | FR → POST `/api/projects` | 403 | Missing role check | High |
| BUG-RBAC-005 | FR opens `/project-manager/my-team` and sees team PII | S1 | P0 | FR deep link My Team | Redirect; no member emails/phones | Soft route guard | Medium |
| BUG-RBAC-006 | Menu items for wrong role flash then hide | S3 | P2 | Slow 3G login as FR | Never show SA Masters | Role loaded after shell render | Low |
| BUG-RBAC-007 | Hidden Edit button still in DOM / clickable via inspect | S2 | P1 | FR project details → inspect | Control absent server-side; DOM hide ≠ secure | `display:none` only | Medium |
| BUG-RBAC-008 | SA “Super Administrator” employee can escalate oddly | S2 | P1 | Create second SA → login | Expected privileged access only as designed; document if too easy | No approval for SA creation | Medium |
| BUG-RBAC-009 | PM sees unassigned project by guessing ID in URL | S1 | P0 | PM open project detail URL of another PM’s project | 403/404 | IDOR | High |
| BUG-RBAC-010 | FR Log Activity dropdown lists unassigned projects | S1 | P0 | FR with 1 assignment → open dropdown | Only assigned | Query not filtered by membership | High |
| BUG-RBAC-011 | Assigned then removed FR still sees project until refresh (or forever) | S2 | P1 | SA remove FR → FR stays on My Projects | Project disappears on next load; actions fail safely | Cache; no membership re-check | Medium |
| BUG-RBAC-012 | **[OBSERVED]** FR cannot see PM comments | S2 | P1 | PM posts comment → FR opens same activity | FR **should** see comment text if product requires collaboration | API filters comments by role; bug in count vs list | High |
| BUG-RBAC-013 | SA Activity Logs “My Logs” toggle ignored | S3 | P2 | Toggle My Logs | Only SA’s own logs | Filter not applied to query | High |
| BUG-RBAC-014 | Gate Pass / Access permissions on project ignored | S2 | P2 | Toggle Access & Permissions on create → verify FR access | Permissions enforced | UI-only section | Medium |

---

# 3. UI / UX / Visual

| ID | Potential Bug | Sev | Pri | Manual Test Case | Expected Result | Possible Root Cause | Auto |
|----|---------------|-----|-----|------------------|-----------------|---------------------|------|
| BUG-UI-001 | Overlapping text on dashboard cards at 1280px | S4 | P3 | SA dashboard | No overlap/cutoff | Fixed widths | Low |
| BUG-UI-002 | Status badge colour inconsistent across pages | S4 | P3 | Compare Submitted on list vs details | Same colour/token | Hardcoded per page | Low |
| BUG-UI-003 | **[OBSERVED]** Employee empty state says “No users found” | S4 | P3 | Empty employees search | Consistent “employees/users” copy | Shared empty component | High |
| BUG-UI-004 | Long project name breaks table layout | S3 | P2 | Create 200-char name | Truncate + tooltip; no horizontal page blowout | No CSS truncate | Medium |
| BUG-UI-005 | Dialog content behind sticky header | S3 | P2 | Open activity details; scroll | All sections reachable; not covered | z-index / overflow | Low |
| BUG-UI-006 | Toast covers primary action | S3 | P2 | Trigger success toast near Submit | Toast doesn’t block click | Fixed position conflict | Low |
| BUG-UI-007 | Create Project form loses section labels on scroll | S4 | P3 | Scroll long create form | Sticky section headers or clear anchors | Missing sticky | Manual-only |
| BUG-UI-008 | Chart legend colours don’t match segments | S3 | P2 | SA Clients/Vendors/Employees chart | Legend = data | Chart misconfig | Low |
| BUG-UI-009 | Greeting wrong time-of-day near boundaries | S4 | P3 | Check at 11:59 / 12:00 / 16:59 | Correct Good morning/afternoon/evening | Timezone/cutoffs | Medium |
| BUG-UI-010 | Profile email truncated without tooltip | S4 | P3 | Long email user | Tooltip or wrap | CSS ellipsis only | Low |
| BUG-UI-011 | Mobile menu overlay remains after navigate | S3 | P1 | Mobile → Open menu → navigate | Overlay closed | State not reset | Medium |
| BUG-UI-012 | Uneven spacing in Activity Details sections | S4 | P3 | Visual inspect | Consistent spacing | Missing design tokens | Manual-only |
| BUG-UI-013 | Critical badge looks like error / alarming wrongly | S4 | P3 | Non-critical vs critical | Distinct, accessible colours | Poor colour choice | Manual-only |
| BUG-UI-014 | Cursor not pointer on clickable rows | S4 | P3 | Hover log rows | pointer cursor | Missing CSS | Low |

---

# 4. Validation

| ID | Potential Bug | Sev | Pri | Manual Test Case | Expected Result | Possible Root Cause | Auto |
|----|---------------|-----|-----|------------------|-----------------|---------------------|------|
| BUG-VAL-001 | **[OBSERVED]** Client phone accepts alphabetic `ABCDEF` | S2 | P1 | Add Client phone=ABCDEF → save | Reject with validation; no 201 | No regex; server accepts string | High |
| BUG-VAL-002 | **[OBSERVED]** Duplicate client name returns 201 | S2 | P1 | Create second “Internal QA” | Unique constraint or soft-warn | No uniqueness rule | High |
| BUG-VAL-003 | Invalid email blocked in UI but accepted if API called | S2 | P1 | Bypass UI POST bad email | 400 from API | Client-only validation | High |
| BUG-VAL-004 | Project code duplicate not rejected | S2 | P1 | Reuse existing code on create | Clear duplicate error | Missing unique index | High |
| BUG-VAL-005 | Required field error not shown (only form stays open) | S3 | P1 | Submit blank Project Name | Visible inline/toast message | Silent preventDefault | High |
| BUG-VAL-006 | Leading/trailing spaces create “duplicate” projects | S3 | P2 | `" Project "` vs `"Project"` | Trim before save | No trim | High |
| BUG-VAL-007 | Vendor invalid phone accepted | S2 | P2 | Same as client phone letters | Reject | Shared weak validator | High |
| BUG-VAL-008 | Employee weak password accepted | S2 | P1 | Password `123` | Policy enforced | No password policy | High |
| BUG-VAL-009 | Remarks over 300 chars still submit | S3 | P2 | FR remarks 301+ | Block or truncate with notice | Limit UI-only / missing | Medium |
| BUG-VAL-010 | Time Spent accepts `1 day, 2:30:00` | S3 | P2 | Enter invalid duration | Validation error | Weak parser | Medium |
| BUG-VAL-011 | Blank PM comment still posts empty row | S2 | P1 | Post Comment with empty text | Blocked | No trim/empty check | High |
| BUG-VAL-012 | Whitespace-only Work Performed submits | S2 | P1 | Work = spaces/newlines only | Blocked | Rich text empty check fails | High |
| BUG-VAL-013 | Client code field editable despite “auto” | S3 | P2 | Try edit disabled code | Remains disabled; not overridable in payload | Disabled but still in form body | Medium |
| BUG-VAL-014 | Negative / zero time spent | S3 | P2 | Time `00:00:00` or negative | Business rule enforced | No min check | Medium |

---

# 5. Pagination

| ID | Potential Bug | Sev | Pri | Manual Test Case | Expected Result | Possible Root Cause | Auto |
|----|---------------|-----|-----|------------------|-----------------|---------------------|------|
| BUG-PAGE-001 | **[OBSERVED]** Clients: API page=2 but UI stays page 1 / Showing 1–10 | S2 | P0 | Go to page 2 on Clients | UI page indicator, aria-current, Showing, and rows all match page 2 | State not updated after fetch; wrong controlled page | High |
| BUG-PAGE-002 | Next on last page still fires request | S3 | P2 | Last page → Next | Disabled; no request | Button not disabled | High |
| BUG-PAGE-003 | Changing page size doesn’t reset to page 1 | S3 | P2 | Page 3 → change rows/page | Reset page 1; coherent Showing | Forgot reset | High |
| BUG-PAGE-004 | Showing label wrong after search | S3 | P1 | Search then paginate | Totals match filtered set | Pagination uses unfiltered total | High |
| BUG-PAGE-005 | Empty page when deleting last item on page | S3 | P2 | Delete sole item on page 2 | Jump to page 1 or previous | No empty-page guard | Medium |
| BUG-PAGE-006 | Vendors/Employees/Projects share same pagination bug | S2 | P1 | Repeat PAGE-001 on each master | All correct | Shared buggy component | High |
| BUG-PAGE-007 | Rapid page clicks race to wrong page | S3 | P2 | Click 2 then 3 quickly | Final UI = last click; abort stale | No request cancellation | Medium |

---

# 6. Search

| ID | Potential Bug | Sev | Pri | Manual Test Case | Expected Result | Possible Root Cause | Auto |
|----|---------------|-----|-----|------------------|-----------------|---------------------|------|
| BUG-SRCH-001 | Search case-sensitive misses matches | S3 | P2 | Search `internal` vs `Internal` | Case-insensitive | DB collation / client filter | High |
| BUG-SRCH-002 | Partial code search fails | S3 | P2 | Search partial project code | Matches | Exact-only query | High |
| BUG-SRCH-003 | Search does not debounce → API spam | S3 | P2 | Type quickly | Debounced requests | No debounce | Medium |
| BUG-SRCH-004 | Clearing search doesn’t restore list | S2 | P1 | Search → clear | Full list returns | Stale query param | High |
| BUG-SRCH-005 | XSS payload in search breaks page | S1 | P0 | Search `<script>alert(1)</script>` | Escaped; no script | Unsafe HTML render | High |
| BUG-SRCH-006 | Search ignores active filters | S3 | P2 | Filter Active + search | AND both | Filter reset on search | High |
| BUG-SRCH-007 | Leading space search returns empty wrongly | S4 | P3 | `" name"` | Trim or match | No trim | High |
| BUG-SRCH-008 | Activity log search by work summary misses rich-text content | S3 | P2 | Search unique submitted phrase | Found | Indexes plain text only / not HTML | Medium |

---

# 7. Filters

| ID | Potential Bug | Sev | Pri | Manual Test Case | Expected Result | Possible Root Cause | Auto |
|----|---------------|-----|-----|------------------|-----------------|---------------------|------|
| BUG-FLT-001 | Status filter shows wrong statuses (e.g. Completed under Active) | S2 | P1 | Filter Active projects | Only Active | Client-side filter bug / bad status field | High |
| BUG-FLT-002 | Clear Filters doesn’t clear all chips/dropdowns | S3 | P1 | Apply 4 filters → Clear | All reset | Incomplete reset state | High |
| BUG-FLT-003 | Combined filters OR instead of AND | S2 | P1 | Status+Client+Manager | Intersection | Query builder bug | High |
| BUG-FLT-004 | Logs Today filter timezone wrong (off-by-one day) | S2 | P1 | Near midnight local | Correct “today” | UTC vs local | Medium |
| BUG-FLT-005 | Employee Role filter “All Roles” still filters | S3 | P2 | Select All Roles | Full list | Empty string treated as filter | High |
| BUG-FLT-006 | Category filter Plumbing returns other categories | S2 | P2 | Activity Logs → Plumbing | Only Plumbing | Wrong query param | High |
| BUG-FLT-007 | Filter dropdown options stale after new master created | S3 | P2 | Create client → open project Client filter | New client listed | Cached options | Medium |
| BUG-FLT-008 | PM Client filter shows clients outside assignments | S3 | P2 | PM project filters | Only relevant clients | Unscoped master list | Medium |

---

# 8. Sorting

| ID | Potential Bug | Sev | Pri | Manual Test Case | Expected Result | Possible Root Cause | Auto |
|----|---------------|-----|-----|------------------|-----------------|---------------------|------|
| BUG-SORT-001 | **[OBSERVED]** Clients list has no sort / no `aria-sort` | S3 | P2 | Click column headers | Sort or headers not presented as sortable | Feature missing | High |
| BUG-SORT-002 | Date sort is string-sort not chrono | S2 | P1 | Activity Logs sort Date | Chronological | Lexicographic sort | High |
| BUG-SORT-003 | Sort lost after pagination | S3 | P2 | Sort → page 2 | Sort preserved | Sort state not in query | High |
| BUG-SORT-004 | Sort + filter returns unsorted mix | S3 | P2 | Filter then sort | Stable sorted filtered set | Server ignores sort | Medium |
| BUG-SORT-005 | Multi-manager column sort crashes | S3 | P3 | Sort Manager where multi-assign | No crash; sensible order | Null/array sort | Medium |

---

# 9. Sticky Elements / Scroll / Layout

| ID | Potential Bug | Sev | Pri | Manual Test Case | Expected Result | Possible Root Cause | Auto |
|----|---------------|-----|-----|------------------|-----------------|---------------------|------|
| BUG-STK-001 | Sticky sidebar covers content on horizontal scroll | S3 | P2 | Narrow window + table scroll | Content fully reachable | Fixed sidebar width | Low |
| BUG-STK-002 | Sticky table header misaligned with columns | S3 | P2 | Scroll long clients table | Headers align | Separate header table | Low |
| BUG-STK-003 | Filter bar sticky overlaps first row | S3 | P2 | Scroll projects | First row readable | Missing top offset | Low |
| BUG-STK-004 | Activity dialog body doesn’t scroll; page scrolls instead | S3 | P1 | Long work + many comments | Dialog internal scroll; focus trap | overflow not set | Medium |
| BUG-STK-005 | Mobile sticky CTA covers form fields | S3 | P1 | FR Log Activity on phone | Fields not covered | Fixed bottom bar | Low |

---

# 10. Notifications

| ID | Potential Bug | Sev | Pri | Manual Test Case | Expected Result | Possible Root Cause | Auto |
|----|---------------|-----|-----|------------------|-----------------|---------------------|------|
| BUG-NTF-001 | Unread/Read tabs show same items | S2 | P1 | Open Notifications → switch tabs | Distinct sets | Filter bug | High |
| BUG-NTF-002 | Badge count doesn’t decrease after read | S3 | P1 | Open unread item | Badge updates | No mark-read API call | Medium |
| BUG-NTF-003 | Notification deep link 404 | S2 | P1 | Click notification | Correct activity/project | Stale ID / wrong route | Medium |
| BUG-NTF-004 | Notifications for other role’s events shown | S2 | P1 | FR sees SA master-create events | Only relevant | Missing audience filter | Medium |
| BUG-NTF-005 | Empty state missing when no notifications | S4 | P3 | New user | Friendly empty | Missing empty UI | High |
| BUG-NTF-006 | Panel doesn’t close on Escape | S3 | P3 | Open → Esc | Closes | Key handler missing | High |
| BUG-NTF-007 | Polling causes UI jank | S3 | P2 | Leave dashboard open 10 min | Smooth; no flicker | Aggressive refetch | Low |
| BUG-NTF-008 | Transient “Not now” / permission prompt blocks dashboard every login | S3 | P2 | Login repeatedly | Prompt once or dismissible permanently | No preference persistence | Medium |

---

# 11. Comments

| ID | Potential Bug | Sev | Pri | Manual Test Case | Expected Result | Possible Root Cause | Auto |
|----|---------------|-----|-----|------------------|-----------------|---------------------|------|
| BUG-CMT-001 | **[OBSERVED]** FR sees `Comments (0)` after PM commented | S2 | P0 | E2E comment path | Count and list include PM comment | Authz filter on read; count bug | High |
| BUG-CMT-002 | Comment count ≠ displayed comments | S2 | P1 | Open details with 3 comments | Count = 3 | Cached count field | High |
| BUG-CMT-003 | Double-click Post Comment duplicates | S2 | P1 | Double-click Post | One comment | No disable-on-submit | High |
| BUG-CMT-004 | Comment order not chronological | S3 | P2 | Post 2 comments | Oldest→newest or documented order | Wrong sort | High |
| BUG-CMT-005 | XSS in comment executes for viewer | S1 | P0 | Post `<img onerror=...>` | Escaped | Dangerous HTML | High |
| BUG-CMT-006 | Permission message missing for FR | S3 | P2 | FR open details | Clear “no permission to comment” | Missing copy | High |
| BUG-CMT-007 | Comment attachment unsupported type accepted | S2 | P1 | Attach .exe to comment | Rejected | Weak MIME check | Medium |
| BUG-CMT-008 | Comment succeeds in UI but fails API (optimistic UI) | S2 | P1 | Throttle network; post | Error shown; no fake comment | Optimistic update without rollback | Medium |
| BUG-CMT-009 | PM cannot comment on activity outside team but UI allows open | S2 | P1 | Edge assignment | Deny comment | Inconsistent authz | Medium |
| BUG-CMT-010 | Long comment breaks dialog layout | S4 | P3 | 2k chars | Wrap/scroll | CSS | Low |

---

# 12. Attachments / Uploads

| ID | Potential Bug | Sev | Pri | Manual Test Case | Expected Result | Possible Root Cause | Auto |
|----|---------------|-----|-----|------------------|-----------------|---------------------|------|
| BUG-ATT-001 | EXE renamed to .png uploads | S1 | P0 | Upload malware.exe renamed .png | Server MIME/content sniff reject | Extension-only check | Medium |
| BUG-ATT-002 | File >10MB accepted | S2 | P1 | 12MB image | Reject with message | Limit not enforced server-side | Medium |
| BUG-ATT-003 | 0-byte file accepted | S3 | P2 | Empty file | Reject | No size min | Medium |
| BUG-ATT-004 | Upload shows success but missing on details | S2 | P0 | Submit with PDF → open details | Attachment listed | Orphan upload; failed link | Medium |
| BUG-ATT-005 | Photos tab accepts PDF / Documents accepts PNG wrongly | S3 | P2 | Cross-upload | Reject or auto-route | Shared input accept=* | High |
| BUG-ATT-006 | Drag-drop does nothing | S3 | P2 | Drag PNG to dropzone | Upload starts | Handler missing | Medium |
| BUG-ATT-007 | Remove attachment before submit still sends file | S2 | P1 | Add then remove → submit | Not attached | State not cleared | Medium |
| BUG-ATT-008 | Multiple files — only first saved | S2 | P1 | Upload 3 photos | All saved or clear max message | Array handling bug | Medium |
| BUG-ATT-009 | Download/open PDF fails (403) | S2 | P1 | Click PDF on details | Opens/downloads | Signed URL / auth header missing | Medium |
| BUG-ATT-010 | Image thumbnail broken icon | S3 | P2 | View image attachment | Thumbnail loads | Wrong URL / CORS | Low |
| BUG-ATT-011 | Upload during offline then reconnect duplicates | S3 | P2 | Offline submit retry | One activity / one file | Retry without idempotency | Low |

---

# 13. Date Filters & Timezone

| ID | Potential Bug | Sev | Pri | Manual Test Case | Expected Result | Possible Root Cause | Auto |
|----|---------------|-----|-----|------------------|-----------------|---------------------|------|
| BUG-DATE-001 | From > To still returns data | S3 | P1 | From tomorrow, To yesterday | Validation / empty | No range check | High |
| BUG-DATE-002 | Inclusive boundaries wrong (misses same-day) | S2 | P1 | From=To=today | Today’s logs included | End date exclusive UTC midnight | Medium |
| BUG-DATE-003 | Activity default date is UTC not local | S2 | P1 | Log near midnight IST | “Today” local | `toISOString` date only | Medium |
| BUG-DATE-004 | Comment timestamp timezone mismatch vs list | S3 | P2 | Compare list time vs comment time | Consistent TZ policy | Mixed local/UTC formatters | Medium |
| BUG-DATE-005 | Date picker allows future activity when not allowed | S3 | P2 | Pick future date → submit | Per business rule | No max=today | High |
| BUG-DATE-006 | DST transition day double/skip logs | S3 | P3 | Test around DST if applicable | Correct day bucket | TZ library misuse | Manual-only |
| BUG-DATE-007 | Filters ignore user TZ; use server TZ | S2 | P1 | User in IST vs server UTC | Documented behaviour matching “today” cards | Server local date | Medium |
| BUG-DATE-008 | Dashboard “Activity logged today” ≠ Activity Logs Today filter | S2 | P1 | Compare counts | Equal for same scope | Different definitions of today | High |

---

# 14. Empty States & Error Messages

| ID | Potential Bug | Sev | Pri | Manual Test Case | Expected Result | Possible Root Cause | Auto |
|----|---------------|-----|-----|------------------|-----------------|---------------------|------|
| BUG-EMP-001 | Empty search shows blank white area | S3 | P2 | Impossible search | “No … found” message | Missing empty component | High |
| BUG-EMP-002 | Wrong empty copy (clients vs users) | S4 | P3 | See EMP empty | Consistent domain language | Shared string | High |
| BUG-EMP-003 | API 500 shows raw JSON / blank | S2 | P1 | Force 500 on list | Friendly error + retry | Uncaught error boundary | Medium |
| BUG-EMP-004 | Success toast on failed create | S2 | P0 | Fail network on create | Error toast only | Wrong toast trigger | High |
| BUG-EMP-005 | Permission denied shows “Not found” | S3 | P2 | FR forbidden URL | Clear unauthorized message | Generic redirect | Medium |
| BUG-EMP-006 | Login error alert not announced | S3 | P2 | Fail login + SR | Announced | Missing aria-live | Medium |

---

# 15. Browser History / Refresh / Multi-tab / Race / Double-click

| ID | Potential Bug | Sev | Pri | Manual Test Case | Expected Result | Possible Root Cause | Auto |
|----|---------------|-----|-----|------------------|-----------------|---------------------|------|
| BUG-NAV-001 | Refresh on Create Project loses data without warning | S3 | P2 | Fill half form → F5 | Warn or restore draft | No beforeunload | Medium |
| BUG-NAV-002 | Back from details loses filters | S3 | P2 | Filter → open details → Back | Filters restored | No query-string state | Medium |
| BUG-NAV-003 | After role deny redirect, Forward returns to forbidden URL content | S2 | P1 | PM hit SA URL → redirect → Forward | Still denied | History entry kept | Medium |
| BUG-NAV-004 | Multi-tab: Tab A logout; Tab B still acts until refresh | S2 | P1 | Two tabs same role; logout one | Other tab detects 401 soon | No storage event sync | Medium |
| BUG-NAV-005 | Multi-tab: Tab A SA, Tab B try PM login (sessionStorage) | S3 | P2 | Same origin tabs | Document last-write-wins; no mixed menus silently | Single sessionStorage per tab actually — verify isolation | Manual-only |
| BUG-NAV-006 | Double-click Create Client creates two records | S2 | P0 | Double-click Add Client | One record; button disabled | No idempotency key | High |
| BUG-NAV-007 | Double-click Submit Activity duplicates logs | S2 | P0 | Double Submit | One activity | No in-flight lock | High |
| BUG-NAV-008 | Race: Save Draft then Submit quickly → wrong final status | S2 | P1 | Rapid Draft then Submit | Final Submitted once | Parallel writes | Medium |
| BUG-NAV-009 | Stale list after create until manual refresh | S3 | P2 | Create vendor → list | Auto refresh/search | Cache | High |
| BUG-NAV-010 | E2E-like parallel creates collide on same code | S2 | P2 | Two users same project code | Second fails clearly | Weak unique constraint | Medium |

---

# 16. Loading States

| ID | Potential Bug | Sev | Pri | Manual Test Case | Expected Result | Possible Root Cause | Auto |
|----|---------------|-----|-----|------------------|-----------------|---------------------|------|
| BUG-LOAD-001 | No loader; empty flash then data | S3 | P2 | Slow network open Clients | Skeleton/loader | Missing loading flag | Low |
| BUG-LOAD-002 | Loader never dismisses on error | S2 | P1 | Fail API | Loader stops; error shown | finally{} missing | Medium |
| BUG-LOAD-003 | Submit button not disabled while uploading | S2 | P1 | Slow upload → click Submit | Disabled until done | Race | Medium |
| BUG-LOAD-004 | Dashboard cards show 0 then jump (layout shift) | S4 | P3 | Load dashboard | Skeletons prevent CLS | Render before fetch | Low |
| BUG-LOAD-005 | Infinite spinner on notifications | S3 | P2 | Break notifications API | Timeout + error | Hang promise | Medium |

---

# 17. Responsive / Mobile

| ID | Potential Bug | Sev | Pri | Manual Test Case | Expected Result | Possible Root Cause | Auto |
|----|---------------|-----|-----|------------------|-----------------|---------------------|------|
| BUG-RSP-001 | Tables unusable on 375px (no scroll/cards) | S2 | P1 | FR My Projects mobile | Horizontal scroll or card layout | Desktop-only table | Low |
| BUG-RSP-002 | Open menu button missing / broken | S2 | P1 | Mobile SA dashboard | Menu opens nav | Breakpoint CSS | Medium |
| BUG-RSP-003 | Date pickers unusable on touch | S3 | P2 | Activity Logs dates mobile | Native or touch-friendly | Custom picker | Manual-only |
| BUG-RSP-004 | Create Project multi-assign UI broken on tablet | S2 | P2 | 768px create form | Assign works | Overflow hidden | Low |
| BUG-RSP-005 | Toast off-screen on mobile | S4 | P3 | Trigger toast | Visible | Fixed position | Low |
| BUG-RSP-006 | Critical metrics cut off on tablet | S3 | P2 | 768 dashboard | Readable | Flex wrap fail | Low |

---

# 18. Accessibility

| ID | Potential Bug | Sev | Pri | Manual Test Case | Expected Result | Possible Root Cause | Auto |
|----|---------------|-----|-----|------------------|-----------------|---------------------|------|
| BUG-A11Y-001 | Dialog not labelled / focus not trapped | S2 | P1 | Open activity details + Tab | Focus stays; Esc closes; return focus | Incomplete dialog pattern | Medium |
| BUG-A11Y-002 | Icon-only Notifications without name | S3 | P1 | SR on bell | “Notifications” name | Missing aria-label | High |
| BUG-A11Y-003 | Colour-only status (no text/badge label) | S2 | P1 | Colour-blind simulation | Text status always | Colour-only | Manual-only |
| BUG-A11Y-004 | Rich text toolbar not keyboard accessible | S3 | P2 | FR editor keyboard only | Can bold/list | Buttons not focusable | Medium |
| BUG-A11Y-005 | **[OBSERVED]** No `aria-sort` on sortable-looking columns | S3 | P2 | Clients headers | Correct aria or not button-like | Missing a11y | High |
| BUG-A11Y-006 | Pagination page buttons lack current page announcement | S3 | P2 | Page 2 | aria-current=page | Missing attr (also functional bug) | High |
| BUG-A11Y-007 | Error toasts not in aria-live | S3 | P2 | Fail action | Announced | role=alert missing | Medium |
| BUG-A11Y-008 | Heading hierarchy skip (H1→H3) | S4 | P3 | Dashboard outline | Logical headings | Markup | High |
| BUG-A11Y-009 | Contrast fail on badge/pastel text | S3 | P2 | Contrast checker | WCAG AA | Design tokens | Low |
| BUG-A11Y-010 | File upload input without accessible name | S3 | P2 | Photos tab | Named input | Visually hidden label missing | High |

---

# 19. Dashboard / Data Integrity

| ID | Potential Bug | Sev | Pri | Manual Test Case | Expected Result | Possible Root Cause | Auto |
|----|---------------|-----|-----|------------------|-----------------|---------------------|------|
| BUG-DSH-001 | Card totals ≠ `/api/dashboard` | S2 | P0 | Compare UI vs network | Exact match | Wrong field mapping | High |
| BUG-DSH-002 | active+on_hold+completed ≠ total | S2 | P0 | Math check | Equal | Status leakage / archived | High |
| BUG-DSH-003 | Chart total ≠ clients+vendors+employees | S2 | P1 | Reconcile | Equal | Double count / inactive | High |
| BUG-DSH-004 | Recent activity duplicate IDs | S2 | P1 | Inspect recent list | Unique | Query bug | High |
| BUG-DSH-005 | Critical deep link missing `isCritical=true` | S3 | P2 | Click critical card | Filter applied | Wrong href | High |
| BUG-DSH-006 | PM dashboard shows system-wide totals | S1 | P0 | PM with 1 project | Scoped counts | Unscoped API | High |
| BUG-DSH-007 | FR “Logs Today” includes other users’ logs | S1 | P0 | Two FRs same project | Own or team per rule | Missing submitter filter | High |

---

# 20. Projects / Assignment Sync

| ID | Potential Bug | Sev | Pri | Manual Test Case | Expected Result | Possible Root Cause | Auto |
|----|---------------|-----|-----|------------------|-----------------|---------------------|------|
| BUG-PRJ-001 | **[OBSERVED]** Edit Project control missing | S2 | P1 | SA open project → Edit | Edit available per product | Feature incomplete / permission flag | High |
| BUG-PRJ-002 | SA updates notes; PM/FR still see old notes | S2 | P0 | Update notes → other roles refresh | Updated | Cache; wrong field | High |
| BUG-PRJ-003 | Draft project visible to FR as Active | S2 | P1 | Save Draft → FR login | FR should not work draft unless allowed | Publish flag ignored | High |
| BUG-PRJ-004 | Multiple managers selected but only one saved | S2 | P0 | Assign 2 PMs → reopen | Both persisted | Array serialization bug | High |
| BUG-PRJ-005 | Cancel on create still creates draft | S2 | P1 | Fill → Cancel | No record | Autosave | Medium |
| BUG-PRJ-006 | Project documents section doesn’t upload | S3 | P2 | Browse Files on create | File linked | Stub UI | Medium |
| BUG-PRJ-007 | Location change doesn’t update FR work location default | S3 | P2 | Change project location | FR form reflects | Cached project | Medium |

---

# 21. Activity Draft / Submit Workflow

| ID | Potential Bug | Sev | Pri | Manual Test Case | Expected Result | Possible Root Cause | Auto |
|----|---------------|-----|-----|------------------|-----------------|---------------------|------|
| BUG-ACT-001 | Save Draft creates Submitted | S2 | P0 | Save Draft only | Status Draft | Wrong endpoint/flag | High |
| BUG-ACT-002 | Edit draft creates second activity instead of updating | S2 | P0 | Edit draft → submit | Same ID; one row | POST instead of PATCH | High |
| BUG-ACT-003 | Critical flag lost after submit | S2 | P1 | Mark critical → submit → PM view | Critical badge | Flag not persisted | High |
| BUG-ACT-004 | Category resets to General | S3 | P2 | Select Plumbing → submit | Plumbing on details | Default overwrite | High |
| BUG-ACT-005 | Work Performed HTML stripped / broken | S3 | P2 | Bold list → view | Formatting preserved safely | Sanitizer too aggressive | Medium |
| BUG-ACT-006 | Recent logs widget doesn’t show newest first | S3 | P2 | Submit 2 logs | Newest on top | Wrong sort | High |

---

# 22. My Team (PM)

| ID | Potential Bug | Sev | Pri | Manual Test Case | Expected Result | Possible Root Cause | Auto |
|----|---------------|-----|-----|------------------|-----------------|---------------------|------|
| BUG-TEAM-001 | Summary cards ≠ list aggregates | S2 | P1 | Compare totals | Match | Separate queries diverge | High |
| BUG-TEAM-002 | View All Activities doesn’t filter member | S2 | P1 | From member details | Logs for that member only | Missing query param | High |
| BUG-TEAM-003 | Shows FRs not on PM’s projects | S1 | P0 | PM with limited assignments | Only own team | Unscoped employees API | High |
| BUG-TEAM-004 | Phone/email PII visible beyond need | S3 | P2 | Policy check | Per privacy rules | Over-fetch | Manual-only |

---

# Exploratory Session Charters (execute manually)

1. **Pagination liar** — Every master + projects + logs: page 2, compare network vs UI vs Showing.  
2. **Permission peel** — For each hidden control, try URL + API with stolen role token.  
3. **Comment ghost** — PM comment → FR refresh / other browser / other device.  
4. **Midnight IST** — 23:50–00:10: submit, filter Today, dashboard Today.  
5. **Double-submit storm** — Every primary CTA double-clicked on 3G throttle.  
6. **Attachment smuggling** — Wrong MIME, oversized, 0-byte, remove-then-submit.  
7. **Multi-tab logout** — Privilege actions after sibling tab logout.  
8. **Filter soup** — 4 filters + search + sort + page; Clear; Back.  

---

# Top 15 to validate first (stopship candidates)

| Rank | ID | Why first |
|------|-----|-----------|
| 1 | BUG-RBAC-002 / 003 / 004 / 009 | Server authz = real security |
| 2 | BUG-CMT-001 | Collaboration broken if FR can’t see PM comments |
| 3 | BUG-PAGE-001 | Trust in all list UIs |
| 4 | BUG-NAV-006 / 007 | Duplicate business data |
| 5 | BUG-VAL-001 / 002 | Master data quality |
| 6 | BUG-DSH-006 / 007 | Wrong KPIs = wrong decisions |
| 7 | BUG-ACT-002 | Draft integrity |
| 8 | BUG-ATT-001 / 004 | Security + evidence integrity |
| 9 | BUG-AUTH-006 | Session after logout |
| 10 | BUG-PRJ-002 / 004 | Assignment truth |
| 11 | BUG-DATE-003 / 008 | “Today” lies |
| 12 | BUG-CMT-005 | XSS |
| 13 | BUG-SRCH-005 | XSS via search |
| 14 | BUG-TEAM-003 | PII leak across teams |
| 15 | BUG-PRJ-001 | Edit missing blocks ops |

---

# Summary counts (catalog)

| Category | Approx. items |
|----------|----------------|
| Auth/Session | 14 |
| RBAC | 14 |
| UI/UX | 14 |
| Validation | 14 |
| Pagination | 7 |
| Search | 8 |
| Filters | 8 |
| Sorting | 5 |
| Sticky | 5 |
| Notifications | 8 |
| Comments | 10 |
| Attachments | 11 |
| Dates/TZ | 8 |
| Empty/Errors | 6 |
| Nav/Race/Tabs | 10 |
| Loading | 5 |
| Responsive | 6 |
| A11y | 10 |
| Dashboard | 7 |
| Projects | 7 |
| Activity | 6 |
| My Team | 4 |
| **Total** | **~187 potential bugs** |

---

*Senior Manual QA exploratory catalog — generated for defect hunting, not for making tests pass.*
