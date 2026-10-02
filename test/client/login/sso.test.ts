import {
  initiatedLoginHref,
  initiatedLoginIssuer,
  oneGovSgCallbackHref,
} from '../../../src/client/login/sso'

const iss = 'https://one.gov.sg/api/auth'

describe('initiatedLoginIssuer', () => {
  it('reads iss appended inside the fragment', () => {
    expect(initiatedLoginIssuer(`?iss=${encodeURIComponent(iss)}`, '')).toBe(
      iss,
    )
  })

  it('reads iss appended to the real query string', () => {
    expect(initiatedLoginIssuer('', `?iss=${encodeURIComponent(iss)}`)).toBe(
      iss,
    )
  })

  it('returns null for a plain login page visit', () => {
    expect(initiatedLoginIssuer('', '')).toBeNull()
  })
})

describe('initiatedLoginHref', () => {
  it('forwards iss encoded to the server login endpoint', () => {
    expect(initiatedLoginHref('https://evil.example/?a=b&next=//x')).toBe(
      '/api/sso/login?iss=https%3A%2F%2Fevil.example%2F%3Fa%3Db%26next%3D%2F%2Fx',
    )
  })
})

describe('oneGovSgCallbackHref', () => {
  it('forwards an authorization response to the server callback', () => {
    expect(
      oneGovSgCallbackHref(
        `?code=abc&state=xyz&iss=${encodeURIComponent(iss)}`,
      ),
    ).toBe(
      '/api/sso/callback?code=abc&state=xyz&iss=https%3A%2F%2Fone.gov.sg%2Fapi%2Fauth',
    )
  })

  it('forwards an error response', () => {
    expect(oneGovSgCallbackHref('?error=access_denied&state=xyz')).toBe(
      '/api/sso/callback?error=access_denied&state=xyz',
    )
  })

  it('ignores a launch with only iss', () => {
    expect(oneGovSgCallbackHref(`?iss=${encodeURIComponent(iss)}`)).toBeNull()
  })

  it('returns null for an empty query', () => {
    expect(oneGovSgCallbackHref('')).toBeNull()
  })
})
