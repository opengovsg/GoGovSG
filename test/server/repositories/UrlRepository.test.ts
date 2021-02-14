import { S3 } from 'aws-sdk'
import {
  clicksModelMock,
  devicesModelMock,
  heatMapModelMock,
  mockQuery,
  mockTransaction,
  redisMockClient,
  sanitiseMock,
  urlClicksModelMock,
  urlModelMock,
} from '../api/util'
import { UrlRepository } from '../../../src/server/repositories/UrlRepository'
import { UrlMapper } from '../../../src/server/mappers/UrlMapper'
import { SearchResultsSortOrder } from '../../../src/shared/search'
import { FileVisibility, S3ServerSide } from '../../../src/server/services/aws'
import { NotFoundError } from '../../../src/server/util/error'
import { StorableUrlState } from '../../../src/server/repositories/enums'

import { DirectoryQueryConditions } from '../../../src/server/modules/directory'

jest.mock('../../../src/server/models/url', () => ({
  Url: urlModelMock,
  sanitise: sanitiseMock,
}))

jest.mock('../../../src/server/models/statistics/clicks', () => ({
  UrlClicks: urlClicksModelMock,
}))

jest.mock('../../../src/server/models/statistics/daily', () => ({
  Clicks: clicksModelMock,
}))

jest.mock('../../../src/server/models/statistics/weekday', () => ({
  WeekdayClicks: heatMapModelMock,
}))

jest.mock('../../../src/server/models/statistics/devices', () => ({
  Devices: devicesModelMock,
}))

jest.mock('../../../src/server/redis', () => ({
  redirectClient: redisMockClient,
}))

jest.mock('../../../src/server/util/sequelize', () => ({
  transaction: mockTransaction,
  sequelize: { query: mockQuery, transaction: mockTransaction },
}))

const s3Client = new S3()
const s3Bucket = 'bucket'
const fileURLPrefix = 'prefix'

const fileBucket = new S3ServerSide(s3Client, s3Bucket, fileURLPrefix)

const repository = new UrlRepository(fileBucket, new UrlMapper())
const cacheGetSpy = jest.spyOn(redisMockClient, 'get')

