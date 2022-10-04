import { UrlManagementService } from '../UrlManagementService'
import {
  AlreadyExistsError,
  AlreadyOwnLinkError,
  NotFoundError,
} from '../../../../util/error'

describe('UrlManagementService', () => {
  const userRepository = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findOneUrlForUser: jest.fn(),
    findUserByUrl: jest.fn(),
    findUrlsForUser: jest.fn(),
    findOrCreateWithEmail: jest.fn(),
  }

  const urlRepository = {
    update: jest.fn(),
    create: jest.fn(),
    findByShortUrlWithTotalClicks: jest.fn(),
    getLongUrl: jest.fn(),
    plainTextSearch: jest.fn(),
    rawDirectorySearch: jest.fn(),
    bulkCreate: jest.fn(),
  }

  const service = new UrlManagementService(userRepository, urlRepository)

  describe('createUrl', () => {
    const userId = 2
    const longUrl = 'https://www.agency.gov.sg'
    const shortUrl = 'abcdef'

    beforeEach(() => {
      userRepository.findById.mockReset()
      userRepository.findUserByUrl.mockReset()
      urlRepository.findByShortUrlWithTotalClicks.mockReset()
      urlRepository.create.mockReset()
    })

    it('throws NotFoundError on no user', async () => {
      userRepository.findById.mockResolvedValue(null)
      await expect(
        service.createUrl(userId, shortUrl, longUrl),
      ).rejects.toBeInstanceOf(NotFoundError)
      expect(userRepository.findById).toHaveBeenCalledWith(userId)
      expect(userRepository.findUserByUrl).not.toHaveBeenCalled()
      expect(urlRepository.create).not.toHaveBeenCalled()
    })

    it('throws AlreadyExistsError on existing url', async () => {
      userRepository.findById.mockResolvedValue({ id: userId })
      userRepository.findUserByUrl.mockResolvedValue({
        shortUrl,
        longUrl,
        email: userId,
      })
      await expect(
        service.createUrl(userId, shortUrl, longUrl),
      ).rejects.toBeInstanceOf(AlreadyExistsError)
      expect(userRepository.findById).toHaveBeenCalledWith(userId)
      expect(userRepository.findUserByUrl).toHaveBeenCalledWith(shortUrl)
      expect(urlRepository.create).not.toHaveBeenCalled()
    })

    it('processes new non-file url', async () => {
      userRepository.findById.mockResolvedValue({ id: userId })
      urlRepository.findByShortUrlWithTotalClicks.mockResolvedValue(null)
      urlRepository.create.mockResolvedValue({ userId, longUrl, shortUrl })
      await expect(
        service.createUrl(userId, shortUrl, longUrl),
      ).resolves.toStrictEqual({ userId, longUrl, shortUrl })
      expect(userRepository.findById).toHaveBeenCalledWith(userId)
      expect(userRepository.findUserByUrl).toHaveBeenCalledWith(shortUrl)
      expect(urlRepository.create).toHaveBeenCalledWith(
        { userId, longUrl, shortUrl },
        undefined,
      )
    })

    it('processes new file url', async () => {
      const file = {
        data: Buffer.from(''),
        name: 'file.json',
        mimetype: 'application/json',
      }
      userRepository.findById.mockResolvedValue({ id: userId })
      urlRepository.findByShortUrlWithTotalClicks.mockResolvedValue(null)
      urlRepository.create.mockResolvedValue({ userId, longUrl, shortUrl })
      await expect(
        service.createUrl(userId, shortUrl, longUrl, file),
      ).resolves.toStrictEqual({ userId, longUrl, shortUrl })
      expect(userRepository.findById).toHaveBeenCalledWith(userId)
      expect(userRepository.findUserByUrl).toHaveBeenCalledWith(shortUrl)
      expect(urlRepository.create).toHaveBeenCalledWith(
        { userId, longUrl, shortUrl },
        {
          data: file.data,
          mimetype: file.mimetype,
          key: `${shortUrl}.json`,
        },
      )
    })
  })

  describe('updateUrl', () => {
    const userId = 2
    const url = { shortUrl: 'abcdef' }
    const options = {
      longUrl: 'https://www.agency.gov.sg',
      state: undefined,
      description: 'An agency',
      contactEmail: 'contact-us@agency.gov.sg',
    }

    beforeEach(() => {
      userRepository.findOneUrlForUser.mockReset()
      urlRepository.update.mockReset()
    })

    it('throws NotFoundError on no url', async () => {
      userRepository.findOneUrlForUser.mockResolvedValue(null)
      await expect(
        service.updateUrl(userId, url.shortUrl, options),
      ).rejects.toBeInstanceOf(NotFoundError)
      expect(userRepository.findOneUrlForUser).toHaveBeenCalledWith(
        userId,
        url.shortUrl,
      )
      expect(urlRepository.update).not.toHaveBeenCalled()
    })

    it('updates a non-file url', async () => {
      userRepository.findOneUrlForUser.mockResolvedValue(url)
      urlRepository.update.mockResolvedValue(url)
      await expect(
        service.updateUrl(userId, url.shortUrl, {
          ...options,
          file: undefined,
        }),
      ).resolves.toStrictEqual(url)
      expect(userRepository.findOneUrlForUser).toHaveBeenCalledWith(
        userId,
        url.shortUrl,
      )
      expect(urlRepository.update).toHaveBeenCalledWith(url, options, undefined)
    })

    it('updates a file url', async () => {
      const file = {
        data: Buffer.from(''),
        name: 'file.json',
        mimetype: 'application/json',
      }
      userRepository.findOneUrlForUser.mockResolvedValue(url)
      urlRepository.update.mockResolvedValue(url)
      await expect(
        service.updateUrl(userId, url.shortUrl, {
          ...options,
          file,
        }),
      ).resolves.toStrictEqual(url)
      expect(userRepository.findOneUrlForUser).toHaveBeenCalledWith(
        userId,
        url.shortUrl,
      )
      expect(urlRepository.update).toHaveBeenCalledWith(url, options, {
        data: file.data,
        key: `${url.shortUrl}.json`,
        mimetype: file.mimetype,
      })
    })
  })

  describe('changeOwnership', () => {
    const userId = 2
    const url = { shortUrl: 'abcdef' }
    const newUserEmail = 'recipient@agency.gov.sg'

    beforeEach(() => {
      userRepository.findOneUrlForUser.mockReset()
      userRepository.findByEmail.mockReset()
      urlRepository.update.mockReset()
    })

    it('throws NotFoundError on no url', async () => {
      userRepository.findOneUrlForUser.mockResolvedValue(null)
      await expect(
        service.changeOwnership(userId, url.shortUrl, newUserEmail),
      ).rejects.toBeInstanceOf(NotFoundError)
      expect(userRepository.findOneUrlForUser).toHaveBeenCalledWith(
        userId,
        url.shortUrl,
      )
      expect(userRepository.findByEmail).not.toHaveBeenCalled()
      expect(urlRepository.update).not.toHaveBeenCalled()
    })

    it('throws NotFoundError on no new user', async () => {
      userRepository.findOneUrlForUser.mockResolvedValue(url)
      userRepository.findByEmail.mockResolvedValue(null)

      await expect(
        service.changeOwnership(userId, url.shortUrl, newUserEmail),
      ).rejects.toBeInstanceOf(NotFoundError)
      expect(userRepository.findOneUrlForUser).toHaveBeenCalledWith(
        userId,
        url.shortUrl,
      )
      expect(userRepository.findByEmail).toHaveBeenCalled()
      expect(urlRepository.update).not.toHaveBeenCalled()
    })

    it('throws AlreadyOwnLinkError on same user', async () => {
      userRepository.findOneUrlForUser.mockResolvedValue(url)
      userRepository.findByEmail.mockResolvedValue({ id: userId })

      await expect(
        service.changeOwnership(userId, url.shortUrl, newUserEmail),
      ).rejects.toBeInstanceOf(AlreadyOwnLinkError)
      expect(userRepository.findOneUrlForUser).toHaveBeenCalledWith(
        userId,
        url.shortUrl,
      )
      expect(userRepository.findByEmail).toHaveBeenCalledWith(newUserEmail)
      expect(urlRepository.update).not.toHaveBeenCalled()
    })

    it('returns result on same user', async () => {
      const recipient = { id: 3 }
      const result = { userId: 3 }
      userRepository.findOneUrlForUser.mockResolvedValue(url)
      userRepository.findByEmail.mockResolvedValue(recipient)
      urlRepository.update.mockResolvedValue(result)

      await expect(
        service.changeOwnership(userId, url.shortUrl, newUserEmail),
      ).resolves.toStrictEqual(result)
      expect(userRepository.findOneUrlForUser).toHaveBeenCalledWith(
        userId,
        url.shortUrl,
      )
      expect(userRepository.findByEmail).toHaveBeenCalledWith(newUserEmail)
      expect(urlRepository.update).toHaveBeenCalledWith(url, {
        userId: recipient.id,
      })
    })
  })

  it('passes through getUrlsWithConditions to UserRepository', async () => {
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
    const urls = { urls: [], count: 0 }
    userRepository.findUrlsForUser.mockResolvedValue(urls)
    await expect(
      service.getUrlsWithConditions(conditions),
    ).resolves.toStrictEqual(urls)
    expect(userRepository.findUrlsForUser).toHaveBeenCalledWith(conditions)
  })
})
