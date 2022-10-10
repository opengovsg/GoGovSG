/* eslint-disable global-require */

describe('SafeBrowsingService', () => {
  const get = jest.fn()
  const set = jest.fn()
  const mockFetch = jest.fn()

  const url = 'https://google.com'

  afterAll(jest.resetModules)

  describe('isThreat, without safeBrowsingKey', () => {
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

  describe('isThreat, with safeBrowsingKey but log-only', () => {
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
      // expect(set).toHaveBeenCalledWith(url, matches)
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  describe('isThreat, with safeBrowsingKey and active', () => {
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
      // expect(set).toHaveBeenCalledWith(url, matches)
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  describe('isThreatBulk, without safeBrowsingKey', () => {
    jest.resetModules()
    jest.mock('../../../../config', () => ({
      logger: console,
      safeBrowsingKey: '',
    }))
    jest.mock('cross-fetch', () => mockFetch)

    const { SafeBrowsingService } = require('..')
    const service = new SafeBrowsingService({ get, set })

    beforeEach(() => {
      mockFetch.mockReset()
    })
    const spy = jest.spyOn(service, 'lookup')

    it('always returns false', async () => {
      await expect(service.isThreatBulk([url, url], 1)).resolves.toBeFalsy()
      expect(spy).not.toHaveBeenCalled()
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('isThreatBulk, with safeBrowsingKey but log-only', () => {
    jest.resetModules()

    jest.mock('../../../../config', () => ({
      logger: console,
      safeBrowsingKey: 'key',
      safeBrowsingLogOnly: true,
    }))
    jest.mock('cross-fetch', () => mockFetch)

    const { SafeBrowsingService } = require('..')
    const service = new SafeBrowsingService({ get, set })
    const spy = jest.spyOn(service, 'lookup')

    const urls = [url, url, url, url]
    const batchSize = 2
    const numBatches = urls.length / batchSize

    beforeEach(() => {
      mockFetch.mockReset()
      spy.mockClear()
    })

    it('returns false when lookup is false', async () => {
      const json = jest.fn()
      json.mockResolvedValue({ matches: null })
      mockFetch.mockResolvedValue({ ok: true, json })

      await expect(service.isThreatBulk(urls, batchSize)).resolves.toBeFalsy()
      expect(spy).toHaveBeenCalledTimes(numBatches)
      expect(mockFetch).toHaveBeenCalledTimes(numBatches)
    })

    it('returns false when lookup is null', async () => {
      const json = jest.fn()
      json.mockResolvedValue(null)
      mockFetch.mockResolvedValue({ ok: true, json })

      await expect(service.isThreatBulk(urls, batchSize)).resolves.toBeFalsy()
      expect(spy).toHaveBeenCalledTimes(numBatches)
      expect(mockFetch).toHaveBeenCalledTimes(numBatches)
    })

    it('returns false when any response is not ok', async () => {
      const json = jest.fn()
      json.mockResolvedValue(null)
      mockFetch
        .mockResolvedValueOnce({ ok: true, json })
        .mockResolvedValueOnce({ ok: false, json })

      await expect(service.isThreatBulk(urls, batchSize)).resolves.toBeFalsy()
      expect(spy).toHaveBeenCalledTimes(numBatches)
      expect(mockFetch).toHaveBeenCalledTimes(numBatches)
    })

    it('returns false even when any lookup has match', async () => {
      const matches = {}
      const json = jest.fn()
      json.mockResolvedValue(null)
      const jsonMatches = jest.fn()
      jsonMatches.mockResolvedValue({ matches })
      mockFetch
        .mockResolvedValueOnce({ ok: true, json })
        .mockResolvedValueOnce({ ok: true, json: jsonMatches })

      await expect(service.isThreatBulk(urls, batchSize)).resolves.toBeFalsy()
      expect(spy).toHaveBeenCalledTimes(numBatches)
      expect(mockFetch).toHaveBeenCalledTimes(numBatches)
    })
  })

  describe('isThreatBulk, with safeBrowsingKey and active', () => {
    jest.resetModules()

    jest.mock('../../../../config', () => ({
      logger: console,
      safeBrowsingKey: 'key',
      safeBrowsingLogOnly: false,
    }))
    jest.mock('cross-fetch', () => mockFetch)

    const { SafeBrowsingService } = require('..')
    const service = new SafeBrowsingService({ get, set })
    const spy = jest.spyOn(service, 'lookup')

    const urls = [url, url, url, url]
    const batchSize = 2
    const numBatches = urls.length / batchSize

    beforeEach(() => {
      mockFetch.mockReset()
      spy.mockClear()
    })

    it('returns false when all lookups are false', async () => {
      const json = jest.fn()
      json.mockResolvedValue({ matches: null })
      mockFetch.mockResolvedValue({ ok: true, json })

      await expect(service.isThreatBulk(urls, batchSize)).resolves.toBeFalsy()
      expect(mockFetch).toHaveBeenCalledTimes(numBatches)
      expect(spy).toHaveBeenCalledTimes(numBatches)
    })

    it('returns false when lookup is null', async () => {
      const json = jest.fn()
      json.mockResolvedValue(null)
      mockFetch.mockResolvedValue({ ok: true, json })

      await expect(service.isThreatBulk(urls, batchSize)).resolves.toBeFalsy()
      expect(mockFetch).toHaveBeenCalledTimes(numBatches)
      expect(spy).toHaveBeenCalledTimes(numBatches)
    })

    it('throws when any response is not ok', async () => {
      const json = jest.fn()
      json.mockResolvedValue(null)
      mockFetch
        .mockResolvedValue({ ok: true, json })
        .mockResolvedValueOnce({ ok: false, json })

      await expect(service.isThreatBulk(urls, batchSize)).rejects.toBeDefined()
      expect(json).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledTimes(numBatches)
      expect(spy).toHaveBeenCalledTimes(numBatches)
    })

    it('returns true when any lookup has match', async () => {
      const matches = {}
      const json = jest.fn()
      json.mockResolvedValue(null)
      const jsonMatches = jest.fn()
      jsonMatches.mockResolvedValue({ matches })
      mockFetch
        .mockResolvedValueOnce({ ok: true, json })
        .mockResolvedValueOnce({ ok: true, json: jsonMatches })

      await expect(service.isThreatBulk(urls, batchSize)).resolves.toBeTruthy()
      expect(json).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledTimes(numBatches)
      expect(spy).toHaveBeenCalledTimes(numBatches)
    })
  })
})
