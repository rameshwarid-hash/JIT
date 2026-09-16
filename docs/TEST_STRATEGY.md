# TEST STRATEGY — JIT Project Activity Reporting System

---

## 1. Objectives

- Find defects early by thinking like a breaker, not a pass-seeker.  
- Cover **all three roles** for permissions, UI, API, and workflows.  
- Separate **manual exploratory** from **automation**; automate only stable, high-value paths.  
- Prove **server-side authorization**, not only UI redirects.  
- Keep staging clean with data factories + teardown.

---

## 2. Scope

### In scope

Authentication, dashboards, masters (clients/vendors/employees), projects, activity logging, activity logs, comments, notifications, My Team, RBAC, uploads, filters/search/pagination, responsive UI, API contracts used by UI.

### Out of scope (until product confirms)

Formal Approve/Reject workflow, Gate Pass full lifecycle, billing, mobile native apps, SSO/IdP, email delivery content of Forgot Password.

---

## 3. Test Levels & Types

| Type | Purpose | Primary owner | Tooling |
|------|---------|---------------|---------|
| **Smoke** | Build is usable; login + home + one nav per role | Automation | Playwright tags `@smoke` |
| **Sanity** | Critical CRUD + one FR submit + one PM comment | Automation | `@sanity` |
| **Regression** | Full module packs + E2E_001–010 | Mix | `@regression` |
| **UI** | Layout, badges, empty states, dialogs, responsive | Manual + auto | Visual + viewport projects |
| **Functional** | Business rules per module | Both | Specs + Excel |
| **Permission / RBAC** | Menus, buttons, URLs, API 403 | Both | Role matrix |
| **API** | Authz, validation, pagination contracts | Automation | `APIRequestContext` + UI session token |
| **Accessibility** | Roles, names, keyboard, contrast | Both | axe-core + manual |
| **Performance** | Dashboard/list load, upload | Manual + metrics | Timing asserts / Lighthouse sample |
| **Negative** | Invalid creds, blank fields, bad files, bad dates | Both | Dedicated suites |
| **Boundary** | Max lengths, file size, date edges, page size | Both | Data-driven |
| **Security** | XSS in rich text, IDOR, token theft vectors, brute force UX | Manual + API | Checklist |
| **Compatibility** | Chromium, Firefox, WebKit | Automation | Playwright projects |
| **Cross Browser** | Same critical paths | Automation | Multi-project CI |
| **Mobile Responsive** | 375 / 768 / 1280 | Both | `devices` + Excel cases |

---

## 4. Entry / Exit Criteria

### Entry

- Staging reachable; credentials in `.env`.  
- Known seed data documented (`test-data/superAdmin/masters.js`).  
- Defects from prior cycle triaged.

### Exit

- All `@smoke` / `@sanity` green.  
- No open P0/P1 on RBAC, auth, data loss, or comment integrity.  
- Exploratory charter notes filed.  
- Known defects logged (pagination, phone, duplicate client, FR comments).

---

## 5. Suite Design

```
Smoke (≤10 min)
  └─ Login × 3 roles → dashboard visible → logout → protected redirect

Sanity (≤30 min)
  └─ SA create client → publish project → FR submit → PM comment

Regression
  ├─ Module packs (auth, dashboard, masters, projects, logs, comments, team)
  ├─ E2E chain (serial dependency)
  └─ RBAC matrix URLs + API

Nightly / Pre-release
  ├─ Cross-browser smoke
  ├─ Accessibility sample
  └─ Negative + boundary packs
```

---

## 6. Role-Based Execution Matrix

Every applicable case runs for each role:

| Area | SA | PM | FR |
|------|----|----|----|
| Login / logout | Y | Y | Y |
| Dashboard widgets | Y | Y | Y |
| Masters CRUD | Y | Deny | Deny |
| Create project | Y | Deny | Deny |
| View assigned projects | All | Assigned | Assigned |
| Log activity | — | Y | Y |
| Comment write | Verify | Y | Deny |
| Comment read | Y | Y | Verify |
| My Team | Deny | Y | Deny |
| Notifications | Y | Y | Y |

---

## 7. Environments & Data

| Env | Use |
|-----|-----|
| Staging Amplify | Default automation |
| Local `BASE_URL` | Dev verification |

**Data strategy**

- Unique suffix factories for all creates.  
- Shared E2E state only inside **serial** project.  
- Teardown: delete clients/projects/users where API allows.  
- Never commit `.env` or `lastWorkflow.json` secrets.

---

## 8. Defect Severity

| Sev | Example |
|-----|---------|
| P0 | Auth broken; any role can access SA masters via API |
| P1 | FR cannot submit; PM cannot comment; data loss on draft |
| P2 | Pagination desync; validation gaps (phone) |
| P3 | Copy inconsistency; minor alignment |

---

## 9. Traceability

| Artifact | Maps to |
|----------|---------|
| Excel SA/PM/FR packs | Manual + automation IDs |
| `docs/BUSINESS_RULES.md` | Rule IDs in asserts |
| `docs/ROLE_MATRIX.md` | Permission cases |
| `docs/test-cases/*` | Manual execution |
| Playwright `testInfo.annotations` | Rule / TC ID |

---

## 10. Automation Principles (post-docs)

- Arrange / Act / Assert with meaningful asserts (UI + API).  
- POM + fixtures + helpers; no duplicated locators.  
- Soft asserts for multi-field dashboards where appropriate.  
- Screenshot / video / trace on failure (already in config).  
- Prefer role/label locators; introduce `data-testid` with app team.  
- Tag tests: `@smoke @sanity @regression @rbac @api @a11y`.

---

## 11. Risks to Strategy

- Parallel E2E files overwriting shared JSON.  
- Staging data pollution.  
- Flaky selectors (`.first()`, generic “success”).  
- Comment visibility product bug masking true failures.  
- Chromium-only CI today.

---

## 12. Reporting

- Playwright HTML + list reporter.  
- Publish CI artifacts (report, traces).  
- Weekly QA summary: new defects, flaky rate, RBAC gaps.

---

*Document owner: QA Architecture — Phase 4*
