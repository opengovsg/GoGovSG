import { userModelMock } from '../api/util'
import { UserRepository } from '../../../src/server/repositories/UserRepository'
import { UrlMapper } from '../../../src/server/mappers/UrlMapper'
import { UserMapper } from '../../../src/server/mappers/UserMapper'
import { NotFoundError } from '../../../src/server/util/error'

jest.mock('../../../src/server/models/user', () => ({
  User: userModelMock,
}))

const userRepo = new UserRepository(
  new UserMapper(new UrlMapper()),
  new UrlMapper(),
)

const url = {
  shortUrl: 'short-link',
  longUrl: 'https://www.agency.gov.sg',
  state: 'ACTIVE',
  clicks: 23,
  isFile: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isSearchable: true,
  description: 'An agency of the Singapore Government',
  contactEmail: 'contact-us@agency.gov.sg',
}

describe('UserRepository', () => {
  describe('findById', () => {
    const findByPk = jest.spyOn(userModelMock, 'findByPk')

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
        urls: [url],
      })
    })
  })

  describe('findByEmail', () => {
    const findOne = jest.spyOn(userModelMock, 'findOne')
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
        urls: [url],
      })
    })
  })

  it('directs findOrCreateWithEmail to User.findOrCreate', async () => {
    const findOrCreate = jest.spyOn(userModelMock, 'findOrCreate')
    await userRepo.findOrCreateWithEmail('user@agency.gov.sg')
    expect(findOrCreate).toHaveBeenCalled()
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
        userRepo.findOneUrlForUser(2, url.shortUrl),
      ).resolves.toBeNull()
      expect(scope).toHaveBeenCalledWith({
        method: ['includeShortUrl', url.shortUrl],
      })
    })

    it('returns url for user', async () => {
      findOne.mockResolvedValue({
        get: () => ({
          Urls: [url],
        }),
      })
      await expect(
        userRepo.findOneUrlForUser(2, url.shortUrl),
      ).resolves.toStrictEqual(url)
      expect(scope).toHaveBeenCalledWith({
        method: ['includeShortUrl', url.shortUrl],
      })
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
      await expect(userRepo.findUserByUrl(url.shortUrl)).resolves.toStrictEqual(
        expect.objectContaining({ id: user.id, email: user.email }),
      )
      expect(scope).toHaveBeenCalledWith({
        method: ['includeShortUrl', url.shortUrl],
      })
    })
  })

  describe('findUrlsForUser', () => {
    const { scope } = userModelMock
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
      expect(scope).toHaveBeenCalledWith({
        method: ['urlsWithQueryConditions', conditions],
      })
    })

    it('throws NotFoundError on findAndCountAll without user', async () => {
      findAndCountAll.mockResolvedValue({ rows: [], count: 0 })
      await expect(userRepo.findUrlsForUser(conditions)).rejects.toBeInstanceOf(
        NotFoundError,
      )
      expect(scope).toHaveBeenCalledWith({
        method: ['urlsWithQueryConditions', conditions],
      })
    })

    it('returns empty result on user without urls', async () => {
      const rows = [{ get: () => ({ Urls: [] }) }]
      findAndCountAll.mockResolvedValue({ rows, count: rows.length })
      await expect(userRepo.findUrlsForUser(conditions)).resolves.toStrictEqual(
        {
          urls: [],
          count: 0,
        },
      )
      expect(scope).toHaveBeenCalledWith({
        method: ['urlsWithQueryConditions', conditions],
      })
    })

    it('returns result on user with urls', async () => {
      const rows = [{ get: () => ({ Urls: [url] }) }]
      findAndCountAll.mockResolvedValue({ rows, count: rows.length })
      await expect(userRepo.findUrlsForUser(conditions)).resolves.toStrictEqual(
        {
          urls: [url],
          count: 1,
        },
      )
      expect(scope).toHaveBeenCalledWith({
        method: ['urlsWithQueryConditions', conditions],
      })
    })
  })
})
