import { Page } from '@playwright/test'

/**
 * Hosts that are fetched purely for analytics. They contribute nothing to any
 * assertion, but they are same-document subresources, so the browser keeps
 * them in the "delay the load event" set -- an `async` gtag tag on the
 * transition page still holds `load` open until it settles.
 */
const analyticsHostPattern =
  /^https?:\/\/([^/]*\.)?(googletagmanager\.com|google-analytics\.com|datadoghq\.com|datadoghq-browser-agent\.com|browser-intake-datadoghq\.com)\//

/**
 * Aborts analytics requests for the lifetime of `page`.
 *
 * Without this, every navigation's wall-clock depends on third-party network
 * latency from the CI runner.
 */
export async function blockAnalytics(page: Page): Promise<void> {
  await page.route(analyticsHostPattern, (route) => route.abort())
}

/**
 * Navigates and waits for `DOMContentLoaded` rather than `load`.
 *
 * Playwright's `page.goto` defaults to `waitUntil: 'load'`, which blocks until
 * every subresource settles. testcafe never did: its `pageLoadTimeout`
 * (default 3s) caps how long it waits for `load` after `DOMContentLoaded` and
 * then proceeds regardless. Under `dev` the app ships unminified bundles and
 * third-party tags, so waiting for full `load` can consume the entire test
 * budget. Every assertion in this suite waits on its own locator anyway.
 */
export function gotoPage(page: Page, url: string): Promise<unknown> {
  return page.goto(url, { waitUntil: 'domcontentloaded' })
}

export default gotoPage
