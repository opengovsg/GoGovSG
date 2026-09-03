/* eslint-disable global-require */
import { UploadedFile } from 'express-fileupload'
import {
  BULK_UPLOAD_HEADER,
  BULK_UPLOAD_SHORTURL_HEADER,
} from '../../../../../shared/constants'
import blackListedSites from '../../../../resources/blacklist'

/**
 * Unit tests for BulkService.
 */
type UrlTest = {
  url: string
  testName: string
}

const BULK_UPLOAD_MAX_NUM = 5
const BULK_UPLOAD_RANDOM_STR_LENGTH = 4
const OG_HOST_NAME = 'go.gov.sg'

const invalidUrlTests: UrlTest[] = [
  {
    url: '',
    testName: 'fails with empty row',
  },
  {
    url: 'http://nusmods.com',
    testName: 'fails with non http url',
  },
  {
    url: 'https://nusmods.com,http://nusmods.com',
    testName: 'fails with a row with more than one column',
  },
  {
    url: `${blackListedSites[0]}`,
    testName: 'fails with a row with blacklisted url',
  },
  {
    url: 'https://nusmods.comヽ(•‿•)ノ',
    testName: 'fails with rows with invalid characters',
  },
  {
    url: `https://${OG_HOST_NAME}/shortlink`,
    testName: 'fails with rows with circular redirects',
  },
  {
    url: Array(BULK_UPLOAD_MAX_NUM + 1)
      .fill(1)
      .map((_) => 'https://nusmods.com')
      .join('\n'),
    testName: `fails with more than ${BULK_UPLOAD_MAX_NUM} valid links`,
  },
]

const validUrlTests: UrlTest[] = [
  {
    url: `https://nusmods.com`,
    testName: 'passes with one valid row',
  },
  {
    url: Array(BULK_UPLOAD_MAX_NUM)
      .fill(1)
      .map((_) => 'https://nusmods.com')
      .join('\n'),
    testName: 'passes with maximum valid rows',
  },
]

const mockUrlRepository = {
  isShortUrlAvailable: jest.fn(),
}

