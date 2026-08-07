import { isUserLinksRequest } from './userLinksQuery'

const userLinksUrl = (search = '') =>
  `http://localhost:3000/api/user/url${search}`

describe('isUserLinksRequest', () => {
  it('matches any link-table fetch when no query is given', () => {
    expect(
      isUserLinksRequest(userLinksUrl('?limit=10&searchText=&tags='), 'GET'),
    ).toBe(true)
  })

  it('rejects non-GET requests to the same path', () => {
    // The app PATCHes /api/user/url to edit links and toggle state; treating
    // one of those as a refetch would let an assertion run against stale rows.
    expect(isUserLinksRequest(userLinksUrl(), 'PATCH')).toBe(false)
    expect(isUserLinksRequest(userLinksUrl(), 'POST')).toBe(false)
  })

  it('rejects other paths, including the bulk child path', () => {
    expect(
      isUserLinksRequest('http://localhost:3000/api/user/url/bulk', 'GET'),
    ).toBe(false)
    expect(
      isUserLinksRequest('http://localhost:3000/api/directory/search', 'GET'),
    ).toBe(false)
  })

  it('matches when every constrained param equals, comparing decoded values', () => {
    expect(
      isUserLinksRequest(
        userLinksUrl('?searchText=&tags=tag_1%3BTAG-2'),
        'GET',
        { tags: 'tag_1;TAG-2' },
      ),
    ).toBe(true)
  })

  it('rejects a refetch carrying a different query', () => {
    // The stale-in-flight case: link creation refetches with an empty search,
    // which must not satisfy a wait bound to the tag search that follows.
    expect(
      isUserLinksRequest(userLinksUrl('?searchText=&tags='), 'GET', {
        tags: 'tag_1',
      }),
    ).toBe(false)
  })

  it('distinguishes an empty param from an absent one', () => {
    expect(
      isUserLinksRequest(userLinksUrl('?tags='), 'GET', { tags: '' }),
    ).toBe(true)
    expect(
      isUserLinksRequest(userLinksUrl('?limit=10'), 'GET', { tags: '' }),
    ).toBe(false)
  })

  it('compares values case-sensitively', () => {
    // 'TaG_' exercises a case-insensitive server-side match, so the client must
    // be observed sending exactly that.
    expect(
      isUserLinksRequest(userLinksUrl('?tags=TaG_'), 'GET', { tags: 'TaG_' }),
    ).toBe(true)
    expect(
      isUserLinksRequest(userLinksUrl('?tags=tag_'), 'GET', { tags: 'TaG_' }),
    ).toBe(false)
  })
})
