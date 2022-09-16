import { S3 } from 'aws-sdk'
import {
  clicksModelMock,
  devicesModelMock,
  heatMapModelMock,
  mockQuery,
  mockTransaction,
  redisMockClient,
  sanitiseMock,
  tagModelMock,
  urlClicksModelMock,
  urlModelMock,
} from '../api/util'
import {
  UrlRepository,
  tagSeparator,
} from '../../../src/server/repositories/UrlRepository'
import { UrlMapper } from '../../../src/server/mappers/UrlMapper'
import { SearchResultsSortOrder } from '../../../src/shared/search'
import { FileVisibility, S3ServerSide } from '../../../src/server/services/aws'
import { NotFoundError } from '../../../src/server/util/error'
import {
  StorableUrlSource,
  StorableUrlState,
} from '../../../src/server/repositories/enums'

import { DirectoryQueryConditions } from '../../../src/server/modules/directory'
import TagRepositoryMock from '../mocks/repositories/TagRepository'

jest.mock('../../../src/server/models/url', () => ({
  Url: urlModelMock,
  sanitise: sanitiseMock,
}))
jest.mock('../../../src/server/models/tag', () => ({
  Tag: tagModelMock,
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
const tagRepository = new TagRepositoryMock()

const repository = new UrlRepository(fileBucket, new UrlMapper(), tagRepository)
const cacheGetSpy = jest.spyOn(redisMockClient, 'get')

describe('UrlRepository', () => {
  const baseUserId = 2
  const baseShortUrl = 'abcdef'
  const baseLongUrl = 'https://www.agency.gov.sg'
  const baseTagObjects = [
    { tagKey: 'tag1', tagString: 'Tag1' },
    { tagKey: 'tag2', tagString: 'Tag2' },
  ]
  const baseTags = ['Tag1', 'Tag2']
  const baseTagStrings = baseTags.join(tagSeparator)
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
    source: 'CONSOLE',
    tags: [],
  }
  const baseUrl = {
    ...baseTemplate,
    UrlClicks: baseUrlClicks,
  }
  const baseUrlWithTags = {
    ...baseTemplate,
    UrlClicks: baseUrlClicks,
    tags: baseTagObjects,
    tagStrings: baseTagStrings,
    addTags: jest.fn(),
  }

  const baseStorableUrl = {
    ...baseTemplate,
    ...baseUrlClicks,
    tagStrings: undefined,
  }
  const baseStorableUrlWithTags = {
    ...baseStorableUrl,
    tags: baseTags,
    tagStrings: baseTagStrings,
  }
  beforeEach(async () => {
    redisMockClient.flushall()
    cacheGetSpy.mockClear()
    jest.clearAllMocks()
  })

  it('passes findByShortUrl through to Url.findOne', async () => {
    const findOne = jest.spyOn(urlModelMock, 'findOne')
    try {
      const shortUrl = 'abcdef'
      findOne.mockResolvedValue(null)
      await expect(
        repository.findByShortUrlWithTotalClicks(shortUrl),
      ).resolves.toBeNull()
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
    const tagFindOrCreate = jest.spyOn(tagModelMock, 'findOrCreate')
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
      tagFindOrCreate.mockReset()
    })

    it('creates the specified longUrl without tag', async () => {
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
          source: StorableUrlSource.Console,
          tagStrings: '',
        },
        expect.anything(),
      )
      expect(tagFindOrCreate).toHaveBeenCalledTimes(0)
      expect(scope).toHaveBeenCalledWith([
        'defaultScope',
        'getClicks',
        'getTags',
      ])
      expect(putObject).not.toHaveBeenCalled()
    })

    it('creates the specified longUrl with tags', async () => {
      findByPk.mockResolvedValueOnce(baseUrlWithTags)
      scope.mockImplementationOnce(() => ({ findByPk }))
      create.mockResolvedValue(baseUrlWithTags)
      await expect(
        repository.create({ userId, shortUrl, longUrl, tags: baseTags }),
      ).resolves.toStrictEqual(baseStorableUrlWithTags)
      expect(create).toHaveBeenCalledWith(
        {
          longUrl,
          shortUrl,
          userId,
          tags: baseTags,
          isFile: false,
          tagStrings: baseTagStrings,
          source: StorableUrlSource.Console,
        },
        expect.anything(),
      )
      expect(scope).toHaveBeenCalledWith([
        'defaultScope',
        'getClicks',
        'getTags',
      ])
      expect(putObject).not.toHaveBeenCalled()
      expect(baseUrlWithTags.addTags).toHaveBeenCalledTimes(1)
    })

    it('creates the specified public file without tag', async () => {
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
          source: StorableUrlSource.Console,
          tagStrings: '',
        },
        expect.anything(),
      )
      expect(scope).toHaveBeenCalledWith([
        'defaultScope',
        'getClicks',
        'getTags',
      ])
      expect(putObject).toHaveBeenCalledWith({
        ContentType: file.mimetype,
        Bucket: s3Bucket,
        Body: file.data,
        Key: file.key,
        ACL: FileVisibility.Public,
        CacheControl: 'no-cache',
      })
    })

    it('creates the specified public file with tags', async () => {
      const file = {
        data: Buffer.from(''),
        key: 'key',
        mimetype: 'text/csv',
      }
      const url = {
        ...baseUrlWithTags,
        isFile: true,
        longUrl: fileBucket.buildFileLongUrl(file.key),
        addTags: jest.fn(),
      }
      const storableUrlWithTags = {
        ...baseStorableUrlWithTags,
        isFile: true,
        longUrl: fileBucket.buildFileLongUrl(file.key),
      }
      findByPk.mockResolvedValueOnce(url)
      scope.mockImplementationOnce(() => ({ findByPk }))
      create.mockResolvedValue(url)
      await expect(
        repository.create(
          { userId: baseUserId, shortUrl: baseShortUrl, tags: baseTags },
          file,
        ),
      ).resolves.toStrictEqual(storableUrlWithTags)
      expect(create).toHaveBeenCalledWith(
        {
          longUrl: fileBucket.buildFileLongUrl(file.key),
          shortUrl,
          userId,
          tags: baseTags,
          isFile: true,
          tagStrings: baseTagStrings,
          source: StorableUrlSource.Console,
        },
        expect.anything(),
      )
      expect(scope).toHaveBeenCalledWith([
        'defaultScope',
        'getClicks',
        'getTags',
      ])
      expect(putObject).toHaveBeenCalledWith({
        ContentType: file.mimetype,
        Bucket: s3Bucket,
        Body: file.data,
        Key: file.key,
        ACL: FileVisibility.Public,
        CacheControl: 'no-cache',
      })
      expect(url.addTags).toHaveBeenCalledTimes(1)
    })
  })

  describe('update', () => {
    const findOne = jest.spyOn(urlModelMock, 'findOne')
    const scope = jest.spyOn(urlModelMock, 'scope')
    const putObject = jest.spyOn(s3Client, 'putObject')
    const putObjectAcl = jest.spyOn(s3Client, 'putObjectAcl')
    const tagFindOrCreate = jest.spyOn(tagModelMock, 'findOrCreate')
    beforeEach(() => {
      findOne.mockReset()
      scope.mockReset()
      putObject.mockClear()
      putObjectAcl.mockClear()
      tagFindOrCreate.mockClear()
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
      expect(scope).toHaveBeenCalledWith([
        'defaultScope',
        'getClicks',
        'getTags',
      ])
    })

    it('should update non-file links', async () => {
      const description = 'Changes made'
      const update = jest.fn()
      const setTags = jest.fn()
      scope.mockImplementation(() => urlModelMock)
      findOne.mockResolvedValue({ ...baseUrl, isFile: false, update, setTags })
      await expect(
        repository.update({ shortUrl: baseShortUrl }, { description }),
      ).resolves.toStrictEqual(expect.objectContaining({ isFile: false }))
      expect(findOne).toHaveBeenCalledWith({
        where: { shortUrl: baseShortUrl },
      })
      expect(putObject).not.toHaveBeenCalled()
      expect(putObjectAcl).not.toHaveBeenCalled()
      expect(update).toHaveBeenCalledWith({ description }, expect.anything())
      expect(scope).toHaveBeenCalledWith([
        'defaultScope',
        'getClicks',
        'getTags',
      ])
    })

    it('should update tags on non-file links', async () => {
      const description = 'Changes made'
      const update = jest.fn()
      const setTags = jest.fn()
      const newTags = baseTags
      scope.mockImplementation(() => urlModelMock)
      findOne.mockResolvedValue({ ...baseUrl, isFile: false, update, setTags })
      await expect(
        repository.update(
          { shortUrl: baseShortUrl },
          { description, tags: newTags },
        ),
      ).resolves.toStrictEqual(expect.objectContaining({ isFile: false }))
      expect(findOne).toHaveBeenCalledWith({
        where: { shortUrl: baseShortUrl },
      })
      expect(putObject).not.toHaveBeenCalled()
      expect(putObjectAcl).not.toHaveBeenCalled()
      expect(tagRepository.upsertTags).toHaveBeenCalledTimes(1)
      expect(tagRepository.upsertTags).toHaveBeenCalledWith(
        baseTags,
        expect.anything(),
      )
      expect(setTags).toHaveBeenCalledTimes(1)
      expect(update).toHaveBeenCalledWith(
        { description, tags: newTags, tagStrings: baseTagStrings },
        expect.anything(),
      )
      expect(scope).toHaveBeenCalledWith([
        'defaultScope',
        'getClicks',
        'getTags',
      ])
    })

    it('should update non-state changes on file links', async () => {
      const description = 'Changes made'
      const update = jest.fn()
      const setTags = jest.fn()
      const url: any = {
        ...baseUrl,
        isFile: true,
        update: update.mockImplementationOnce(({ description }) => {
          url.description = description
        }),
        setTags,
      }
      const expectedUrl = {
        ...baseStorableUrl,
        isFile: true,
        description,
        tags: [],
      }
      scope.mockImplementation(() => urlModelMock)
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

    it('should update tags changes on file links', async () => {
      const description = 'Changes made'
      const newTags = baseTags
      const update = jest.fn()
      const setTags = jest.fn()
      const url: any = {
        ...baseUrl,
        isFile: true,
        update: update.mockImplementationOnce(({ description }) => {
          url.description = description
        }),
        setTags,
      }
      const expectedUrl = {
        ...baseStorableUrl,
        isFile: true,
        description,
      }
      scope.mockImplementation(() => urlModelMock)
      findOne.mockResolvedValue(url)
      await expect(
        repository.update(
          { shortUrl: baseShortUrl },
          { description, tags: newTags },
        ),
      ).resolves.toEqual(expectedUrl)
      expect(findOne).toHaveBeenCalledWith({
        where: { shortUrl: baseShortUrl },
      })
      expect(tagRepository.upsertTags).toHaveBeenCalledTimes(1)
      expect(putObject).not.toHaveBeenCalled()
      expect(putObjectAcl).not.toHaveBeenCalled()
      expect(update).toHaveBeenCalledWith(
        { description, tags: newTags, tagStrings: baseTagStrings },
        expect.anything(),
      )
    })

    it('should update state change to Active on file links', async () => {
      const state = StorableUrlState.Active
      const update = jest.fn()
      const setTags = jest.fn()
      const url = {
        ...baseUrl,
        isFile: true,
        state: StorableUrlState.Inactive,
        update: update.mockImplementationOnce(({ state }) => {
          url.state = state
        }),
        setTags,
      }
      const expectedUrl = { ...baseStorableUrl, isFile: true, tags: [] }
      scope.mockImplementation(() => urlModelMock)
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
      const setTags = jest.fn()
      const url = {
        ...baseUrl,
        isFile: true,
        state: StorableUrlState.Active,
        update: update.mockImplementationOnce(({ state }) => {
          url.state = state
        }),
        setTags,
      }
      const expectedUrl = {
        ...baseStorableUrl,
        isFile: true,
        tags: [],
        state: StorableUrlState.Inactive,
      }
      scope.mockImplementation(() => urlModelMock)
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
      const setTags = jest.fn()
      const url = {
        ...baseUrl,
        isFile: true,
        longUrl,
        update: update.mockImplementationOnce(({ longUrl }) => {
          url.longUrl = longUrl
        }),
        setTags,
      }
      const expectedUrl = {
        ...baseStorableUrl,
        isFile: true,
        tags: [],
        longUrl: newLongUrl,
      }

      scope.mockImplementation(() => urlModelMock)
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
      expect(mockQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ useMaster: true }),
      )
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
      expect(mockQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ useMaster: true }),
      )
    })
  })
})