describe('UrlRepository', () => {
  const baseUserId = 2
  const baseShortUrl = 'abcdef'
  const baseLongUrl = 'https://www.agency.gov.sg'
  const baseUrlClicks = {
    clicks: 2,
  }
  const baseTemplate = {
    shortUrl: baseShortUrl,
    longUrl: baseLongUrl,
    state: 'ACTIVE',
    isFile: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    description: 'An agency of the Singapore Government',
    contactEmail: 'contact-us@agency.gov.sg',
  }
  const baseUrl = {
    ...baseTemplate,
    UrlClicks: baseUrlClicks,
  }
  const baseStorableUrl = {
    ...baseTemplate,
    ...baseUrlClicks,
  }
  beforeEach(async () => {
    redisMockClient.flushall()
    cacheGetSpy.mockClear()
  })

  it('passes findByShortUrl through to Url.findOne', async () => {
    const findOne = jest.spyOn(urlModelMock, 'findOne')
    try {
      const shortUrl = 'abcdef'
      findOne.mockResolvedValue(null)
      await expect(repository.findByShortUrlWithTotalClicks(shortUrl)).resolves.toBeNull()
      expect(findOne).toHaveBeenCalledWith({ where: { shortUrl } })
    } finally {
      // Deliberately not call findOne.mockRestore(), as it seems
      // to permanently make it unmockable
    }
  })

  describe('create', () => {
    const create = jest.spyOn(urlModelMock, 'create')
    const scope = jest.spyOn(urlModelMock, 'scope')
    const putObject = jest.spyOn(s3Client, 'putObject')
    const findByPk = jest.fn()

    // @ts-ignore
    putObject.mockReturnValue({ promise: () => Promise.resolve() })

    const userId = 2
    const shortUrl = 'abcdef'
    const longUrl = 'https://www.agency.gov.sg'

    beforeEach(() => {
      create.mockReset()
      putObject.mockClear()
      findByPk.mockReset()
      scope.mockReset()
    })

    it('creates the specified longUrl', async () => {
      findByPk.mockResolvedValueOnce(baseUrl)
      scope.mockImplementationOnce(() => ({ findByPk }))
      create.mockResolvedValue(baseTemplate)
      await expect(
        repository.create({ userId, shortUrl, longUrl }),
      ).resolves.toStrictEqual(baseStorableUrl)
      expect(create).toHaveBeenCalledWith(
        {
          longUrl,
          shortUrl,
          userId,
          isFile: false,
        },
        expect.anything(),
      )
      expect(scope).toHaveBeenCalledWith('getClicks')
      expect(putObject).not.toHaveBeenCalled()
    })

    it('creates the specified public file', async () => {
      const file = {
        data: Buffer.from(''),
        key: 'key',
        mimetype: 'text/csv',
      }
      const url = {
        ...baseUrl,
        isFile: true,
        longUrl: fileBucket.buildFileLongUrl(file.key),
      }
      const storableUrl = {
        ...baseStorableUrl,
        isFile: true,
        longUrl: fileBucket.buildFileLongUrl(file.key),
      }
      findByPk.mockResolvedValueOnce(url)
      scope.mockImplementationOnce(() => ({ findByPk }))
      create.mockResolvedValue(url)
      await expect(
        repository.create({ userId: baseUserId, shortUrl: baseShortUrl }, file),
      ).resolves.toStrictEqual(storableUrl)
      expect(create).toHaveBeenCalledWith(
        {
          longUrl: fileBucket.buildFileLongUrl(file.key),
          shortUrl,
          userId,
          isFile: true,
        },
        expect.anything(),
      )
      expect(scope).toHaveBeenCalledWith('getClicks')
      expect(putObject).toHaveBeenCalledWith({
        ContentType: file.mimetype,
        Bucket: s3Bucket,
        Body: file.data,
        Key: file.key,
        ACL: FileVisibility.Public,
        CacheControl: 'no-cache',
      })
    })
  })

  describe('update', () => {
    const findOne = jest.spyOn(urlModelMock, 'findOne')
    const scope = jest.spyOn(urlModelMock, 'scope')
    const putObject = jest.spyOn(s3Client, 'putObject')
    const putObjectAcl = jest.spyOn(s3Client, 'putObjectAcl')

    beforeEach(() => {
      findOne.mockReset()
      scope.mockReset()
      putObject.mockClear()
      putObjectAcl.mockClear()
    })

    afterAll(() => {
      findOne.mockRestore()
    })

    // @ts-ignore
    putObject.mockReturnValue({ promise: () => Promise.resolve() })
    // @ts-ignore
    putObjectAcl.mockReturnValue({ promise: () => Promise.resolve() })

    it('should throw NotFoundError on not found', async () => {
      scope.mockImplementationOnce(() => urlModelMock)
      findOne.mockResolvedValue(null)
      await expect(
        repository.update({ shortUrl: baseShortUrl }, {}),
      ).rejects.toBeInstanceOf(NotFoundError)
      expect(findOne).toHaveBeenCalledWith({
        where: { shortUrl: baseShortUrl },
      })
      expect(putObject).not.toHaveBeenCalled()
      expect(putObjectAcl).not.toHaveBeenCalled()
      expect(scope).toHaveBeenCalledWith('getClicks')
    })

    it('should update non-file links', async () => {
      const description = 'Changes made'
      const update = jest.fn()
      scope.mockImplementationOnce(() => urlModelMock)
      findOne.mockResolvedValue({ ...baseUrl, isFile: false, update })
      await expect(
        repository.update({ shortUrl: baseShortUrl }, { description }),
      ).resolves.toStrictEqual(expect.objectContaining({ isFile: false }))
      expect(findOne).toHaveBeenCalledWith({
        where: { shortUrl: baseShortUrl },
      })
      expect(putObject).not.toHaveBeenCalled()
      expect(putObjectAcl).not.toHaveBeenCalled()
      expect(update).toHaveBeenCalledWith({ description }, expect.anything())
      expect(scope).toHaveBeenCalledWith('getClicks')
    })

    it('should update non-state changes on file links', async () => {
      const description = 'Changes made'
      const update = jest.fn()
      const url: any = {
        ...baseUrl,
        isFile: true,
        update: update.mockImplementationOnce(({ description }) => {
          url.description = description
        }),
      }
      const expectedUrl = { ...baseStorableUrl, isFile: true, description }
      scope.mockImplementationOnce(() => urlModelMock)
      findOne.mockResolvedValue(url)
      await expect(
        repository.update({ shortUrl: baseShortUrl }, { description }),
      ).resolves.toEqual(expectedUrl)
      expect(findOne).toHaveBeenCalledWith({
        where: { shortUrl: baseShortUrl },
      })
      expect(putObject).not.toHaveBeenCalled()
      expect(putObjectAcl).not.toHaveBeenCalled()
      expect(update).toHaveBeenCalledWith({ description }, expect.anything())
    })

    it('should update state change to Active on file links', async () => {
      const state = StorableUrlState.Active
      const update = jest.fn()
      const url = {
        ...baseUrl,
        isFile: true,
        state: StorableUrlState.Inactive,
        update: update.mockImplementationOnce(({ state }) => {
          url.state = state
        }),
      }
      const expectedUrl = { ...baseStorableUrl, isFile: true }
      scope.mockImplementationOnce(() => urlModelMock)
      findOne.mockResolvedValue(url)
      await expect(
        repository.update({ shortUrl: baseShortUrl }, { state }),
      ).resolves.toEqual(expectedUrl)
      expect(findOne).toHaveBeenCalledWith({
        where: { shortUrl: baseShortUrl },
      })
      expect(putObject).not.toHaveBeenCalled()
      expect(update).toHaveBeenCalledWith({ state }, expect.anything())

      expect(putObjectAcl).toHaveBeenCalledWith({
        Bucket: s3Bucket,
        Key: fileBucket.getKeyFromLongUrl(baseLongUrl),
        ACL: FileVisibility.Public,
      })
    })

    it('should update state change to Inactive on file links', async () => {
      const state = StorableUrlState.Inactive
      const update = jest.fn()
      const url = {
        ...baseUrl,
        isFile: true,
        state: StorableUrlState.Active,
        update: update.mockImplementationOnce(({ state }) => {
          url.state = state
        }),
      }
      const expectedUrl = {
        ...baseStorableUrl,
        isFile: true,
        state: StorableUrlState.Inactive,
      }
      scope.mockImplementationOnce(() => urlModelMock)
      findOne.mockResolvedValue(url)
      await expect(
        repository.update({ shortUrl: baseShortUrl }, { state }),
      ).resolves.toEqual(expect.objectContaining(expectedUrl))
      expect(findOne).toHaveBeenCalledWith({
        where: { shortUrl: baseShortUrl },
      })
      expect(putObject).not.toHaveBeenCalled()
      expect(update).toHaveBeenCalledWith({ state }, expect.anything())

      expect(putObjectAcl).toHaveBeenCalledWith({
        Bucket: s3Bucket,
        Key: fileBucket.getKeyFromLongUrl(baseLongUrl),
        ACL: FileVisibility.Private,
      })
    })

    it('should update file content for file links', async () => {
      const oldKey = 'old-key'
      const newKey = 'new-key'
      const longUrl = fileBucket.buildFileLongUrl(oldKey)
      const newLongUrl = fileBucket.buildFileLongUrl(newKey)

      const file = {
        key: newKey,
        data: Buffer.from(''),
        mimetype: 'text/csv',
      }

      const update = jest.fn()
      const url = {
        ...baseUrl,
        isFile: true,
        longUrl,
        update: update.mockImplementationOnce(({ longUrl }) => {
          url.longUrl = longUrl
        }),
      }
      const expectedUrl = {
        ...baseStorableUrl,
        isFile: true,
        longUrl: newLongUrl,
      }

      scope.mockImplementationOnce(() => urlModelMock)
      findOne.mockResolvedValue(url)

      await expect(
        repository.update({ shortUrl: baseShortUrl }, {}, file),
      ).resolves.toEqual(expectedUrl)
      expect(findOne).toHaveBeenCalledWith({
        where: { shortUrl: baseShortUrl },
      })

      expect(update).toHaveBeenCalledWith(
        { longUrl: newLongUrl },
        expect.anything(),
      )
      expect(putObjectAcl).toHaveBeenCalledWith({
        Bucket: s3Bucket,
        Key: oldKey,
        ACL: FileVisibility.Private,
      })
      expect(putObject).toHaveBeenCalledWith({
        ContentType: file.mimetype,
        Bucket: s3Bucket,
        Body: file.data,
        Key: file.key,
        ACL: FileVisibility.Public,
        CacheControl: 'no-cache',
      })
    })
  })

  describe('getLongUrl', () => {
    it('should return from db when cache is empty', async () => {
      await expect(repository.getLongUrl('a')).resolves.toBe('aa')
    })

    it('should return from cache when cache is filled', async () => {
      redisMockClient.set('a', 'aaa')
      await expect(repository.getLongUrl('a')).resolves.toBe('aaa')
    })

    it('should return from db when cache is down', async () => {
      cacheGetSpy.mockImplementationOnce((_, callback) => {
        if (!callback) {
          return false
        }
        callback(new Error('Cache down'), 'Error')
        return false
      })
      await expect(repository.getLongUrl('a')).resolves.toBe('aa')
    })
  })

  describe('rawDirectorySearch', () => {
    beforeEach(() => {
      mockQuery.mockClear()
    })
    it('should call sequelize.query that searches for emails', async () => {
      const conditions: DirectoryQueryConditions = {
        query: '@test.gov.sg @test2.gov.sg',
        order: SearchResultsSortOrder.Recency,
        limit: 100,
        offset: 0,
        state: 'ACTIVE',
        isFile: true,
        isEmail: true,
      }

      const repoawait = await repository.rawDirectorySearch(conditions)

      expect(repoawait).toStrictEqual({
        count: 1,
        urls: [
          {
            shortUrl: 'a',
            email: 'a@test.gov.sg',
            isFile: false,
            state: 'ACTIVE',
          },
        ],
      })
    })

    it('should call sequelize.query that searches with plain text', async () => {
      const conditions: DirectoryQueryConditions = {
        query: 'query',
        order: SearchResultsSortOrder.Recency,
        limit: 100,
        offset: 0,
        state: 'ACTIVE',
        isFile: true,
        isEmail: false,
      }

      const repoawait = await repository.rawDirectorySearch(conditions)
      expect(repoawait).toStrictEqual({
        count: 1,
        urls: [
          {
            email: 'test@test.gov.sg',
            shortUrl: 'a',
            state: 'ACTIVE',
            isFile: false,
          },
        ],
      })
    })
  })
})
