# BUG PATTERNS — JIT QA Checklist

> Use this as a **defect-hunting charter**. Always try to break the control, then document actual vs expected.  
> Patterns marked with staging evidence are **known or suspected** in current automation comments.

---

## How to use

For every interactive surface (dropdown, table, dialog, form, nav):

1. Happy path once  
2. Abuse path (empty, max, invalid, double-click, slow network)  
3. Role switch / deep link  
4. Refresh / back / storage clear  

---

## 1. Dropdown behaviour

- [ ] Opens on click and keyboard (Enter/Space)  
- [ ] Closes on Escape / outside click  
- [ ] Searchable dropdowns filter correctly; empty query restores list  
- [ ] Selecting option updates bound field and any dependent field (e.g. project → location)  
- [ ] Disabled when no data / no permission  
- [ ] Does not stick open after navigation  
- [ ] Long lists scroll inside panel; no page scroll steal  
- [ ] Multi-select (managers/team) count label accurate (“N managers selected”)  
- [ ] Role filter vs Status filter options exact (no missing/extra)

## 2. Focus & keyboard

- [ ] Tab order logical within dialogs  
- [ ] Focus trapped in modal; returns to trigger on close  
- [ ] Sign In activatable via Enter from password field  
- [ ] Comment Post via keyboard without `dispatchEvent` hacks  
- [ ] Skip / no keyboard trap in rich text editor  
- [ ] Combobox aria attributes correct

## 3. Mouse / hover

- [ ] Hover does not permanently change layout  
- [ ] Click targets ≥ accessible size  
- [ ] Double-click on Submit does not double-create  
- [ ] Row click vs action button click do not conflict

## 4. Pagination

- [ ] Next/Previous/page number update **both UI and API**  
- [ ] `aria-current` matches requested page  
- [ ] “Showing X–Y of Z” matches payload `pagination`  
- [ ] **[KNOWN]** Clients: page 2 API vs UI stuck on 1  
- [ ] Last page Next disabled; first page Prev disabled  
- [ ] Page size change resets to page 1

## 5. Sorting

- [ ] Column sort toggles asc/desc  
- [ ] `aria-sort` present when sortable  
- [ ] **[KNOWN]** Clients lack sort  
- [ ] Sort + filter + search compose correctly  
- [ ] Sort persists or resets consistently after search

## 6. Search

- [ ] Exact, partial, case-insensitive  
- [ ] Code vs name fields  
- [ ] Debounce does not lose characters  
- [ ] Clear restores full list  
- [ ] XSS / SQL-ish strings do not break UI  
- [ ] Special characters and Unicode names

## 7. Sticky / scroll UI

- [ ] Header/sidebar sticky without covering content  
- [ ] Dialog body scrolls independently  
- [ ] Infinite or long tables do not break sticky filters  
- [ ] Mobile menu does not leave overlay after close

## 8. Responsive

- [ ] 375 / 768 / 1280 layouts  
- [ ] Open menu on mobile  
- [ ] Tables become usable (horizontal scroll or cards)  
- [ ] No overlapping text/controls  
- [ ] Touch targets on mobile

## 9. Visual (alignment, spacing, fonts, colours)

- [ ] Status badge colours consistent (Submitted / Draft / Critical / Active / On Hold)  
- [ ] Consistent typography across roles  
- [ ] Empty states aligned and readable  
- [ ] Dialog sections (Work / Comments / Attachments) spacing  
- [ ] Chart legends match data colours

## 10. Loader / toast

- [ ] Loader shown during slow API; dismissed on settle  
- [ ] Toast / `role="alert"` for success and failure  
- [ ] Error toast text accurate (not generic wrong message)  
- [ ] Toast does not block clicks permanently

## 11. Validation

- [ ] Client-side prevents bad POST  
- [ ] Server-side still validates if client bypassed  
- [ ] **[KNOWN]** Phone accepts letters on clients  
- [ ] **[KNOWN]** Duplicate client names may 201  
- [ ] Required messages visible, not only “dialog stays open”  
- [ ] From date > To date handled

