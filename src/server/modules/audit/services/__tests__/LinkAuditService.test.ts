import { LinkAuditService } from '..'
import { LinkChangeKey, LinkChangeSet } from '../../interfaces'

const NO_OP = jest.fn()

const findOneUrlForUser = jest.fn()

const findByShortUrl = jest.fn()
const getCountByShortUrl = jest.fn()

const service = new LinkAuditService(
  {
    findById: NO_OP,
    findByEmail: NO_OP,
    findOneUrlForUser,
    findOrCreateWithEmail: NO_OP,
    findUrlsForUser: NO_OP,
    findUserByUrl: NO_OP,
    saveApiKeyHash: NO_OP,
    findUserByApiKey: NO_OP,
  },
  { findByShortUrl, getCountByShortUrl },
)

const prevUrlHistory = {
  longUrl: 'https://abc.com',
  state: 'INACTIVE',
  shortUrl: 'abc',
  createdAt: '2022-08-05T11:57:41.309Z',
  userEmail: 'alexis@open.gov.sg',
  description: '',
  isFile: true,
  tagStrings: '',
}
const currUrlHistory = {
  longUrl: 'https://google.com',
  state: 'INACTIVE',
  shortUrl: 'abc',
  createdAt: '2022-10-01T13:31:39.419Z',
  userEmail: 'alexis@open.gov.sg',
  description: '',
  isFile: true,
  tagStrings: '',
}

const prevUrlHistoryWithTags = {
  longUrl: 'https://abc.com',
  state: 'INACTIVE',
  shortUrl: 'abc',
  createdAt: '2022-08-05T11:57:41.309Z',
  userEmail: 'alexis@open.gov.sg',
  description: '',
  isFile: true,
  tagStrings: 'one;tag-2;TaG_3',
}
const currUrlHistoryWithTags = {
  longUrl: 'https://google.com',
  state: 'INACTIVE',
  shortUrl: 'abc',
  createdAt: '2022-10-01T13:31:39.419Z',
  userEmail: 'alexis@open.gov.sg',
  description: '',
  isFile: true,
  tagStrings: 'one;tag-2',
}

const mockUrl = {
  shortUrl: 'hello',
  longUrl: 'https://open.gov.sg',
  tagStrings: 'testing;akjhdksah',
  state: 'ACTIVE',
  clicks: 100,
  isFile: false,
  createdAt: '',
  updatedAt: '',
}

/**
 * Unit tests for LinkAuditService.
 */
