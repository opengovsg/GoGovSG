/* eslint-disable global-require */
import { UploadedFile } from 'express-fileupload'
import { BULK_UPLOAD_HEADER } from '../../../../../shared/constants'
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

describe('BulkService tests', () => {
  afterAll(jest.resetModules)

  describe('parseCsv tests', () => {
    jest.resetModules()
    jest.mock('../../../../config', () => ({
      bulkUploadMaxNum: BULK_UPLOAD_MAX_NUM,
      ogHostname: OG_HOST_NAME,
    }))
    const { BulkService } = require('..')
    const service = new BulkService()

    validUrlTests.forEach((validUrlTest) => {
      it(validUrlTest.testName, async () => {
        const file = {
          data: Buffer.from(`${BULK_UPLOAD_HEADER}\n${validUrlTest.url}`),
          name: 'file.csv',
        } as UploadedFile

        const schema = service.parseCsv(file)
        expect(schema.isValid).toEqual(true)
      })
    })
    invalidUrlTests.forEach((invalidUrlTest) => {
      it(invalidUrlTest.testName, async () => {
        const file = {
          data: Buffer.from(`${BULK_UPLOAD_HEADER}\n${invalidUrlTest.url}`),
          name: 'file.csv',
        } as UploadedFile

        const schema = service.parseCsv(file)
        expect(schema.isValid).toEqual(false)
      })
    })
  })

  describe('generateUrlMappings tests', () => {
    jest.resetModules()
    jest.mock('../../../../config', () => ({
      bulkUploadRandomStrLength: BULK_UPLOAD_RANDOM_STR_LENGTH,
    }))
    const { BulkService } = require('..')
    const service = new BulkService()

    it('generateUrlMappings should return shortUrls of specified length', async () => {
      const [urlMapping] = await service.generateUrlMappings([
        'https://google.com',
      ])
      expect(urlMapping.shortUrl).toHaveLength(BULK_UPLOAD_RANDOM_STR_LENGTH)
    })
  })
})
