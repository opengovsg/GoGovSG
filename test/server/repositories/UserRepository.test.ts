import { urlModelMock, userModelMock } from '../api/util'
import { UserRepository } from '../../../src/server/repositories/UserRepository'
import { UrlMapper } from '../../../src/server/mappers/UrlMapper'
import { UserMapper } from '../../../src/server/mappers/UserMapper'
import { NotFoundError } from '../../../src/server/util/error'

jest.mock('../../../src/server/models/user', () => ({
  User: userModelMock,
}))

jest.mock('../../../src/server/models/url', () => ({
  Url: urlModelMock,
}))

const userRepo = new UserRepository(
  new UserMapper(new UrlMapper()),
  new UrlMapper(),
)

const baseUrlTemplate = {
  shortUrl: 'short-link',
  longUrl: 'https://www.agency.gov.sg',
  state: 'ACTIVE',
  isFile: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  description: 'An agency of the Singapore Government',
  contactEmail: 'contact-us@agency.gov.sg',
  source: 'CONSOLE',
}

const urlClicks = {
  clicks: 23,
}

const url = {
  ...baseUrlTemplate,
  UrlClicks: urlClicks,
}

const expectedUrl = {
  ...baseUrlTemplate,
  ...urlClicks,
  tags: [],
  tagStrings: undefined,
}

const baseUser = {
  id: 2,
  email: 'user@agency.gov.sg',
  update: jest.fn(),
}