describe('BulkService tests', () => {
  afterAll(jest.resetModules)

  describe('parseCsv tests', () => {
    jest.resetModules()
    jest.mock('../../../../config', () => ({
      bulkUploadMaxNum: BULK_UPLOAD_MAX_NUM,
      ogHostname: OG_HOST_NAME,
    }))
    const { BulkService } = require('..')
    const service = new BulkService(mockUrlRepository)

    beforeEach(() => {
      mockUrlRepository.isShortUrlAvailable.mockReset()
      mockUrlRepository.isShortUrlAvailable.mockResolvedValue(true)
    })

    it('fails if file data string is empty', async () => {
      await expect(service.parseCsv({})).rejects.toThrowError()
    })

    it('fails if header does not match BULK_UPLOAD_HEADER', async () => {
      const file = {
        data: Buffer.from(`Hello, this is ${BULK_UPLOAD_HEADER}\n`),
        name: 'file.csv',
      } as UploadedFile

      await expect(service.parseCsv(file)).rejects.toThrowError()
    })

    validUrlTests.forEach((validUrlTest) => {
      it(validUrlTest.testName, async () => {
        const file = {
          data: Buffer.from(`${BULK_UPLOAD_HEADER}\n${validUrlTest.url}`),
          name: 'file.csv',
        } as UploadedFile

        await expect(service.parseCsv(file)).resolves.not.toThrow()
      })
    })
    invalidUrlTests.forEach((invalidUrlTest) => {
      it(invalidUrlTest.testName, async () => {
        const file = {
          data: Buffer.from(`${BULK_UPLOAD_HEADER}\n${invalidUrlTest.url}`),
          name: 'file.csv',
        } as UploadedFile

        await expect(service.parseCsv(file)).rejects.toThrowError()
      })
    })

    it('returns longUrl rows for single-column CSV without shortUrl', async () => {
      const file = {
        data: Buffer.from(
          `${BULK_UPLOAD_HEADER}\nhttps://example.com/a\nhttps://example.com/b`,
        ),
        name: 'file.csv',
      } as UploadedFile

      await expect(service.parseCsv(file)).resolves.toEqual([
        { longUrl: 'https://example.com/a' },
        { longUrl: 'https://example.com/b' },
      ])
    })

    it('accepts two-column header with blank custom short links', async () => {
      const file = {
        data: Buffer.from(
          `${BULK_UPLOAD_HEADER},${BULK_UPLOAD_SHORTURL_HEADER}\nhttps://example.com/a,\nhttps://example.com/b,`,
        ),
        name: 'file.csv',
      } as UploadedFile

      await expect(service.parseCsv(file)).resolves.toEqual([
        { longUrl: 'https://example.com/a' },
        { longUrl: 'https://example.com/b' },
      ])
    })

    it('accepts two-column CSV with valid custom short links', async () => {
      const file = {
        data: Buffer.from(
          `${BULK_UPLOAD_HEADER},${BULK_UPLOAD_SHORTURL_HEADER}\nhttps://example.com/a,my-campaign-link\nhttps://example.com/b,another-slug`,
        ),
        name: 'file.csv',
      } as UploadedFile

      await expect(service.parseCsv(file)).resolves.toEqual([
        { longUrl: 'https://example.com/a', shortUrl: 'my-campaign-link' },
        { longUrl: 'https://example.com/b', shortUrl: 'another-slug' },
      ])
      expect(mockUrlRepository.isShortUrlAvailable).toHaveBeenCalledWith(
        'my-campaign-link',
      )
      expect(mockUrlRepository.isShortUrlAvailable).toHaveBeenCalledWith(
        'another-slug',
      )
    })

    it('accepts mixed blank and filled custom short links', async () => {
      const file = {
        data: Buffer.from(
          `${BULK_UPLOAD_HEADER},${BULK_UPLOAD_SHORTURL_HEADER}\nhttps://example.com/a,my-campaign-link\nhttps://example.com/b,\nhttps://example.com/c,another-slug`,
        ),
        name: 'file.csv',
      } as UploadedFile

      await expect(service.parseCsv(file)).resolves.toEqual([
        { longUrl: 'https://example.com/a', shortUrl: 'my-campaign-link' },
        { longUrl: 'https://example.com/b' },
        { longUrl: 'https://example.com/c', shortUrl: 'another-slug' },
      ])
    })

    it('rejects invalid custom short link format', async () => {
      const file = {
        data: Buffer.from(
          `${BULK_UPLOAD_HEADER},${BULK_UPLOAD_SHORTURL_HEADER}\nhttps://example.com/a,Invalid_Slug`,
        ),
        name: 'file.csv',
      } as UploadedFile

      await expect(service.parseCsv(file)).rejects.toThrow(
        'Row 2: Invalid_Slug is not a valid short link',
      )
    })

    it('rejects custom short link already taken in the database', async () => {
      mockUrlRepository.isShortUrlAvailable.mockResolvedValue(false)
      const file = {
        data: Buffer.from(
          `${BULK_UPLOAD_HEADER},${BULK_UPLOAD_SHORTURL_HEADER}\nhttps://example.com/a,taken-slug`,
        ),
        name: 'file.csv',
      } as UploadedFile

      await expect(service.parseCsv(file)).rejects.toThrow(
        'Row 2: taken-slug is already taken',
      )
    })

    it('rejects duplicate custom short links within the same file', async () => {
      const file = {
        data: Buffer.from(
          `${BULK_UPLOAD_HEADER},${BULK_UPLOAD_SHORTURL_HEADER}\nhttps://example.com/a,same-slug\nhttps://example.com/b,same-slug`,
        ),
        name: 'file.csv',
      } as UploadedFile

      await expect(service.parseCsv(file)).rejects.toThrow(
        'Row 3: same-slug is already taken',
      )
    })

    it('rejects typoed second header', async () => {
      const file = {
        data: Buffer.from(
          `${BULK_UPLOAD_HEADER},Custom Short Link\nhttps://example.com/a,my-slug`,
        ),
        name: 'file.csv',
      } as UploadedFile

      await expect(service.parseCsv(file)).rejects.toThrow(
        'Row 1: bulk upload header is invalid',
      )
    })

    it('rejects header with more than two columns', async () => {
      const file = {
        data: Buffer.from(
          `${BULK_UPLOAD_HEADER},${BULK_UPLOAD_SHORTURL_HEADER},Extra\nhttps://example.com/a,my-slug,x`,
        ),
        name: 'file.csv',
      } as UploadedFile

      await expect(service.parseCsv(file)).rejects.toThrow(
        'Row 1: bulk upload header is invalid',
      )
    })
  })

  describe('generateUrlMappings tests', () => {
    jest.resetModules()
    jest.mock('../../../../config', () => ({
      bulkUploadRandomStrLength: BULK_UPLOAD_RANDOM_STR_LENGTH,
    }))
    const { BulkService } = require('..')
    const service = new BulkService(mockUrlRepository)

    it('generateUrlMappings should return shortUrls of specified length', async () => {
      const [urlMapping] = await service.generateUrlMappings([
        { longUrl: 'https://google.com' },
      ])
      expect(urlMapping.shortUrl).toHaveLength(BULK_UPLOAD_RANDOM_STR_LENGTH)
    })

    it('generateUrlMappings uses provided custom shortUrl', async () => {
      const [urlMapping] = await service.generateUrlMappings([
        { longUrl: 'https://google.com', shortUrl: 'custom-slug' },
      ])
      expect(urlMapping).toEqual({
        longUrl: 'https://google.com',
        shortUrl: 'custom-slug',
      })
    })

    it('generateUrlMappings mixes custom and generated shortUrls', async () => {
      const mappings = await service.generateUrlMappings([
        { longUrl: 'https://a.com', shortUrl: 'custom-a' },
        { longUrl: 'https://b.com' },
      ])
      expect(mappings[0]).toEqual({
        longUrl: 'https://a.com',
        shortUrl: 'custom-a',
      })
      expect(mappings[1].longUrl).toBe('https://b.com')
      expect(mappings[1].shortUrl).toHaveLength(BULK_UPLOAD_RANDOM_STR_LENGTH)
    })
  })
})
