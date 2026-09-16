// @ts-check
/**
 * utils/network.js
 * ----------------
 * Shared helpers for asserting API responses (defect-finding, not smoke).
 */
/**
 * Wait for a matching network response and return it.
 * @param {import('@playwright/test').Page} page
 * @param {{ urlPart: string | RegExp, method?: string, status?: number }} opts
 * @param {() => Promise<unknown>} [trigger] action that causes the request
 */
export async function waitForApi(page, opts, trigger) {
  const method = (opts.method || 'GET').toUpperCase();
  const status = opts.status ?? 200;
  const urlPart = opts.urlPart;

  const predicate = (/** @type {import('@playwright/test').Response} */ res) => {
    const url = res.url();
    const urlOk =
      typeof urlPart === 'string' ? url.includes(urlPart) : urlPart.test(url);
    return (
      urlOk &&
      res.request().method() === method &&
      res.status() === status
    );
  };

  if (trigger) {
    const [response] = await Promise.all([
      page.waitForResponse(predicate, { timeout: 30_000 }),
      trigger(),
    ]);
    return response;
  }

  return page.waitForResponse(predicate, { timeout: 30_000 });
}

/**
 * Collect pageerror + console error messages during an async action.
 * @param {import('@playwright/test').Page} page
 * @param {() => Promise<void>} action
 * @returns {Promise<string[]>}
 */
export async function collectConsoleErrors(page, action) {
  /** @type {string[]} */
  const errors = [];

  const onPageError = (/** @type {Error} */ err) => {
    errors.push(err.message);
  };
  const onConsole = (/** @type {import('@playwright/test').ConsoleMessage} */ msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  };

  page.on('pageerror', onPageError);
  page.on('console', onConsole);
  try {
    await action();
  } finally {
    page.off('pageerror', onPageError);
    page.off('console', onConsole);
  }
  return errors;
}