describe('UserRepository', () => {
  describe('findById', () => {
    const findByPk = jest.spyOn(userModelMock, 'findByPk')

    beforeEach(() => {
      findByPk.mockReset()
    })

    it('returns null if no user found', async () => {
      findByPk.mockReturnValue(null)
      await expect(userRepo.findById(2)).resolves.toBeNull()
    })

    it('returns user without urls if such a user found', async () => {
      const user = {
        id: 2,
        email: 'user@agency.gov.sg',
      }
      findByPk.mockReturnValue(user)
      await expect(userRepo.findById(2)).resolves.toStrictEqual({
        ...user,
        urls: undefined,
      })
    })

    it('returns user with urls if such a user found', async () => {
      const user = {
        id: 2,
        email: 'user@agency.gov.sg',
        Urls: [url],
      }
      findByPk.mockReturnValue(user)
      await expect(userRepo.findById(2)).resolves.toStrictEqual({
        id: user.id,
        email: user.email,
        urls: [expectedUrl],
      })
    })
  })

  describe('findByEmail', () => {
    const findOne = jest.spyOn(userModelMock, 'findOne')

    beforeEach(() => {
      findOne.mockReset()
    })

    it('returns null if no user found', async () => {
      findOne.mockReturnValue(null)
      await expect(
        userRepo.findByEmail('user@agency.gov.sg'),
      ).resolves.toBeNull()
    })

    it('returns user without urls if such a user found', async () => {
      const user = {
        id: 2,
        email: 'user@agency.gov.sg',
      }
      findOne.mockReturnValue(user)
      await expect(
        userRepo.findByEmail('user@agency.gov.sg'),
      ).resolves.toStrictEqual({
        ...user,
        urls: undefined,
      })
    })

    it('returns user with urls if such a user found', async () => {
      const user = {
        id: 2,
        email: 'user@agency.gov.sg',
        Urls: [url],
      }
      findOne.mockReturnValue(user)
      await expect(
        userRepo.findByEmail('user@agency.gov.sg'),
      ).resolves.toStrictEqual({
        id: user.id,
        email: user.email,
        urls: [expectedUrl],
      })
    })
  })

  describe('findOrCreateByEmail', () => {
    const findOrCreate = jest.spyOn(userModelMock, 'findOrCreate')

    beforeEach(() => {
      findOrCreate.mockReset()
    })

    it('directs findOrCreateWithEmail to User.findOrCreate', async () => {
      const findOrCreate = jest.spyOn(userModelMock, 'findOrCreate')
      const user = userModelMock.findOne()
      findOrCreate.mockResolvedValue([user, null])
      await expect(
        userRepo.findOrCreateWithEmail('user@agency.gov.sg'),
      ).resolves.toBe(user)
    })
  })

  describe('findOneUrlForUser', () => {
    const { scope } = userModelMock
    const findOne = jest.fn()

    beforeEach(() => {
      scope.mockReset()
      findOne.mockReset()
      scope.mockReturnValue({ findOne })
    })

    it('returns null for null user', async () => {
      findOne.mockResolvedValue(null)
      await expect(
        userRepo.findOneUrlForUser(2, expectedUrl.shortUrl),
      ).resolves.toBeNull()
      expect(scope).toHaveBeenCalledWith([
        'defaultScope',
        {
          method: ['includeShortUrl', expectedUrl.shortUrl],
        },
      ])
    })

    it('returns url for user', async () => {
      findOne.mockResolvedValue({
        Urls: [url],
      })
      await expect(
        userRepo.findOneUrlForUser(2, expectedUrl.shortUrl),
      ).resolves.toStrictEqual(expectedUrl)
      expect(scope).toHaveBeenCalledWith([
        'defaultScope',
        {
          method: ['includeShortUrl', expectedUrl.shortUrl],
        },
      ])
    })
  })

  describe('findUserByUrl', () => {
    const { scope } = userModelMock
    const findOne = jest.fn()

    beforeEach(() => {
      scope.mockReset()
      findOne.mockReset()
      scope.mockReturnValue({ findOne })
    })

    it('returns user for url', async () => {
      const user = {
        id: 2,
        email: 'user@agency.gov.sg',
        Urls: [url],
      }
      findOne.mockResolvedValue(user)
      await expect(
        userRepo.findUserByUrl(expectedUrl.shortUrl),
      ).resolves.toStrictEqual(
        expect.objectContaining({ id: user.id, email: user.email }),
      )
      expect(scope).toHaveBeenCalledWith([
        'defaultScope',
        {
          method: ['includeShortUrl', expectedUrl.shortUrl],
        },
      ])
    })
  })

  describe('findUrlsForUser', () => {
    const scope = jest.spyOn(urlModelMock, 'scope')
    const findAndCountAll = jest.fn()
    const conditions = {
      limit: 2,
      offset: 0,
      orderBy: 'date',
      sortDirection: 'asc',
      searchText: 'text',
      userId: 2,
      state: undefined,
      isFile: undefined,
      tags: [],
    }

    beforeEach(() => {
      scope.mockReset()
      findAndCountAll.mockReset()
      scope.mockReturnValue({ findAndCountAll })
    })

    it('throws NotFoundError on null findAndCountAll', async () => {
      findAndCountAll.mockResolvedValue(null)
      await expect(userRepo.findUrlsForUser(conditions)).rejects.toBeInstanceOf(
        NotFoundError,
      )
      expect(scope).toHaveBeenCalledWith(['defaultScope', 'getClicks'])
    })

    it('returns result on user with urls', async () => {
      const rows = [url]
      findAndCountAll.mockResolvedValue({ rows, count: rows.length })
      await expect(userRepo.findUrlsForUser(conditions)).resolves.toStrictEqual(
        {
          urls: [expectedUrl],
          count: 1,
        },
      )
      expect(scope).toHaveBeenCalledWith(['defaultScope', 'getClicks'])
    })

    it('returns empty result on user no url', async () => {
      const rows: any = []
      findAndCountAll.mockResolvedValue({ rows, count: rows.length })
      await expect(userRepo.findUrlsForUser(conditions)).resolves.toStrictEqual(
        {
          urls: [],
          count: 0,
        },
      )
      expect(scope).toHaveBeenCalledWith(['defaultScope', 'getClicks'])
    })
  })

  describe('saveApiKeyHash', () => {
    const apiKeyHash = 'apiKeyHash'
    const findOne = jest.spyOn(userModelMock, 'findOne')
    const update = jest.spyOn(baseUser, 'update')
    beforeEach(() => {
      findOne.mockReset()
      update.mockReset()
    })
    it("user's apiKeyHash is updated correctly", async () => {
      findOne.mockResolvedValue(baseUser)
      await userRepo.saveApiKeyHash(baseUser.id, apiKeyHash)
      expect(findOne).toBeCalledTimes(1)
      expect(update).toBeCalledTimes(1)
      expect(update).toHaveBeenCalledWith({ apiKeyHash })
    })
    it('user not found, error is thrown', async () => {
      findOne.mockResolvedValue(null)
      await expect(
        userRepo.saveApiKeyHash(baseUser.id, apiKeyHash),
      ).rejects.toBeInstanceOf(NotFoundError)
      expect(findOne).toBeCalledTimes(1)
      expect(update).toBeCalledTimes(0)
    })
  })

  describe('findUserByApiKey', async () => {
    const apiKeyHash = 'apiKeyHash'
    const findOne = jest.spyOn(userModelMock, 'findOne')
    it('call find one with correct param', async () => {
      await userRepo.findUserByApiKey(apiKeyHash)
      expect(findOne).toHaveBeenCalledTimes(1)
      expect(findOne).toHaveBeenCalledWith({
        where: { apiKeyHash },
      })
    })
  })
})
