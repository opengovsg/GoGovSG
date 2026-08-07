import { Page } from '@playwright/test'

/**
 * Navigates and waits for `DOMContentLoaded` rather than `load`.
 *
 * Playwright's `page.goto` defaults to `waitUntil: 'load'`, which blocks until
 * every subresource settles -- including the transition page's `async` gtag
 * tag, which delays the load event until it resolves over the network.
 * testcafe never did this: its `pageLoadTimeout` (default 3s) caps how long it
 * waits for load after `DOMContentLoaded` and then proceeds regardless. Under
 * `dev` the app ships unminified bundles alongside third-party tags, so
 * waiting for full load can consume the entire test budget.
 *
 * Every assertion in this suite waits on its own locator, so nothing depends
 * on subresources having settled.
 *
 * Note: do not "improve" this by aborting analytics hosts with `page.route`.
 * Enabling routing disables the browser's HTTP cache, and this app serves
 * large unminified bundles in dev -- every navigation then refetches the whole
 * bundle, which slows the suite by roughly an order of magnitude. Not waiting
 * for `load` already removes the dependency on those requests.
 */
export function gotoPage(page: Page, url: string): Promise<unknown> {
  return page.goto(url, { waitUntil: 'domcontentloaded' })
}

export default gotoPage
