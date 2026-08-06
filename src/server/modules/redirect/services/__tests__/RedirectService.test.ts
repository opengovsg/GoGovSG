import { RedirectType } from '../..'
import { NotFoundError } from '../../../../util/error'
import { RedirectService } from '../RedirectService'

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
  updateSafeBrowsingExpiry: jest.fn(),
  deactivateShortUrl: jest.fn(),
  findByShortUrlWithTotalClicks: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
  isShortUrlAvailable: jest.fn(),
  rawDirectorySearch: jest.fn(),
  bulkCreate: jest.fn(),
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
  getLinkStatistics: jest.fn(),
}

const mockUrlThreatScanService = {
  isThreat: jest.fn(),
  isThreatBulk: jest.fn(),
}

const mockUrlManagementService = {
  bulkCreate: jest.fn(),
  createUrl: jest.fn(),
  updateUrl: jest.fn(),
  changeOwnership: jest.fn(),
  getUrlsWithConditions: jest.fn(),
  deactivateMaliciousShortUrl: jest.fn(),
}

// Create service instance with mocked dependencies
const service = new RedirectService(
  mockUrlRepository,
  mockCrawlerCheckService,
  mockCookieArrayReducerService,
  mockLinkStatisticsService,
  mockUrlThreatScanService,
  mockUrlManagementService,
)

describe('RedirectService', () => {
  describe('RedirectService', () => {
    beforeEach(() => {
      jest.clearAllMocks()

      // Setup default mock returns after clearing
      mockUrlRepository.getLongUrl.mockResolvedValue('https://example.com')
      mockCrawlerCheckService.isCrawler.mockReturnValue(false)
      mockCookieArrayReducerService.userHasVisitedShortlink.mockReturnValue(
        false,
      )
      mockCookieArrayReducerService.writeShortlinkToCookie.mockReturnValue([
        'test',
      ])
    })

    afterAll(jest.resetModules)

    describe('redirectFor', () => {
      it.skip('should throw NotFoundError for invalid shortUrl', () => {})
      it.skip('should throw NotFoundError for non-existent shortUrl', () => {})

      it('should allow direct redirect for exact ogUrl match when user has not visited before', async () => {
        const result = await service.redirectFor(
          'test',
          undefined,
          'Mozilla/5.0',
          ogUrl,
        )

        expect(result.redirectType).toBe(RedirectType.Direct)
      })

      it('should allow direct redirect for ogUrl with path when user has not visited before', async () => {
        const result = await service.redirectFor(
          'test',
          undefined,
          'Mozilla/5.0',
          `${ogUrl}/some-path`,
        )

        expect(result.redirectType).toBe(RedirectType.Direct)
      })

      it('should allow direct redirect for ogUrl with query params when user has not visited before', async () => {
        const result = await service.redirectFor(
          'test',
          undefined,
          'Mozilla/5.0',
          `${ogUrl}?param=value`,
        )

        expect(result.redirectType).toBe(RedirectType.Direct)
      })

      it('should show transition page for ogUrl with different protocol when user has not visited before', async () => {
        const result = await service.redirectFor(
          'test',
          undefined,
          'Mozilla/5.0',
          'http://go.gov.sg', // different protocol
        )

        expect(result.redirectType).toBe(RedirectType.TransitionPage)
      })

      it('should NOT allow transition page bypass for malicious domain that starts with ogUrl', async () => {
        const result = await service.redirectFor(
          'test',
          undefined,
          'Mozilla/5.0',
          `${ogUrl}.malicious.com`,
        )

        expect(result.redirectType).toBe(RedirectType.TransitionPage)
      })

      it('should NOT allow transition page bypass for subdomain of ogUrl', async () => {
        const result = await service.redirectFor(
          'test',
          undefined,
          'Mozilla/5.0',
          'https://staging.go.gov.sg',
        )

        expect(result.redirectType).toBe(RedirectType.TransitionPage)
      })

      it('should NOT allow transition page bypass for domain containing ogUrl', async () => {
        const result = await service.redirectFor(
          'test',
          undefined,
          'Mozilla/5.0',
          'https://staging.go.gov.sg.malicious.com',
        )

        expect(result.redirectType).toBe(RedirectType.TransitionPage)
      })

      it('should NOT allow transition page bypass for completely different domain', async () => {
        const result = await service.redirectFor(
          'test',
          undefined,
          'Mozilla/5.0',
          'https://malicious.com',
        )

        expect(result.redirectType).toBe(RedirectType.TransitionPage)
      })

      it('should NOT allow transition page bypass for invalid referrer URL', async () => {
        const result = await service.redirectFor(
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

        const result = await service.redirectFor(
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

        const result = await service.redirectFor(
          'test',
          ['test'], // past visits include this shortlink
          'Mozilla/5.0',
          ogUrl, // from trusted page
        )

        expect(result.redirectType).toBe(RedirectType.Direct)
      })

      it('should throw NotFoundError if the longUrl is malicious and the safe browsing result is expired', async () => {
        // Arrange
        mockUrlRepository.getLongUrl.mockResolvedValue({
          longUrl: 'https://malicious.com',
          isFile: false,
          safeBrowsingExpiry: new Date(Date.now() - 1000).toISOString(),
        })
        mockUrlThreatScanService.isThreat.mockResolvedValue(true)

        // Act & Assert
        await expect(
          service.redirectFor('shortUrl', undefined, '', ''),
        ).rejects.toThrow(NotFoundError)
      })

      it('should not throw NotFoundError if the longUrl is malicious but the safe browsing result is not expired', async () => {
        // Arrange
        mockUrlRepository.getLongUrl.mockResolvedValue({
          longUrl: 'https://malicious.com',
          isFile: false,
          safeBrowsingExpiry: new Date(Date.now() + 1000).toISOString(),
        })
        mockUrlThreatScanService.isThreat.mockResolvedValue(true)

        // Act & Assert
        await expect(
          service.redirectFor('shortUrl', undefined, '', ''),
        ).resolves.not.toThrow(NotFoundError)
      })

      it('should update the safe browsing expiry if the longUrl is not malicious', async () => {
        // Arrange
        const mockShortUrl = 'short'
        const mockLongUrl = 'https://safe.com'
        mockUrlRepository.getLongUrl.mockResolvedValue({
          longUrl: mockLongUrl,
          isFile: false,
          safeBrowsingExpiry: new Date(Date.now() - 1000).toISOString(),
        })
        mockUrlThreatScanService.isThreat.mockResolvedValue(false)

        // Act
        await service.redirectFor(mockShortUrl, undefined, '', '')

        // Assert
        expect(mockUrlRepository.updateSafeBrowsingExpiry).toHaveBeenCalledWith(
          mockShortUrl,
          expect.any(Date),
        )
      })
    })
  })
})
