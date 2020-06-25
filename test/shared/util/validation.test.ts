import * as validation from '../../../src/shared/util/validation'
import { ogHostname } from '../../../src/server/config'

describe('Test whiteliste check', () => {
  test('localstack url is whitelisted', () => {
    const url = 'http://localhost:4566'
    expect(validation.isWhitelisted(url)).toBe(true)
  })
})

describe('Test blacklist check', () => {
  test('localstack url is not blacklisted', () => {
    const url = 'http://localhost:4566'
    expect(validation.isBlacklisted(url)).toBe(false)
  })

  test('example bit.ly url is blacklisted', () => {
    const url = 'https://bit.ly/abc'
    expect(validation.isBlacklisted(url)).toBe(true)
  })
})

describe('Test https check', () => {
  test('non-https url fails check', () => {
    const url = 'http://go.gov.sg'
    expect(validation.isHttps(url)).toBe(false)
  })

  test('https url passes check', () => {
    const url = 'https://go.gov.sg'
    expect(validation.isHttps(url)).toBe(true)
  })

  test('localstack url fails check by default', () => {
    const url = 'http://localhost:4566/local-bucket/file1.pdf'
    expect(validation.isHttps(url)).toBe(false)
  })

  test('localstack url passes check with whitelist', () => {
    const url = 'http://localhost:4566/local-bucket/file1.pdf'
    expect(validation.isHttps(url, true)).toBe(true)
  })
})

describe('Test valid url check', () => {
  test('valid url passes check', () => {
    const url = 'https://go.gov.sg'
    expect(validation.isValidUrl(url, true)).toBe(true)
  })

  test('non-https url fails check', () => {
    const url = 'http://go.gov.sg'
    expect(validation.isValidUrl(url)).toBe(false)
  })

  test('url without tld fails check', () => {
    const url = 'http://go'
    expect(validation.isValidUrl(url)).toBe(false)
  })

  test('localstack url fails check by default', () => {
    const url = 'http://localhost:4566/local-bucket/file1.pdf'
    expect(validation.isValidUrl(url)).toBe(false)
  })

  test('localstack url passes check with whitelist', () => {
    const url = 'http://localhost:4566/local-bucket/file1.pdf'
    expect(validation.isValidUrl(url, true)).toBe(true)
  })
})

describe('Test short url check', () => {
  test('check passes with alphabet url', () => {
    const url = 'abcde'
    expect(validation.isValidShortUrl(url)).toBe(true)
  })

  test('check passes with numeric url', () => {
    const url = '12345'
    expect(validation.isValidShortUrl(url)).toBe(true)
  })

  test('check passes with hypen url', () => {
    const url = '-----'
    expect(validation.isValidShortUrl(url)).toBe(true)
  })

  test('check passes with lowercase alphanumeric url', () => {
    const url = 'abcd123'
    expect(validation.isValidShortUrl(url)).toBe(true)
  })

  test('check passes with lowercase alphanumeric url with hypens', () => {
    const url = 'abcd-123'
    expect(validation.isValidShortUrl(url)).toBe(true)
  })

  test('check fails with invalid characters', () => {
    expect(validation.isValidShortUrl('abcDe')).toBe(false)
    expect(validation.isValidShortUrl('abc e')).toBe(false)
    expect(validation.isValidShortUrl('abc!e')).toBe(false)
  })

  test('empty url fails by default', () => {
    expect(validation.isValidShortUrl('')).toBe(false)
  })

  test('empty url passes if blanks are allowed', () => {
    expect(validation.isValidShortUrl('', true)).toBe(true)
  })
})

describe('Test long url check', () => {
  test('empty url fails by default', () => {
    expect(validation.isValidLongUrl('')).toBe(false)
  })

  test('empty url passes if blanks are allowed', () => {
    expect(validation.isValidLongUrl('', true)).toBe(true)
  })
})

describe('Test circular directs check', () => {
  test('example url fails check', () => {
    const url = 'https://example.com/abc'
    expect(validation.isCircularRedirects(url)).toBe(false)
  })

  test('og url passes check', () => {
    const url = `https://${ogHostname}.com/abc`
    expect(validation.isCircularRedirects(url)).toBe(false)
  })
})

describe('test isPrintableAscii', () => {
  it('should return false on non-english language characters', () => {
    expect(validation.isPrintableAscii('在一个风和日丽的早上')).toBeFalsy()
    expect(validation.isPrintableAscii('விக்சன')).toBeFalsy()
    expect(
      validation.isPrintableAscii('在一个风和日丽的早上, test'),
    ).toBeFalsy()
  })

  it('should return true on printable ascii characters', () => {
    expect(validation.isPrintableAscii('test description')).toBeTruthy()
    expect(
      validation.isPrintableAscii("!@#$%^&*()~`-=[];',./\\/*-+"),
    ).toBeTruthy()
    expect(validation.isPrintableAscii('aAbBcC')).toBeTruthy()
  })
})
