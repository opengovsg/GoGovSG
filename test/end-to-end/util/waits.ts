import { expect, Page } from '@playwright/test'
import { apiLocation } from './config'
import {
  isUserLinksRequest,
  type UserLinksQuery,
} from '../../shared/userLinksQuery'

/**
 * Resolves once the user page's link table has refetched. The search input
 * debounces by SEARCH_TIMEOUT (500ms) before dispatching getUrlsForUser, so an
 * assertion made straight after typing races the refetch.
 *
 * Prefer this over polling the table alone when the expected rows could already
 * be on screen from the previous query: a poll would pass against the stale
 * table without ever proving the new search ran.
 *
 * Pass `query` (param names per urlQueryHelper, values compared decoded) to
 * bind the wait to one specific search rather than any refetch -- necessary
 * where a refetch from the previous step could still be in flight.
 */
export const userLinksRefetch = (
  page: Page,
  query?: UserLinksQuery,
): Promise<unknown> =>
  page.waitForResponse((response) =>
    isUserLinksRequest(response.url(), response.request().method(), query),
  )

/**
 * Waits until the click count recorded against `shortUrlSlug` reaches
 * `expectedClicks`.
 *
 * The redirect handler updates url_clicks without awaiting the write, so the
 * HTTP response can land before the count is visible to the directory's
 * popularity sort (which orders on url_clicks.clicks).
 *
 * Asserts >= rather than ==, so a click counted twice cannot fail a test that
 * only cares about relative popularity.
 */
export const waitForRecordedClicks = async (
  page: Page,
  shortUrlSlug: string,
  expectedClicks: number,
): Promise<void> => {
  await expect
    .poll(
      async () => {
        const response = await page.request.get(
          `${apiLocation}/api/link-stats?url=${shortUrlSlug}`,
        )
        if (!response.ok()) {
          return null
        }
        const { totalClicks } = (await response.json()) as {
          totalClicks: number
        }
        return totalClicks
      },
      { timeout: 15_000 },
    )
    .toBeGreaterThanOrEqual(expectedClicks)
}
