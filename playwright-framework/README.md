# Playwright Framework

Enterprise-ready **Playwright (JavaScript)** test automation framework.

Supports UI + API testing with Page Object Model, fixtures, multi-browser runs, HTML + Allure reporting, GitHub Actions, Jenkins, and Docker.

---

## Stack

| Piece | Choice |
|-------|--------|
| Language | JavaScript (ESM) |
| Runner | `@playwright/test` |
| Pattern | Page Object Model + fixtures |
| Reports | Playwright HTML + Allure |
| CI | GitHub Actions + Jenkinsfile |
| Containers | Docker / Compose |

---

## Folder map

```text
playwright-framework/
├── api/                 # API clients + endpoints
├── config/              # Environment loading
├── constants/           # Routes, tags, timeouts, HTTP status
├── docker/              # Dockerfile + Compose
├── fixtures/            # test.extend (appEnv, api, loginAs)
├── helpers/             # Playwright-aware helpers
├── pages/               # Page Objects (BasePage, LoginPage)
├── reports/             # HTML + Allure outputs (generated)
├── screenshots|videos|traces/  # Optional manual artifact roots
├── test-data/           # Personas + factories + upload files
├── tests/
│   ├── smoke/           # PR gate
│   ├── sanity/
│   ├── regression/
│   ├── api/
│   └── visual/
├── utils/               # Pure helpers (unique data, dates)
├── .github/workflows/   # GitHub Actions
├── Jenkinsfile
├── playwright.config.js
├── .env.example
└── package.json
```

---

## Prerequisites

- Node.js LTS
- npm
- (Optional) Docker Desktop
- (Optional) Java for Allure CLI is bundled via `allure-commandline`

---

## Setup

```bash
cd playwright-framework
npm ci
npm run browsers
```

### Environment

```bash
cp .env.example .env
# Also copy to .env.qa / .env.staging / .env.production as needed
```

Edit at least:

```env
BASE_URL=https://your-app.example.com
API_BASE_URL=                 # optional; defaults to BASE_URL
ADMIN_EMAIL=
ADMIN_PASSWORD=
USER_EMAIL=
USER_PASSWORD=
```

Select environment at runtime:

```bash
# default → .env (TEST_ENV=local)
npm test

TEST_ENV=qa npm test
npm run test:qa
npm run test:staging
```

**Never commit** `.env`, `.env.qa`, `.env.staging`, or `.env.production`.

---

## Run tests

```bash
# All projects (chromium, firefox, webkit)
npm test

# Single browser
npx playwright test --project=chromium

# Smoke only
npx playwright test --project=chromium --grep @smoke

# API folder
npx playwright test tests/api --project=chromium

# Headed / UI / debug
npm run test:headed
npm run test:ui
npm run test:debug
```

### Tags

Defined in `constants/tags.js`. Put them in the test title:

```js
test(`login form is displayed ${TAGS.smoke}`, async ({ page }) => { ... });
```

Filter: `npx playwright test --grep @smoke`

---

## Writing tests (quick patterns)

### UI with fixture login

```js
import { test, expect } from '../fixtures/index.js';
import { personas } from '../test-data/personas.js';
import { TAGS } from '../constants/tags.js';

test(`admin can sign in ${TAGS.smoke}`, async ({ loginAs }) => {
  await loginAs(personas.admin);
});
```

### Page Object only

```js
import { test } from '../fixtures/index.js';
import { LoginPage } from '../pages/LoginPage.js';

test('login page loads', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.expectLoaded();
});
```

### API

```js
import { test, expect } from '../fixtures/index.js';
import { HealthApi } from '../api/clients/HealthApi.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

test('health', async ({ api }) => {
  const health = new HealthApi(api);
  const res = await health.getHealth();
  expect(res.status()).toBe(HTTP_STATUS.OK);
});
```

**Rules**

- No hardcoded URLs or passwords in specs/pages
- Locators live in `pages/`; fixtures only orchestrate
- Unique create-data via `test-data/factories` + `utils/uniqueData`

---

## Reports & artifacts

| Output | Command / location |
|--------|--------------------|
| Playwright HTML | `npm run report` → `reports/html` |
| Allure | `npm run allure:report` → `reports/allure-report` |
| Traces / videos / screenshots | `test-results/` (see `screenshots/README.md`) |

```bash
npx playwright show-trace test-results/<folder>/trace.zip
```

---

## CI

### GitHub Actions

Workflow: `.github/workflows/playwright.yml`

Add repository secrets: `BASE_URL`, `API_BASE_URL`, `ADMIN_*`, `USER_*`.  
Optional variable: `TEST_ENV` (default `qa`).

Runs: Chromium + `--grep @smoke`, uploads HTML / Allure / `test-results`.

### Jenkins

Use root `Jenkinsfile`. Create secret-text credentials `PW_BASE_URL`, `PW_API_*`, `PW_ADMIN_*`, `PW_USER_*`.  
Parameters: `TEST_ENV`, `GREP`, `PROJECT`.

If this folder is not the Git root, wrap stages in `dir('playwright-framework') { ... }`.

---

## Docker

Image tag in `docker/Dockerfile` must match `@playwright/test` (currently **1.62.0**).

```bash
npm run docker:build
BASE_URL=https://qa.example.com npm run docker:smoke
```

Or:

```bash
docker compose -f docker/docker-compose.yml run --rm \
  -e BASE_URL=https://qa.example.com playwright
```

---

## Conventions

1. **One concern per folder** — `utils` (pure) vs `helpers` (Playwright) vs `pages` (UI) vs `api` (HTTP)
2. **Suites by intent** — smoke / sanity / regression / api / visual
3. **Scale by module** — add `pages/modules/<feature>` and `tests/regression/<feature>` as the product grows
4. **SOLID where useful** — `BasePage` / `BaseApiClient`; avoid deep inheritance trees

---

## Troubleshooting

| Symptom | Check |
|---------|--------|
| `Missing required environment variable` | Fill `.env*` or CI secrets |
| `[config] .env.qa not found` | Create file or export vars in Docker/CI |
| Login locators fail | Adjust `pages/LoginPage.js` to your app’s accessible names |
| Health API 404 | Set `API_ENDPOINTS.health` in `api/endpoints.js` |
| Docker browsers mismatch | Bump `mcr.microsoft.com/playwright:vX.Y.Z-jammy` with npm Playwright version |

---

## License

MIT
