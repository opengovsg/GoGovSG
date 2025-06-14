/* eslint-disable global-require */
import { UploadedFile } from 'express-fileupload'
import { BULK_UPLOAD_HEADER } from '../../../../../shared/constants'
import blackListedSites from '../../../../resources/blacklist'
import { BulkService } from '../BulkService'
import { ogHostname } from '../../../../config'

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

describe('BulkService', () => {
  let bulkService: BulkService

  beforeEach(() => {
    bulkService = new BulkService()
  })

  describe('parseCsv', () => {
    it('should parse valid CSV with empty rows', async () => {
      const csvContent = `${BULK_UPLOAD_HEADER}\nhttps://www.data.gov.sg\n\nhttps://www.tech.gov.sg`
      const file = {
        data: Buffer.from(csvContent),
      } as UploadedFile

      const result = await bulkService.parseCsv(file)
      expect(result).toEqual([
        'https://www.data.gov.sg',
        'https://www.tech.gov.sg',
      ])
    })

    it('should reject empty file', async () => {
      const file = {
        data: Buffer.from(''),
      } as UploadedFile

      await expect(bulkService.parseCsv(file)).rejects.toThrow(
        'csv file is empty',
      )
    })

    it('should reject file with invalid header', async () => {
      const csvContent = 'Invalid Header\nhttps://www.data.gov.sg'
      const file = {
        data: Buffer.from(csvContent),
      } as UploadedFile

      await expect(bulkService.parseCsv(file)).rejects.toThrow(
        'Row 1: bulk upload header is invalid',
      )
    })

    it('should reject file with invalid URL', async () => {
      const csvContent = `${BULK_UPLOAD_HEADER}\ninvalid-url`
      const file = {
        data: Buffer.from(csvContent),
      } as UploadedFile

      await expect(bulkService.parseCsv(file)).rejects.toThrow(
        'Row 2: contains invalid url',
      )
    })

    it('should reject file with circular redirect', async () => {
      const csvContent = `${BULK_UPLOAD_HEADER}\nhttps://${ogHostname}/redirect`
      const file = {
        data: Buffer.from(csvContent),
      } as UploadedFile

      await expect(bulkService.parseCsv(file)).rejects.toThrow(
        'Row 2: contains circular redirect',
      )
    })

    it('should reject file with multiple columns', async () => {
      const csvContent = `${BULK_UPLOAD_HEADER}\nhttps://www.data.gov.sg,extra-column`
      const file = {
        data: Buffer.from(csvContent),
      } as UploadedFile

      await expect(bulkService.parseCsv(file)).rejects.toThrow(
        'Row 2: has more than one column',
      )
    })
  })

  describe('generateUrlMappings', () => {
    it('should generate unique short URLs for each long URL', async () => {
      const longUrls = [
        'https://www.data.gov.sg',
        'https://www.tech.gov.sg',
        'https://www.open.gov.sg',
      ]

      const result = await bulkService.generateUrlMappings(longUrls)

      expect(result).toHaveLength(3)
      result.forEach((mapping) => {
        expect(mapping).toHaveProperty('shortUrl')
        expect(mapping).toHaveProperty('longUrl')
        expect(mapping.shortUrl).toMatch(/^[a-zA-Z0-9]+$/)
      })

      // Check that all short URLs are unique
      const shortUrls = result.map((mapping) => mapping.shortUrl)
      const uniqueShortUrls = new Set(shortUrls)
      expect(uniqueShortUrls.size).toBe(shortUrls.length)
    })

    it('should handle empty array of URLs', async () => {
      const result = await bulkService.generateUrlMappings([])
      expect(result).toEqual([])
    })
  })
})
