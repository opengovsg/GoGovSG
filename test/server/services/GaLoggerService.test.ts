/* eslint-disable global-require */
import * as analytics from '../../../src/server/services/analytics'

describe('GaLoggerService', () => {
  const gaTrackingId = 'UA-000000-2'

  afterAll(jest.resetModules)

  describe('with no gaTrackingId', () => {
    const fetch = jest.fn()
    const generateCookie = jest.spyOn(analytics, 'generateCookie')

    jest.resetModules()
    jest.mock('../../../src/server/config', () => ({
      logger: console,
      gaTrackingId: null,
    }))
    jest.mock('cross-fetch', () => fetch)

    const {
      default: GaLoggerService,
    } = require('../../../src/server/services/GaLoggerService')
    const service = new GaLoggerService()

    it('does not call GA', () => {
      service.logRedirectAnalytics({})
      expect(fetch).not.toHaveBeenCalled()
    })

    it('does not generate cookie', () => {
      expect(service.generateCookie()).toBeFalsy()
      expect(generateCookie).not.toHaveBeenCalled()
    })
  })

  describe('logRedirectAnalytics', () => {
    const fetch = jest.fn()
    const logger = { error: jest.fn() }

    jest.resetModules()
    jest.mock('../../../src/server/config', () => ({
      logger,
      gaTrackingId,
    }))
    jest.mock('cross-fetch', () => fetch)

    const {
      default: GaLoggerService,
    } = require('../../../src/server/services/GaLoggerService')
    const service = new GaLoggerService()

    beforeEach(fetch.mockReset)

    it('submits via fetch', () => {
      fetch.mockResolvedValue({ ok: true })
      const pageViewHit = { foo: 'bar' }
      service.logRedirectAnalytics(pageViewHit)
      expect(fetch).toHaveBeenCalledWith(
        'https://www.google-analytics.com/collect',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(pageViewHit),
        },
      )
      expect(logger.error).not.toHaveBeenCalled()
    })

    it('logs on error', () => {
      const then = jest.fn()
      fetch.mockReturnValue({ then })
      then.mockImplementation((callback) =>
        callback({
          ok: false,
          statusText: 'statusText',
          body: 'body',
        }),
      )

      const pageViewHit = { foo: 'bar' }
      service.logRedirectAnalytics(pageViewHit)
      expect(fetch).toHaveBeenCalledWith(
        'https://www.google-analytics.com/collect',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(pageViewHit),
        },
      )
      expect(logger.error).toHaveBeenCalled()
    })
  })

  describe('generateCookie', () => {
    jest.resetModules()
    jest.mock('../../../src/server/config', () => ({
      logger: () => {},
      gaTrackingId,
    }))

    const {
      default: GaLoggerService,
    } = require('../../../src/server/services/GaLoggerService')
    const service = new GaLoggerService()

    it('returns nothing if gaClientId is set', () => {
      expect(service.generateCookie('gaClientId=12345')).toBeNull()
    })

    it('returns a new cookie if gaClientId not set', () => {
      expect(service.generateCookie('foo=bar')).toStrictEqual([
        'gaClientId',
        expect.any(String),
        {
          maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year expiry
        },
      ])
    })

    it('returns a new cookie if no cookie set', () => {
      expect(service.generateCookie()).toStrictEqual([
        'gaClientId',
        expect.any(String),
        {
          maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year expiry
        },
      ])
    })
  })
})
