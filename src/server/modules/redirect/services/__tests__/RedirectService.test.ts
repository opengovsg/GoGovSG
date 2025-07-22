import { RedirectService } from '../RedirectService'
import { UrlRepositoryInterface } from '../../../../repositories/interfaces/UrlRepositoryInterface'
import { CrawlerCheckService } from '../CrawlerCheckService'
import { CookieArrayReducerService } from '../CookieArrayReducerService'
import { LinkStatisticsService } from '../../../analytics/interfaces'
import { RedirectType } from '../..'

const ogUrl = 'https://go.gov.sg'

// Mock the config module
jest.mock('../../../../config', () => {
  return {
    logger: {
      warn: jest.fn(),
    },
    ogUrl: 'https://go.gov.sg',
  }
})

// Mock dependencies
const mockUrlRepository = {
  getLongUrl: jest.fn(),
}

const mockCrawlerCheckService = {
  isCrawler: jest.fn(),
}

const mockCookieArrayReducerService = {
  userHasVisitedShortlink: jest.fn(),
  writeShortlinkToCookie: jest.fn(),
}

const mockLinkStatisticsService = {
  updateLinkStatistics: jest.fn(),
}

describe('RedirectService', () => {
  let redirectService: RedirectService

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Setup default mock returns
    mockUrlRepository.getLongUrl.mockResolvedValue('https://example.com')
    mockCrawlerCheckService.isCrawler.mockReturnValue(false)
    mockCookieArrayReducerService.userHasVisitedShortlink.mockReturnValue(false)
    mockCookieArrayReducerService.writeShortlinkToCookie.mockReturnValue([
      'test',
    ])

    // Create service instance with mocked dependencies
    redirectService = new RedirectService(
      mockUrlRepository as unknown as UrlRepositoryInterface,
      mockCrawlerCheckService as unknown as CrawlerCheckService,
      mockCookieArrayReducerService as unknown as CookieArrayReducerService,
      mockLinkStatisticsService as unknown as LinkStatisticsService,
    )
  })

  describe('referrer validation', () => {
    it('should allow direct redirect for exact ogUrl match when user has not visited before', async () => {
      const result = await redirectService.redirectFor(
        'test',
        undefined,
        'Mozilla/5.0',
        ogUrl,
      )

      expect(result.redirectType).toBe(RedirectType.Direct)
    })

    it('should allow direct redirect for ogUrl with path when user has not visited before', async () => {
      const result = await redirectService.redirectFor(
        'test',
        undefined,
        'Mozilla/5.0',
        `${ogUrl}/some-path`,
      )

      expect(result.redirectType).toBe(RedirectType.Direct)
    })

    it('should allow direct redirect for ogUrl with query params when user has not visited before', async () => {
      const result = await redirectService.redirectFor(
        'test',
        undefined,
        'Mozilla/5.0',
        `${ogUrl}?param=value`,
      )

      expect(result.redirectType).toBe(RedirectType.Direct)
    })

    it('should show transition page for ogUrl with different protocol when user has not visited before', async () => {
      const result = await redirectService.redirectFor(
        'test',
        undefined,
        'Mozilla/5.0',
        'http://go.gov.sg', // different protocol
      )

      expect(result.redirectType).toBe(RedirectType.TransitionPage)
    })

    it('should NOT allow transition page bypass for malicious domain that starts with ogUrl', async () => {
      const result = await redirectService.redirectFor(
        'test',
        undefined,
        'Mozilla/5.0',
        `${ogUrl}.malicious.com`,
      )

      expect(result.redirectType).toBe(RedirectType.TransitionPage)
    })

    it('should NOT allow transition page bypass for subdomain of ogUrl', async () => {
      const result = await redirectService.redirectFor(
        'test',
        undefined,
        'Mozilla/5.0',
        'https://staging.go.gov.sg',
      )

      expect(result.redirectType).toBe(RedirectType.TransitionPage)
    })

    it('should NOT allow transition page bypass for domain containing ogUrl', async () => {
      const result = await redirectService.redirectFor(
        'test',
        undefined,
        'Mozilla/5.0',
        `https://staging.${ogUrl}.malicious.com`,
      )

      expect(result.redirectType).toBe(RedirectType.TransitionPage)
    })

    it('should NOT allow transition page bypass for completely different domain', async () => {
      const result = await redirectService.redirectFor(
        'test',
        undefined,
        'Mozilla/5.0',
        'https://malicious.com',
      )

      expect(result.redirectType).toBe(RedirectType.TransitionPage)
    })

    it('should NOT allow transition page bypass for invalid referrer URL', async () => {
      const result = await redirectService.redirectFor(
        'test',
        undefined,
        'Mozilla/5.0',
        'not-a-valid-url',
      )

      expect(result.redirectType).toBe(RedirectType.TransitionPage)
    })

    // TODO: not a regression, but to consider if we want to fix this
    it('should allow direct redirect when user has visited the shortlink before, even from malicious site', async () => {
      // Mock that user has visited this shortlink before
      mockCookieArrayReducerService.userHasVisitedShortlink.mockReturnValue(
        true,
      )

      const result = await redirectService.redirectFor(
        'test',
        ['test'], // past visits include this shortlink
        'Mozilla/5.0',
        'https://malicious.com', // even from malicious site
      )

      expect(result.redirectType).toBe(RedirectType.Direct)
    })

    it('should allow direct redirect when user has visited the shortlink before, even from trusted page', async () => {
      // Mock that user has visited this shortlink before
      mockCookieArrayReducerService.userHasVisitedShortlink.mockReturnValue(
        true,
      )

      const result = await redirectService.redirectFor(
        'test',
        ['test'], // past visits include this shortlink
        'Mozilla/5.0',
        ogUrl, // from trusted page
      )

      expect(result.redirectType).toBe(RedirectType.Direct)
    })
  })
})
