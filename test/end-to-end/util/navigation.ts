import { Page } from '@playwright/test'

/**
 * Navigates and waits for `DOMContentLoaded` rather than `load`.
 *
 * `page.goto` defaults to `waitUntil: 'load'`, which blocks until every
 * subresource settles -- including the transition page's `async` gtag tag,
 * which holds the load event until it resolves over the network. Waiting for
 * that can consume the whole test budget.
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