describe('LinkAuditService tests', () => {
  describe('computePairwiseChangeSet', () => {
    it('should correctly compute changes between two url records for all tracked keys', () => {
      const keysToTrack = [
        'longUrl',
        'state',
        'userEmail',
        'tagStrings',
      ] as LinkChangeKey[]
      const expectedChangeSet = service.computePairwiseChangeSet(
        currUrlHistoryWithTags,
        prevUrlHistoryWithTags,
        keysToTrack,
      )
      expect(expectedChangeSet).toEqual(
        expect.arrayContaining([
          {
            type: 'update',
            key: 'tagStrings',
            prevValue: 'one;tag-2;TaG_3',
            currValue: 'one;tag-2',
            updatedAt: '2022-10-01T13:31:39.419Z',
          },
          {
            type: 'update',
            key: 'longUrl',
            prevValue: 'https://abc.com',
            currValue: 'https://google.com',
            updatedAt: '2022-10-01T13:31:39.419Z',
          },
        ]),
      )
      expect(expectedChangeSet).toHaveLength(2)

      expect(
        service.computePairwiseChangeSet(
          currUrlHistory,
          prevUrlHistory,
          keysToTrack,
        ),
      ).toStrictEqual([
        {
          type: 'update',
          key: 'longUrl',
          prevValue: 'https://abc.com',
          currValue: 'https://google.com',
          updatedAt: '2022-10-01T13:31:39.419Z',
        },
      ])
    })

    it('should return empty list if changes between two url records are not in tracked keys', () => {
      const keysToTrack = [] as LinkChangeKey[]
      expect(
        service.computePairwiseChangeSet(
          currUrlHistory,
          prevUrlHistory,
          keysToTrack,
        ),
      ).toStrictEqual([])
    })
  })

  describe('computeInitialChangeSet', () => {
    it('should correctly compute initial change set for all tracked keys', () => {
      const keysToTrack = ['longUrl', 'state', 'tagStrings'] as LinkChangeKey[]
      expect(
        service.computeInitialChangeSet(currUrlHistoryWithTags, keysToTrack),
      ).toStrictEqual([
        {
          type: 'create',
          key: 'longUrl',
          prevValue: '',
          currValue: 'https://google.com',
          updatedAt: '2022-10-01T13:31:39.419Z',
        },
        {
          type: 'create',
          key: 'state',
          prevValue: '',
          currValue: 'INACTIVE',
          updatedAt: '2022-10-01T13:31:39.419Z',
        },
        {
          type: 'create',
          key: 'tagStrings',
          prevValue: '',
          currValue: 'one;tag-2',
          updatedAt: '2022-10-01T13:31:39.419Z',
        },
      ])
    })

    it('should return empty list if changes in initial change set not in tracked keys', () => {
      const keysToTrack = [] as LinkChangeKey[]
      expect(
        service.computeInitialChangeSet(currUrlHistory, keysToTrack),
      ).toStrictEqual([])
    })
  })

  describe('getChangeSets', () => {
    it('should not call computePairwiseChangeSet if only one url record', () => {
      const urlHistories = [currUrlHistory]
      const isLastCreate = true
      const changeSet = {
        type: 'create',
        key: 'longUrl',
        prevValue: '',
        currValue: 'https://google.com',
        updatedAt: '2022-10-01T13:31:39.419Z',
      } as LinkChangeSet

      jest
        .spyOn(service, 'computeInitialChangeSet')
        .mockImplementation(() => [changeSet])
      jest
        .spyOn(service, 'computePairwiseChangeSet')
        .mockImplementation(() => [])

      expect(service.getChangeSets(urlHistories, isLastCreate)).toStrictEqual([
        changeSet,
      ])
      expect(service.computeInitialChangeSet).toHaveBeenCalledWith(
        currUrlHistory,
      )
      expect(service.computePairwiseChangeSet).not.toHaveBeenCalled()

      jest.restoreAllMocks()
    })

    it('should not call computeInitialChangeSet if records does not include initial creation', () => {
      const urlHistories = [currUrlHistory, prevUrlHistory] // ordered from most recent
      const isLastCreate = false
      const changeSet = {
        type: 'update',
        key: 'longUrl',
        prevValue: 'https://abc.com',
        currValue: 'https://google.com',
        updatedAt: '2022-10-01T13:31:39.419Z',
      } as LinkChangeSet

      jest
        .spyOn(service, 'computeInitialChangeSet')
        .mockImplementation(() => [])
      jest
        .spyOn(service, 'computePairwiseChangeSet')
        .mockImplementation(() => [changeSet])

      expect(service.getChangeSets(urlHistories, isLastCreate)).toStrictEqual([
        changeSet,
      ])
      expect(service.computeInitialChangeSet).not.toHaveBeenCalled()
      expect(service.computePairwiseChangeSet).toHaveBeenCalledWith(
        currUrlHistory,
        prevUrlHistory,
      )

      jest.restoreAllMocks()
    })
  })

  describe('findByShortUrl', () => {
    it('should retrieve url history records from repository', async () => {
      const defaultLimit = 10
      const defaultOffset = 0
      const urlHistories = [currUrlHistory, prevUrlHistory]
      const totalUrlHistories = urlHistories.length
      const changeSets = [
        {
          type: 'update',
          key: 'longUrl',
          prevValue: 'https://abc.com',
          currValue: 'https://google.com',
          updatedAt: '2022-10-01T13:31:39.419Z',
        },
        {
          type: 'create',
          key: 'longUrl',
          prevValue: '',
          currValue: 'https://abc.com',
          updatedAt: '2022-08-05T11:57:41.309Z',
        },
      ] as LinkChangeSet[]

      findOneUrlForUser.mockResolvedValue(mockUrl)
      findByShortUrl.mockResolvedValue(urlHistories)
      getCountByShortUrl.mockResolvedValue(totalUrlHistories)

      jest.spyOn(service, 'getChangeSets').mockImplementation(() => changeSets)

      await expect(
        service.getLinkAudit(123, mockUrl.shortUrl),
      ).resolves.toStrictEqual({
        changes: changeSets,
        totalCount: totalUrlHistories,
        limit: defaultLimit,
        offset: defaultOffset,
      })
      expect(getCountByShortUrl).toHaveBeenCalledWith(mockUrl.shortUrl)
      expect(findByShortUrl).toHaveBeenCalledWith(
        mockUrl.shortUrl,
        defaultLimit + 1,
        defaultOffset,
      )
      expect(service.getChangeSets).toHaveBeenCalledWith(urlHistories, true)
      jest.restoreAllMocks()
    })

    it('should forward limit and offset to repository', async () => {
      const limit = 1
      const offset = 0
      const urlHistories = [currUrlHistory, prevUrlHistory]
      const totalUrlHistories = urlHistories.length
      const changeSets = [
        {
          type: 'update',
          key: 'longUrl',
          prevValue: 'https://abc.com',
          currValue: 'https://google.com',
          updatedAt: '2022-10-01T13:31:39.419Z',
        },
      ] as LinkChangeSet[]

      findOneUrlForUser.mockResolvedValue(mockUrl)
      findByShortUrl.mockResolvedValue(urlHistories)
      getCountByShortUrl.mockResolvedValue(totalUrlHistories)

      jest.spyOn(service, 'getChangeSets').mockImplementation(() => changeSets)

      await expect(
        service.getLinkAudit(123, mockUrl.shortUrl, limit, offset),
      ).resolves.toStrictEqual({
        changes: changeSets,
        totalCount: totalUrlHistories,
        limit,
        offset,
      })
      expect(getCountByShortUrl).toHaveBeenCalledWith(mockUrl.shortUrl)
      expect(findByShortUrl).toHaveBeenCalledWith(
        mockUrl.shortUrl,
        limit + 1,
        offset,
      )
      expect(service.getChangeSets).toHaveBeenCalledWith(urlHistories, false)
      jest.restoreAllMocks()
    })

    it('should throw error if invalid offset or limit provided', async () => {
      const limit = 10
      const offset = 100000002

      findOneUrlForUser.mockResolvedValue(mockUrl)
      findByShortUrl.mockResolvedValue([])

      await expect(
        service.getLinkAudit(123, mockUrl.shortUrl, limit, offset),
      ).rejects.toThrow('Invalid offset or limit provided')
    })
  })
})
