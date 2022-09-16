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

describe('Test valid tag check', () => {
  test('check passes with empty string if blanks are allowed', () => {
    expect(validation.isValidTag('', true)).toBe(true)
  })

  test('check passes with alphanumeric characters and hyphens and underscores', () => {
    expect(validation.isValidTag('test123')).toBe(true)
    expect(validation.isValidTag('foo_bar')).toBe(true)
    expect(validation.isValidTag('TEST-TAG')).toBe(true)
    expect(validation.isValidTag('aYs8-SNDw01_x')).toBe(true)
  })

  test('check fails with invalid characters', () => {
    expect(validation.isValidTag('tag;1')).toBe(false)
    expect(validation.isValidTag('foo,bar')).toBe(false)
    expect(validation.isValidTag('A:B')).toBe(false)
    expect(validation.isValidTag('one two')).toBe(false)
    expect(validation.isValidTag('morning早上')).toBe(false)
  })

  test('check fails with length exceeding 25 characters', () => {
    expect(validation.isValidTag('abcdefghijklmnopqrstuvwxyz')).toBe(false)
  })

  test('check fails with non-trimmed string', () => {
    expect(validation.isValidTag(' test  ')).toBe(false)
  })

  test('check fails with empty string', () => {
    expect(validation.isValidTag('')).toBe(false)
  })
})

describe('Test valid tags check', () => {
  test('check passes with at most 3 unique and valid tags', () => {
    expect(validation.isValidTags(['tag', '2tag', 'OnE-2_ThrEe'])).toBe(true)
    expect(validation.isValidTags(['tag', 'TAG'])).toBe(true)
    expect(validation.isValidTags([])).toBe(true)
  })

  test('check fails with duplicate tags', () => {
    expect(validation.isValidTags(['TesT', 'TesT'])).toBe(false)
    expect(validation.isValidTags(['foo', 'bar', 'foo'])).toBe(false)
  })

  test('check fails with any invalid tag', () => {
    expect(validation.isValidTags(['valid', 'valid-2', 'invalid,tag'])).toBe(
      false,
    )
    expect(validation.isValidTags([' test '])).toBe(false)
  })

  test('check fails with more than 3 tags', () => {
    expect(validation.isValidTags(['one', 'two', 'three', 'four'])).toBe(false)
  })
})
