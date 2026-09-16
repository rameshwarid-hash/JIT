# Screenshots / videos / traces

## What Playwright does by default

Failure artifacts are written under **`test-results/`** (see `outputDir` in `playwright.config.js`):

- screenshot (`screenshot: 'only-on-failure'`)
- video (`video: 'retain-on-failure'`)
- trace (`trace: 'retain-on-failure'`)

Open a trace: `npx playwright show-trace test-results/.../trace.zip`

## What these folders are for

| Folder | Intended use |
|--------|----------------|
| `screenshots/` | Optional **manual** or custom captures (`page.screenshot({ path: 'screenshots/...' })`) |
| `videos/` | Optional exported copies for stakeholders (not Playwright’s primary path) |
| `traces/` | Optional archived traces you choose to copy out of `test-results/` |

Do **not** commit binary artifacts. Only `.gitkeep` (and this README) stay in git.

## CI

Upload `test-results/` and `reports/` as pipeline artifacts. Copy into these folders only if your process requires a fixed path for another tool.