## 12. Notifications

- [ ] Unread/Read tabs switch content  
- [ ] Count badge matches unread  
- [ ] Opening notification marks read **[VERIFY]**  
- [ ] Deep link lands on correct entity  
- [ ] Empty notification state

## 13. Session / storage / JWT

- [ ] Token present after login; absent after logout  
- [ ] Manual `sessionStorage.clear` forces re-auth  
- [ ] Expired token → re-login, not silent empty pages  
- [ ] Refresh token rotation **[VERIFY]**  
- [ ] localStorage not holding secrets unexpectedly  
- [ ] Remember me behaviour **[VERIFY]**

## 14. Browser navigation

- [ ] Back from details returns to list with filters **[VERIFY]**  
- [ ] Refresh on create form — data loss warning **[VERIFY]**  
- [ ] History does not expose forbidden portal pages after role switch  
- [ ] Deep link while logged in as wrong role redirects safely

## 15. Permissions / hidden controls

- [ ] FR: no Edit/Delete project, no Post Comment  
- [ ] PM: no Create Project, no Masters  
- [ ] Hidden ≠ only CSS; API must 401/403  
- [ ] Menu items not briefly flashing then disappearing

## 16. Messages

- [ ] Incorrect success on failure  
- [ ] Permission message exact for FR comments  
- [ ] Empty states: “No clients found” vs “No users found” consistency

## 17. Dates / timezone

- [ ] Default activity date = local today  
- [ ] DST / UTC offset display consistency  
- [ ] Filter boundaries inclusive  
- [ ] Comment timestamps match server time policy

## 18. Duplicate submission / race

- [ ] Double-click Create Client / Submit Activity  
- [ ] Parallel tabs creating same project code  
- [ ] Slow network: user retries → duplicates  
- [ ] E2E shared JSON overwritten by parallel workers **[FRAMEWORK]**

## 19. Network failure

- [ ] Offline login shows error  
- [ ] Mid-upload failure recoverable  
- [ ] 500 on dashboard does not blank entire shell  
- [ ] Retry behaviour

## 20. API response

- [ ] UI numbers match API (dashboard)  
- [ ] Pagination metadata trusted  
- [ ] Hardcoded host mismatch Amplify vs duckdns **[FRAMEWORK RISK]**  
- [ ] IDOR: FR activity ID of another user **[SECURITY]**

## 21. Comments

- [ ] Blank / whitespace-only  
- [ ] Max length  
- [ ] HTML/script in comment body  
- [ ] **[KNOWN]** FR visibility of PM comments  
- [ ] Count vs list mismatch

## 22. Uploads

- [ ] Wrong MIME renamed to .png  
- [ ] 0-byte file  
- [ ] >10MB  
- [ ] Many files  
- [ ] Remove attachment before submit

## 23. Accessibility

- [ ] Headings hierarchy  
- [ ] Form labels  
- [ ] Colour not sole status indicator  
- [ ] Dialog accessible name  
- [ ] Screen reader announces toasts

## 24. Broken links / nav

- [ ] Quick links on all dashboards  
- [ ] Breadcrumbs  
- [ ] View All from recent logs  
- [ ] Critical deep link query param

## 25. Automation false positives (meta)

- [ ] Asserting any visible “Draft” / “success” text  
- [ ] Draft edit fallback creating new activity (E2E_006)  
- [ ] Swallowing comment failures (E2E_010)  
- [ ] Missing page methods (`cancelAddEmployee`, `cancelAddVendor`)

---

## Exploratory charters (sample)

1. **Pagination liar** — Force page 2 on every master table; compare network vs UI.  
2. **Comment ghost** — PM comments; FR refreshes, other browser, other role.  
3. **Token yank** — Delete `ji_access_token` mid-form; submit.  
4. **Assignment leak** — FR logs activity; inspect network for all-project IDs.  
5. **Rich text XSS** — Inject markup in Work Performed; view as PM.

---

*Document owner: QA Architecture — Phase 5*
