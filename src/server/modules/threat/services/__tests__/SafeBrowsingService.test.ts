/* eslint-disable global-require */

describe('SafeBrowsingService', () => {
  const get = jest.fn()
  const set = jest.fn()
  const mockFetch = jest.fn()

  const url = 'https://google.com'

  afterAll(jest.resetModules)

  describe('without safeBrowsingKey', () => {
    jest.resetModules()
    jest.mock('../../../../config', () => ({
      logger: console,
      safeBrowsingKey: '',
    }))

    const { SafeBrowsingService } = require('..')
    const service = new SafeBrowsingService({ get, set })

    it('always returns false', async () => {
      await expect(service.isThreat(url)).resolves.toBeFalsy()
      expect(get).not.toHaveBeenCalled()
      expect(set).not.toHaveBeenCalled()
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('with safeBrowsingKey but log-only', () => {
    jest.resetModules()

    jest.mock('../../../../config', () => ({
      logger: console,
      safeBrowsingKey: 'key',
      safeBrowsingLogOnly: true,
    }))
    jest.mock('cross-fetch', () => mockFetch)

    const { SafeBrowsingService } = require('..')
    const service = new SafeBrowsingService({ get, set })

    beforeEach(() => {
      get.mockReset()
      set.mockReset()
      mockFetch.mockReset()
    })

    it('returns false even when repository is true', async () => {
      get.mockResolvedValue([url])

      await expect(service.isThreat(url)).resolves.toBeFalsy()
      expect(get).toHaveBeenCalledWith(url)
      expect(set).not.toHaveBeenCalled()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('returns false when lookup is false', async () => {
      const json = jest.fn()
      json.mockResolvedValue({ matches: null })
      mockFetch.mockResolvedValue({ ok: true, json })

      await expect(service.isThreat(url)).resolves.toBeFalsy()
      expect(get).toHaveBeenCalledWith(url)
      expect(set).not.toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalled()
    })

    it('returns false when lookup is null', async () => {
      const json = jest.fn()
      json.mockResolvedValue(null)
      mockFetch.mockResolvedValue({ ok: true, json })

      await expect(service.isThreat(url)).resolves.toBeFalsy()
      expect(get).toHaveBeenCalledWith(url)
      expect(set).not.toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalled()
    })

    it('only returns false when response is not ok', async () => {
      const json = jest.fn()
      json.mockResolvedValue(null)
      mockFetch.mockResolvedValue({ ok: false, json })

      await expect(service.isThreat(url)).resolves.toBeFalsy()
      expect(get).toHaveBeenCalledWith(url)
      expect(set).not.toHaveBeenCalled()
      expect(json).not.toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalled()
    })

    it('returns false even when lookup has match', async () => {
      const matches = {}
      const json = jest.fn()
      json.mockResolvedValue({ matches })
      mockFetch.mockResolvedValue({ ok: true, json })

      await expect(service.isThreat(url)).resolves.toBeFalsy()
      expect(get).toHaveBeenCalledWith(url)
      expect(set).toHaveBeenCalledWith(url, matches)
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  describe('with safeBrowsingKey and active', () => {
    jest.resetModules()

    jest.mock('../../../../config', () => ({
      logger: console,
      safeBrowsingKey: 'key',
      safeBrowsingLogOnly: false,
    }))
    jest.mock('cross-fetch', () => mockFetch)

    const { SafeBrowsingService } = require('..')
    const service = new SafeBrowsingService({ get, set })

    beforeEach(() => {
      get.mockReset()
      set.mockReset()
      mockFetch.mockReset()
    })

    it('returns true when repository is true', async () => {
      get.mockResolvedValue([url])

      await expect(service.isThreat(url)).resolves.toBeTruthy()
      expect(get).toHaveBeenCalledWith(url)
      expect(set).not.toHaveBeenCalled()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('returns false when lookup is false', async () => {
      const json = jest.fn()
      json.mockResolvedValue({ matches: null })
      mockFetch.mockResolvedValue({ ok: true, json })

      await expect(service.isThreat(url)).resolves.toBeFalsy()
      expect(get).toHaveBeenCalledWith(url)
      expect(set).not.toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalled()
    })

    it('returns false when lookup is null', async () => {
      const json = jest.fn()
      json.mockResolvedValue(null)
      mockFetch.mockResolvedValue({ ok: true, json })

      await expect(service.isThreat(url)).resolves.toBeFalsy()
      expect(get).toHaveBeenCalledWith(url)
      expect(set).not.toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalled()
    })

    it('throws when response is not ok', async () => {
      const json = jest.fn()
      json.mockResolvedValue(null)
      mockFetch.mockResolvedValue({ ok: false, json })

      await expect(service.isThreat(url)).rejects.toBeDefined()
      expect(get).toHaveBeenCalledWith(url)
      expect(set).not.toHaveBeenCalled()
      expect(json).not.toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalled()
    })

    it('returns true when lookup has match', async () => {
      const matches = {}
      const json = jest.fn()
      json.mockResolvedValue({ matches })
      mockFetch.mockResolvedValue({ ok: true, json })

      await expect(service.isThreat(url)).resolves.toBeTruthy()
      expect(get).toHaveBeenCalledWith(url)
      expect(set).toHaveBeenCalledWith(url, matches)
      expect(mockFetch).toHaveBeenCalled()
    })
  })
})
