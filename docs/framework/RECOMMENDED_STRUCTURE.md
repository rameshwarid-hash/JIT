# RECOMMENDED FOLDER STRUCTURE — Phase 8

Target layout for the JIT Playwright framework (JavaScript, ESM).  
Migrate incrementally; keep imports working via short moves + path updates.

```
JIT/
├── docs/
│   ├── PROJECT_ANALYSIS.md
│   ├── ROLE_MATRIX.md
│   ├── BUSINESS_RULES.md
│   ├── TEST_STRATEGY.md
│   ├── BUG_PATTERNS.md
│   ├── framework/
│   │   ├── FRAMEWORK_REVIEW.md
│   │   └── RECOMMENDED_STRUCTURE.md
│   └── test-cases/
│       ├── authentication.md
│       ├── dashboard.md
│       ├── masters.md
│       ├── projects.md
│       ├── activity-logs.md
│       └── comments-notifications-rbac.md
│
├── config/
│   ├── env.js                 # validate & export BASE_URL, credentials, API_BASE_URL
│   └── timeouts.js
│
├── constants/
│   ├── routes.js              # /login, role homes, masters paths
│   ├── roles.js               # superAdmin | projectManager | fieldResource
│   ├── activityCategories.js
│   └── messages.js            # toast / permission strings
│
├── fixtures/
│   ├── index.js               # re-export test/expect
│   ├── auth.fixture.js
│   ├── api.fixture.js
│   └── softAssert.fixture.js
│
├── pages/
│   ├── BasePage.js
│   ├── LoginPage.js
│   ├── superAdmin/
│   ├── projectManager/
│   └── fieldResource/
│
├── components/                # NEW — shared UI fragments
│   ├── Sidebar.js
│   ├── TopBar.js
│   ├── NotificationsDialog.js
│   ├── DataTable.js
│   ├── Pagination.js
│   ├── SearchFilterBar.js
│   ├── ConfirmDialog.js
│   ├── ActivityDetailsDialog.js
│   └── FileUpload.js
│
├── helpers/
│   ├── api/
│   │   ├── ApiClient.js
│   │   ├── auth.api.js
│   │   ├── clients.api.js
│   │   ├── projects.api.js
│   │   └── activities.api.js
│   ├── assert/
│   │   ├── pagination.assert.js
│   │   └── dashboard.assert.js
│   └── files.js
│
├── utils/
│   ├── uniqueData.js
│   ├── network.js
│   ├── e2eState.js
│   └── e2eWorkflow.js
│
├── test-data/
│   ├── users.js
│   ├── superAdmin/
│   ├── e2e/
│   │   └── fixtures/          # sample.png, sample.pdf
│   └── factories/             # clientFactory, projectFactory, userFactory
│
├── data/                      # optional static JSON fixtures
│
├── tests/
│   ├── smoke/
│   │   └── login.smoke.spec.js
│   ├── sanity/
│   │   └── critical-path.sanity.spec.js
│   ├── authentication/
│   ├── dashboard/
│   ├── activityLogs/
│   ├── projects/
│   ├── comments/
│   ├── notifications/
│   ├── users/                 # employees masters
│   ├── roles/
│   ├── permissions/           # rbac UI + API
│   ├── reports/
│   ├── api/
│   ├── visual/
│   ├── accessibility/
│   ├── performance/
│   ├── regression/
│   │   └── e2e/               # serial workflow suite
│   └── (legacy superAdmin/ during migration)
│
├── playwright.config.js
├── package.json
├── .env.example
└── .github/workflows/playwright.yml
```

---

## Playwright projects (suggested)

```js
projects: [
  { name: 'setup-sa', testMatch: /auth\.setup\.sa\.js/ },
  { name: 'setup-pm', testMatch: /auth\.setup\.pm\.js/ },
  { name: 'setup-fr', testMatch: /auth\.setup\.fr\.js/ },
  {
    name: 'chromium-smoke',
    grep: /@smoke/,
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'chromium-regression',
    grep: /@regression/,
    dependencies: ['setup-sa'],
  },
  {
    name: 'e2e-serial',
    testMatch: /tests\/regression\/e2e\/.*.spec.js/,
    fullyParallel: false,
    workers: 1,
  },
  // later: firefox-smoke, webkit-smoke, mobile-chrome
]
```

---

## Migration rules

1. **Move one domain at a time** (e.g. `tests/login.spec.js` → `tests/smoke/` + `tests/authentication/`).  
2. Update imports; keep old path as re-export shim for one sprint if needed.  
3. Extract components only when the same locator appears in **≥2** page objects.  
4. Do not mix folder move with behaviour changes in the same PR.  
5. After structure stable → expand automation mapped to `docs/test-cases/*`.

---

## Mapping: current → target

| Current | Target |
|---------|--------|
| `tests/login.spec.js` | `tests/smoke/` + `tests/authentication/` |
| `tests/superAdmin/*` | `tests/dashboard`, `projects`, `users`, `activityLogs`, … |
| `tests/e2e/*` | `tests/regression/e2e/` (serial project) |
| `fixtures/auth.fixture.js` | `fixtures/auth.fixture.js` + `fixtures/index.js` |
| `utils/network.js` | `utils/network.js` + `helpers/api/*` |
| `test-data/*` | keep + add `factories/` |

---

## Phase 9 gate

Automation expansion starts **only when**:

- [x] Phases 1–6 docs exist  
- [ ] Phase 7 review accepted by team  
- [ ] P0 framework fixes applied (broken methods, E2E serialisation)  
- [ ] Product decision on FR comment visibility  
- [ ] Known defects logged in tracker (pagination, phone, duplicates)

Until then, prefer **manual execution** of `docs/test-cases/*` and exploratory charters in `BUG_PATTERNS.md`.

---

*Document owner: QA Architecture — Phase 8*
