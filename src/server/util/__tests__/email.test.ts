import { isValidGovEmail } from '../email'

/**
 * Unit tests for isValidGovEmail.
 * Test setup mocks emailValidator to `*.test.sg` (see test/server/config.ts).
 */
describe('isValidGovEmail', () => {
  it('accepts a well-formed government email on an allowed domain', () => {
    expect(isValidGovEmail('user@agency.test.sg')).toBe(true)
  })

  it('accepts plus-tagged local parts on an allowed domain', () => {
    expect(isValidGovEmail('user.name+tag@agency.test.sg')).toBe(true)
  })

  it('rejects emails on a disallowed domain', () => {
    expect(isValidGovEmail('user@gmail.com')).toBe(false)
  })

  it('rejects malformed strings', () => {
    expect(isValidGovEmail('not-an-email')).toBe(false)
    expect(isValidGovEmail('')).toBe(false)
    expect(isValidGovEmail('a@b@c@agency.test.sg')).toBe(false)
  })

  it('rejects emails with leading or trailing whitespace', () => {
    expect(isValidGovEmail(' user@agency.test.sg')).toBe(false)
    expect(isValidGovEmail('user@agency.test.sg ')).toBe(false)
  })

  /**
   * Quoted nested addresses can pass validator.isEmail and the domain glob
   * (local part looks like a quoted string, domain is still *.test.sg) but must
   * be rejected by the well-formedness schema.
   */
  it('rejects quoted nested emails that pass domain matching', () => {
    expect(isValidGovEmail('"user@gmail.com"@agency.test.sg')).toBe(false)
  })

  it('rejects %-escaped mail routes on an allowed domain', () => {
    expect(isValidGovEmail('user%gmail.com@agency.test.sg')).toBe(false)
  })

  it('rejects encoded-word local parts on an allowed domain', () => {
    expect(
      isValidGovEmail('=?utf-7?b?JkFHWUFid0J2QUdJQVlRQnkt?=@agency.test.sg'),
    ).toBe(false)
  })
})
