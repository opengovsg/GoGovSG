import {
  initiatedLoginHref,
  initiatedLoginIssuer,
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
