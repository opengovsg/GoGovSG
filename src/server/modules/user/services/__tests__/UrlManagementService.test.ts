import { UrlManagementService } from '../UrlManagementService'
import { StorableUrlSource } from '../../../../repositories/enums'
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
    findUserByApiKey: jest.fn(),
    saveApiKeyHash: jest.fn(),
    hasApiKey: jest.fn(),
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
    const sourceConsole = StorableUrlSource.Console
    const sourceApi = StorableUrlSource.Api

    beforeEach(() => {
      userRepository.findById.mockReset()
      userRepository.findUserByUrl.mockReset()
      urlRepository.findByShortUrlWithTotalClicks.mockReset()
      urlRepository.create.mockReset()
    })

    it('throws NotFoundError on no user', async () => {
      userRepository.findById.mockResolvedValue(null)
      await expect(
        service.createUrl(userId, sourceConsole, shortUrl, longUrl),
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
        service.createUrl(userId, sourceConsole, shortUrl, longUrl),
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
        service.createUrl(userId, sourceConsole, shortUrl, longUrl),
      ).resolves.toStrictEqual({ userId, longUrl, shortUrl })
      expect(userRepository.findById).toHaveBeenCalledWith(userId)
      expect(userRepository.findUserByUrl).toHaveBeenCalledWith(shortUrl)
      expect(urlRepository.create).toHaveBeenCalledWith(
        { userId, longUrl, shortUrl, source: sourceConsole },
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
        service.createUrl(userId, sourceConsole, shortUrl, longUrl, file),
      ).resolves.toStrictEqual({ userId, longUrl, shortUrl })
      expect(userRepository.findById).toHaveBeenCalledWith(userId)
      expect(userRepository.findUserByUrl).toHaveBeenCalledWith(shortUrl)
      expect(urlRepository.create).toHaveBeenCalledWith(
        { userId, longUrl, shortUrl, source: sourceConsole },
        {
          data: file.data,
          mimetype: file.mimetype,
          key: `${shortUrl}.json`,
        },
      )
    })

    it('processes new API-created url with no shortUrl', async () => {
      jest.resetModules()
      jest.mock('../../../../config', () => ({
        apiLinkRandomStrLength: 4,
      }))
      // eslint-disable-next-line global-require
      const { UrlManagementService } = require('..')
      const service = new UrlManagementService(userRepository, urlRepository)

      userRepository.findById.mockResolvedValue({ id: userId })
      urlRepository.findByShortUrlWithTotalClicks.mockResolvedValue(null)
      urlRepository.create.mockResolvedValue({ userId, longUrl, shortUrl })
      await expect(
        service.createUrl(userId, sourceApi, undefined, longUrl),
      ).resolves.toStrictEqual({ userId, longUrl, shortUrl })
      expect(userRepository.findById).toHaveBeenCalledWith(userId)
      expect(userRepository.findUserByUrl).toHaveBeenCalledWith(
        expect.stringMatching(/^.{4}$/),
      )
      expect(urlRepository.create).toHaveBeenCalledWith(
        {
          userId,
          longUrl,
          shortUrl: expect.stringMatching(/^.{4}$/),
          source: sourceApi,
        },
        undefined,
      )
    })
  })

  describe('updateUrl', () => {
    const userId = 2
    const linkUrl = { shortUrl: 'abcdef', isFile: false }
    const fileUrl = { shortUrl: 'abcdef', isFile: true }
    const options = {
      longUrl: 'https://www.agency.gov.sg',
      state: undefined,
      description: 'An agency',
      contactEmail: 'contact-us@agency.gov.sg',
    }
    const file = {
      data: Buffer.from(''),
      name: 'file.json',
      mimetype: 'application/json',
    }

    beforeEach(() => {
      userRepository.findOneUrlForUser.mockReset()
      urlRepository.update.mockReset()
    })

    it('throws NotFoundError on no url', async () => {
      userRepository.findOneUrlForUser.mockResolvedValue(null)
      await expect(
        service.updateUrl(userId, linkUrl.shortUrl, options),
      ).rejects.toBeInstanceOf(NotFoundError)
      expect(userRepository.findOneUrlForUser).toHaveBeenCalledWith(
        userId,
        linkUrl.shortUrl,
      )
      expect(urlRepository.update).not.toHaveBeenCalled()
    })

    it('throws Error when updating file with longUrl', async () => {
      userRepository.findOneUrlForUser.mockResolvedValue(fileUrl)
      await expect(
        service.updateUrl(userId, fileUrl.shortUrl, {
          longUrl: 'https://example.com',
        }),
      ).rejects.toBeInstanceOf(Error)
      expect(userRepository.findOneUrlForUser).toHaveBeenCalledWith(
        userId,
        fileUrl.shortUrl,
      )
      expect(urlRepository.update).not.toHaveBeenCalled()
    })

    it('throws Error when updating link with file', async () => {
      userRepository.findOneUrlForUser.mockResolvedValue(linkUrl)
      await expect(
        service.updateUrl(userId, linkUrl.shortUrl, { file }),
      ).rejects.toBeInstanceOf(Error)
      expect(userRepository.findOneUrlForUser).toHaveBeenCalledWith(
        userId,
        linkUrl.shortUrl,
      )
      expect(urlRepository.update).not.toHaveBeenCalled()
    })

    it('updates a non-file url', async () => {
      userRepository.findOneUrlForUser.mockResolvedValue(linkUrl)
      urlRepository.update.mockResolvedValue(linkUrl)
      await expect(
        service.updateUrl(userId, linkUrl.shortUrl, {
          ...options,
          file: undefined,
        }),
      ).resolves.toStrictEqual(linkUrl)
      expect(userRepository.findOneUrlForUser).toHaveBeenCalledWith(
        userId,
        linkUrl.shortUrl,
      )
      expect(urlRepository.update).toHaveBeenCalledWith(
        linkUrl,
        options,
        undefined,
      )
    })

    it('updates a file url', async () => {
      userRepository.findOneUrlForUser.mockResolvedValue(fileUrl)
      urlRepository.update.mockResolvedValue(fileUrl)
      await expect(
        service.updateUrl(userId, fileUrl.shortUrl, {
          file,
        }),
      ).resolves.toStrictEqual(fileUrl)
      expect(userRepository.findOneUrlForUser).toHaveBeenCalledWith(
        userId,
        fileUrl.shortUrl,
      )
      expect(urlRepository.update).toHaveBeenCalledWith(
        fileUrl,
        {},
        {
          data: file.data,
          key: `${fileUrl.shortUrl}.json`,
          mimetype: file.mimetype,
        },
      )
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
      tags: [],
    }
    const urls = { urls: [], count: 0 }
    userRepository.findUrlsForUser.mockResolvedValue(urls)
    await expect(
      service.getUrlsWithConditions(conditions),
    ).resolves.toStrictEqual(urls)
    expect(userRepository.findUrlsForUser).toHaveBeenCalledWith(conditions)
  })

  describe('bulkCreate', () => {
    it('passes through bulkCreate to UrlRepository', async () => {
      const userId = 1
      const urlMappings = [
        {
          shortUrl: 'hello',
          longUrl: 'https://google.com',
        },
      ]
      urlRepository.bulkCreate.mockResolvedValue({})
      await service.bulkCreate(userId, urlMappings, undefined)
      expect(urlRepository.bulkCreate).toHaveBeenCalledWith({
        userId,
        urlMappings,
        undefined,
      })
    })
  })
})
