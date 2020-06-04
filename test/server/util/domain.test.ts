import parseDomain from '../../../src/server/util/domain'

describe('Domain parser', () => {
  it('should return domain name', () => {
    expect(parseDomain('https://google.com/test')).toBe('google.com')
  })
})
