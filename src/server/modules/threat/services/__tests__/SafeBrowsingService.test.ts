/* eslint-disable node/global-require */

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

    it('returns false when fetchWebRiskData is empty', async () => {
      const json = jest.fn()
      json.mockResolvedValue({})
      mockFetch.mockResolvedValue({ ok: true, json })

      await expect(service.isThreat(url)).resolves.toBeFalsy()
      expect(get).toHaveBeenCalledWith(url)
      expect(set).not.toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalled()
    })

    it('returns false when fetchWebRiskData is null', async () => {
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
      json.mockResolvedValue({ error: { message: '' } })
      mockFetch.mockResolvedValue({ ok: false, json })

      await expect(service.isThreat(url)).resolves.toBeFalsy()
      expect(get).toHaveBeenCalledWith(url)
      expect(set).not.toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalled()
    })

    it('does not throw when response is not ok and the error body has no error field (e.g. a gateway 502)', async () => {
      const json = jest.fn()
      json.mockResolvedValue({})
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Bad Gateway',
        json,
      })

      await expect(service.isThreat(url)).resolves.toBeFalsy()
      expect(mockFetch).toHaveBeenCalled()
    })

    it('does not throw when the response body is not valid JSON', async () => {
      const json = jest.fn()
      json.mockRejectedValue(new SyntaxError('Unexpected token < in JSON'))
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Bad Gateway',
        json,
      })

      await expect(service.isThreat(url)).resolves.toBeFalsy()
      expect(mockFetch).toHaveBeenCalled()
    })

    it('throws when the response is ok but the body is not valid JSON', async () => {
      const json = jest.fn()
      json.mockRejectedValue(new SyntaxError('Unexpected token < in JSON'))
      mockFetch.mockResolvedValue({
        ok: true,
        statusText: 'OK',
        json,
      })

      await expect(service.isThreat(url)).rejects.toBeDefined()
      expect(set).not.toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalled()
    })

    it('returns false even when fetchWebRiskData returns threat', async () => {
      const result = {
        threat: {
          threatTypes: ['MALWARE'],
          expireTime: '2024-03-20T05:29:41.898456500Z',
        },
      }
      const json = jest.fn()
      json.mockResolvedValue(result)
      mockFetch.mockResolvedValue({ ok: true, json })

      await expect(service.isThreat(url)).resolves.toBeFalsy()
      expect(get).toHaveBeenCalledWith(url)
      expect(set).toHaveBeenCalledWith(url, result.threat)
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

    it('returns false when fetchWebRiskData is empty', async () => {
      const json = jest.fn()
      json.mockResolvedValue({})
      mockFetch.mockResolvedValue({ ok: true, json })

      await expect(service.isThreat(url)).resolves.toBeFalsy()
      expect(get).toHaveBeenCalledWith(url)
      expect(set).not.toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalled()
    })

    it('returns false when fetchWebRiskData is null', async () => {
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
      expect(mockFetch).toHaveBeenCalled()
    })

    it('still throws (fails closed) when response is not ok and the error body is malformed', async () => {
      const json = jest.fn()
      json.mockRejectedValue(new SyntaxError('Unexpected token < in JSON'))
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Bad Gateway',
        json,
      })

      await expect(service.isThreat(url)).rejects.toBeDefined()
      expect(mockFetch).toHaveBeenCalled()
    })

    it('throws when the response is ok but the body is not valid JSON', async () => {
      const json = jest.fn()
      json.mockRejectedValue(new SyntaxError('Unexpected token < in JSON'))
      mockFetch.mockResolvedValue({
        ok: true,
        statusText: 'OK',
        json,
      })

      await expect(service.isThreat(url)).rejects.toBeDefined()
      expect(set).not.toHaveBeenCalled()
      expect(mockFetch).toHaveBeenCalled()
    })

    it('returns true when fetchWebRiskData returns threat', async () => {
      const result = {
        threat: {
          threatTypes: ['MALWARE'],
          expireTime: '2024-03-20T05:29:41.898456500Z',
        },
      }
      const json = jest.fn()
      json.mockResolvedValue(result)
      mockFetch.mockResolvedValue({ ok: true, json })

      await expect(service.isThreat(url)).resolves.toBeTruthy()
      expect(get).toHaveBeenCalledWith(url)
      expect(set).toHaveBeenCalledWith(url, result.threat)
      expect(mockFetch).toHaveBeenCalled()
    })

    it('sends the API key in a header, not in the URL', async () => {
      const json = jest.fn()
      json.mockResolvedValue({})
      mockFetch.mockResolvedValue({ ok: true, json })

      await service.isThreat(url)

      const { safeBrowsingKey } = require('../../../../config')
      const [endpoint, options] = mockFetch.mock.calls[0]
      expect(endpoint).not.toContain('key=')
      expect(options.headers['X-Goog-Api-Key']).toBe(safeBrowsingKey)
    })

    it('sets a timeout on the request', async () => {
      const json = jest.fn()
      json.mockResolvedValue({})
      mockFetch.mockResolvedValue({ ok: true, json })

      await service.isThreat(url)

      const [, options] = mockFetch.mock.calls[0]
      expect(options.signal).toBeInstanceOf(AbortSignal)
    })

    it('retries once when the request fails', async () => {
      const json = jest.fn()
      json.mockResolvedValue({})
      mockFetch
        .mockRejectedValueOnce(new Error('read ECONNRESET'))
        .mockResolvedValue({ ok: true, json })

      await expect(service.isThreat(url)).resolves.toBeFalsy()
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('retries once on a 5xx response', async () => {
      const json = jest.fn()
      json.mockResolvedValue({})
      mockFetch
        .mockResolvedValueOnce({ ok: false, status: 502, json })
        .mockResolvedValue({ ok: true, json })

      await expect(service.isThreat(url)).resolves.toBeFalsy()
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('retries once when reading the response body fails', async () => {
      const failedJson = jest.fn()
      failedJson.mockRejectedValue(new Error('read ECONNRESET'))
      const json = jest.fn()
      json.mockResolvedValue({})
      mockFetch
        .mockResolvedValueOnce({ ok: true, status: 200, json: failedJson })
        .mockResolvedValue({ ok: true, status: 200, json })

      await expect(service.isThreat(url)).resolves.toBeFalsy()
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('throws when the retry also fails', async () => {
      mockFetch.mockRejectedValue(new Error('read ECONNRESET'))

      await expect(service.isThreat(url)).rejects.toBeDefined()
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('does not retry a 4xx response', async () => {
      const json = jest.fn()
      json.mockResolvedValue({ error: { message: 'API key not valid' } })
      mockFetch.mockResolvedValue({ ok: false, status: 400, json })

      await expect(service.isThreat(url)).rejects.toBeDefined()
      expect(mockFetch).toHaveBeenCalledTimes(1)
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
    const spy = jest.spyOn(service, 'fetchWebRiskData')

    it('always returns false', async () => {
      await expect(service.isThreatBulk([url, url])).resolves.toBeFalsy()
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
    const spy = jest.spyOn(service, 'fetchWebRiskData')

    const urls = [url, url, url, url]

    beforeEach(() => {
      mockFetch.mockReset()
      spy.mockClear()
    })

    it('returns false when fetchWebRiskData is empty', async () => {
      const json = jest.fn()
      json.mockResolvedValue({})
      mockFetch.mockResolvedValue({ ok: true, json })

      await expect(service.isThreatBulk(urls)).resolves.toBeFalsy()
      expect(spy).toHaveBeenCalledTimes(urls.length)
      expect(mockFetch).toHaveBeenCalledTimes(urls.length)
    })

    it('returns false when fetchWebRiskData is null', async () => {
      const json = jest.fn()
      json.mockResolvedValue(null)
      mockFetch.mockResolvedValue({ ok: true, json })

      await expect(service.isThreatBulk(urls)).resolves.toBeFalsy()
      expect(spy).toHaveBeenCalledTimes(urls.length)
      expect(mockFetch).toHaveBeenCalledTimes(urls.length)
    })

    it('returns false when any response is not ok', async () => {
      const json = jest.fn()
      json
        .mockResolvedValueOnce({ error: { message: '' } })
        .mockResolvedValue({})
      mockFetch
        .mockResolvedValueOnce({ ok: false, json })
        .mockResolvedValue({ ok: true, json })

      await expect(service.isThreatBulk(urls)).resolves.toBeFalsy()
      expect(spy).toHaveBeenCalledTimes(urls.length)
      expect(mockFetch).toHaveBeenCalledTimes(urls.length)
    })

    it('returns false even when any fetchWebRiskData returns threat', async () => {
      const result = {
        threat: {
          threatTypes: ['MALWARE'],
          expireTime: '2024-03-20T05:29:41.898456500Z',
        },
      }
      const json = jest.fn()
      json.mockResolvedValue(null)
      const jsonThreat = jest.fn()
      jsonThreat.mockResolvedValue(result)
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: jsonThreat })
        .mockResolvedValue({ ok: true, json })

      await expect(service.isThreatBulk(urls)).resolves.toBeFalsy()
      expect(jsonThreat).toHaveBeenCalledTimes(1)
      expect(json).toHaveBeenCalledTimes(3)
      expect(spy).toHaveBeenCalledTimes(urls.length)
      expect(mockFetch).toHaveBeenCalledTimes(urls.length)
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
    const spy = jest.spyOn(service, 'fetchWebRiskData')

    const urls = [url, url, url, url]

    beforeEach(() => {
      mockFetch.mockReset()
      spy.mockClear()
    })

    it('returns false when all fetchWebRiskData are empty', async () => {
      const json = jest.fn()
      json.mockResolvedValue({})
      mockFetch.mockResolvedValue({ ok: true, json })

      await expect(service.isThreatBulk(urls)).resolves.toBeFalsy()
      expect(mockFetch).toHaveBeenCalledTimes(urls.length)
      expect(spy).toHaveBeenCalledTimes(urls.length)
    })

    it('returns false when fetchWebRiskData is null', async () => {
      const json = jest.fn()
      json.mockResolvedValue(null)
      mockFetch.mockResolvedValue({ ok: true, json })

      await expect(service.isThreatBulk(urls)).resolves.toBeFalsy()
      expect(mockFetch).toHaveBeenCalledTimes(urls.length)
      expect(spy).toHaveBeenCalledTimes(urls.length)
    })

    it('throws when any response is not ok', async () => {
      const json = jest.fn()
      json.mockResolvedValue(null)
      mockFetch
        .mockResolvedValue({ ok: true, json })
        .mockResolvedValueOnce({ ok: false, json })

      await expect(service.isThreatBulk(urls)).rejects.toBeDefined()
      expect(mockFetch).toHaveBeenCalledTimes(urls.length)
      expect(spy).toHaveBeenCalledTimes(urls.length)
    })

    it('returns true when any fetchWebRiskData returns threat', async () => {
      const result = {
        threat: {
          threatTypes: ['MALWARE'],
          expireTime: '2024-03-20T05:29:41.898456500Z',
        },
      }
      const json = jest.fn()
      json.mockResolvedValue(null)
      const jsonThreat = jest.fn()
      jsonThreat.mockResolvedValue(result)
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: jsonThreat })
        .mockResolvedValue({ ok: true, json })

      await expect(service.isThreatBulk(urls)).resolves.toBeTruthy()
      expect(jsonThreat).toHaveBeenCalledTimes(1)
      expect(json).toHaveBeenCalledTimes(3)
      expect(mockFetch).toHaveBeenCalledTimes(urls.length)
      expect(spy).toHaveBeenCalledTimes(urls.length)
    })

    it('scans a maximum-size upload within the load balancer timeout', async () => {
      const LOAD_BALANCER_TIMEOUT_MS = 100_000
      const SCAN_DELAY_MS = 2_000
      const MAX_BULK_UPLOAD_SIZE = 1_000
      const manyUrls = Array.from(
        { length: MAX_BULK_UPLOAD_SIZE },
        (_, i) => `https://example.com/${i}`,
      )
      const json = jest.fn()
      json.mockResolvedValue({})
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ ok: true, json }), SCAN_DELAY_MS)
          }),
      )

      jest.useFakeTimers()
      let isDone = false
      service.isThreatBulk(manyUrls).then(() => {
        isDone = true
      })
      await jest.advanceTimersByTimeAsync(LOAD_BALANCER_TIMEOUT_MS)
      jest.useRealTimers()

      expect(isDone).toBe(true)
    })
  })
})
