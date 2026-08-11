/**
 * Request matching for the user page's link-table refetch.
 *
 * Lives in test/shared, not test/end-to-end/util, so jest can reach it --
 * jest.config.cjs excludes test/end-to-end via modulePathIgnorePatterns. The
 * Playwright-bound wrapper is `userLinksRefetch` in util/waits.ts.
 */

/**
 * Query params the user page sends on a link-table fetch, named per
 * src/client/app/helpers/urlQueryHelper.ts (`searchText`, `tags`, ...).
 */
export type UserLinksQuery = Record<string, string>

const USER_LINKS_PATHNAME = '/api/user/url'

/**
 * Whether `requestUrl`/`method` is a link-table fetch, optionally narrowed to
 * one specific search.
 *
 * The method check matters: the app PATCHes this same path to edit links, and
 * the bulk endpoint is a child path, so neither may be mistaken for a refetch.
 */
export const isUserLinksRequest = (
  requestUrl: string,
  method: string,
  query: UserLinksQuery = {},
): boolean => {
  const url = new URL(requestUrl)
  if (url.pathname !== USER_LINKS_PATHNAME || method !== 'GET') {
    return false
  }
  // searchParams decodes on read, so separators and casing in the expected
  // values need no escaping at the call site.
  return Object.entries(query).every(
    ([param, value]) => url.searchParams.get(param) === value,
  )
}
