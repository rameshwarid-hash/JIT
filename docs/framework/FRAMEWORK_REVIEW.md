# FRAMEWORK REVIEW — Current Playwright Suite

> Phase 7 — Enterprise assessment of the existing JIT automation repository.  
> **Do not treat this as a mandate to rewrite blindly; prioritize high-risk gaps first.**

---

## 1. Current strengths

| Area | Evidence |
|------|----------|
| POM by role | `pages/superAdmin`, `projectManager`, `fieldResource` |
| Credentials isolation | `test-data/users.js` + `.env` |
| Auth fixture | `loginAs` / `logout` in `fixtures/auth.fixture.js` |
| Accessible locators | Heavy use of `getByRole` / labels |
| Web-first asserts | Prefer `expect` auto-wait over sleeps |
| Failure artifacts | screenshot, video, trace on retry |
| Unique data | `utils/uniqueData.js` |
| API wait helper | `utils/network.js` |
| Cross-role E2E | `tests/e2e/e2e-001` … `010` |
| Dashboard UI↔API | Strong business asserts |
| RBAC negatives | URL redirect coverage |
| Comments documenting defects | Staging FR comments, pagination, etc. |

---

## 2. Gaps vs enterprise standards

| Standard | Current | Recommendation |
|----------|---------|----------------|
| Component objects | Missing | `components/` for Sidebar, DataTable, Pagination, NotificationsDialog, ConfirmDialog, FileUpload |
| API client layer | Partial (inline waits) | `helpers/api/` with auth header from `ji_access_token` |
| Storage state auth | Fresh UI login every test | Optional `globalSetup` + `storageState` per role for speed |
| Test tags / projects | None | `@smoke` `@sanity` `@regression` `@rbac` + Playwright grep |
| Serial E2E orchestration | JSON file + parallel risk | Dedicated `project: e2e-serial` with `workers: 1` + `dependencies` |
| Soft assertions | Rare | Soft expect batches for dashboards |
| Custom matchers | None | `expect.extend` for JWT present, pagination sync |
| Cross-browser | Chromium only | Enable Firefox/WebKit smoke |
| Accessibility | None | `@axe-core/playwright` sample suite |
| Visual | None | Optional screenshot baselines for badges/dialogs |
| Cleanup / teardown | None | Delete API or SA UI cleanup fixture |
| Constants | Scattered strings | `constants/routes.js`, `roles.js`, `timeouts.js` |
| Config module | Only playwright.config | `config/env.js` validating all env keys once |
| Lint | No ESLint | Add ESLint + `@typescript-eslint` or JS lint |
| data-testid | Rare | Partner with app team for stable hooks |
| Assertions in POs | Heavy | Keep actions in POs; move complex business asserts to helpers/tests |
| Missing PO methods | `cancelAddEmployee`, `cancelAddVendor` called but absent | Fix immediately (broken specs) |
| Hardcoded API host | Dashboard duckdns | Derive from `baseURL` or env `API_BASE_URL` |
| Windows `test:local` | POSIX `BASE_URL=` | Cross-env |
| Stray file | `tests/superAdmin/Untitled` | Delete |
| Secrets in CI | Workflow may lack secrets | Document required GitHub secrets |
| DB validation | N/A (no DB access) | Prefer API contract as source of truth |

---

## 3. Code quality findings (actionable)

### P0 — Fix before trusting CI

1. **Broken methods:** `employees.spec.js` → `cancelAddEmployee`; `vendors.spec.js` → `cancelAddVendor`.  
2. **E2E parallel hazard:** `fullyParallel: true` + shared `lastWorkflow.json`.  
3. **False positives:** E2E_006 draft fallback; E2E_010 swallowed comment errors; E2E_005 soft comment visibility.

### P1 — Reliability

4. Prefer actionability clicks over `dispatchEvent('click')` for Post Comment.  
5. Assert upload completion, not merely file input presence.  
6. Tighten success matchers (role-specific toast text).  
7. Unify API base URL handling.

### P2 — Structure

8. Extract shared table/search/pagination.  
9. Tag suites; split smoke from regression.  
10. Add API authorization tests using bearer token.

---

## 4. Recommended enterprise stack (JS)

```
Playwright Test
├── Page Object Model (pages/)
├── Component Object Model (components/)
├── Fixtures (auth, api, softExpect)
├── Helpers (api, assert, wait, files)
├── Constants + Config + Test data
├── Tags: smoke | sanity | regression | rbac | api | a11y
├── Reporters: list + HTML (+ JUnit for CI)
└── Artifacts: screenshot / video / trace
```

### Fixture ideas

```js
// fixtures/index.js
loginAs, logout, asSuperAdmin, asProjectManager, asFieldResource,
apiClient, unique, softExpect, testData
```

### Assertion layers (every automated scenario)

1. **Arrange** — role, data factory, route  
2. **Act** — POM methods only  
3. **Assert**  
   - UI visibility / text / URL  
   - Network status + `success` payload  
   - Permission (hidden control + API status)  
   - Optional storage token state  

---

## 5. Mapping to SOLID / DRY / KISS

| Principle | Apply |
|-----------|-------|
| S | LoginPage ≠ dashboard KPI math helper |
| O | Extend via components/helpers, not copy specs |
| L | Role-specific pages share BasePage navigation |
| I | Thin fixtures; don’t dump every util into one fixture |
| D | Tests depend on abstractions (POs), not raw selectors |
| DRY | One search/pagination implementation |
| KISS | Don’t over-abstract until 3rd duplication |

---

## 6. Priority roadmap

| Phase | Work | Outcome |
|-------|------|---------|
| A | Fix broken PO methods; delete Untitled; serial E2E project | Green baseline |
| B | Tags + smoke suite; API_BASE_URL; cancel methods | CI confidence |
| C | components/ + api helpers + RBAC API tests | Enterprise depth |
| D | a11y + cross-browser smoke | Release gate |
| E | Align folder structure (Phase 8) without breaking imports | Maintainability |

---

## 7. What NOT to do yet

- Mass rewrite of all page objects in one PR.  
- Automating every Excel row before defects are logged.  
- Treating FR comment visibility as pass without product decision.  
- Generating more E2E JSON-coupled specs.

---

*Document owner: QA Architecture — Phase 7*
