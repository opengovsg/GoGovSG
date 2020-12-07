import { extractShortUrl } from '../../../src/server/util/parse'

jest.mock('../../../src/server/config', () => ({
  ogHostname: 'go.gov.sg',
}))

describe('extractShortUrl tests', () => {
  test('should extract shorturl with full url and https header', () => {
    expect(extractShortUrl('https://go.gov.sg/my-url')).toStrictEqual('my-url')
  })
  test('should not extract shorturl without https header', () => {
    expect(extractShortUrl('go.gov.sg/my-url')).toStrictEqual(
      'go.gov.sg/my-url',
    )
  })
})
