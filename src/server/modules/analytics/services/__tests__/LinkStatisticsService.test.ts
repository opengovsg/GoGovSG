import { LinkStatisticsService } from '..'

const deviceType = 'desktop'
const linkStatistics = {
  totalClicks: 1,
  deviceClicks: {
    desktop: 1,
    tablet: 0,
    mobile: 0,
    others: 0,
  },
  dailyClicks: [{ date: '2020-06-23', clicks: 1 }],
  weekdayClicks: [{ weekday: 2, hours: 23, clicks: 1 }],
}

const NO_OP = jest.fn()

const findOneUrlForUser = jest.fn()

const findByShortUrl = jest.fn()
const updateLinkStatistics = jest.fn()

const service = new LinkStatisticsService(
  { getDeviceType: () => deviceType },
  {
    findById: NO_OP,
    findByEmail: NO_OP,
    findOneUrlForUser,
    findOrCreateWithEmail: NO_OP,
    findUrlsForUser: NO_OP,
    findUserByUrl: NO_OP,
  },
  { updateLinkStatistics, findByShortUrl },
)

/**
 * Unit tests for StatisticService.
 */
describe('LinkStatisticService tests', () => {
  describe('findByShortUrl', () => {
    it('should return statistics from repository', async () => {
      const shortUrl = 'hello'

      findOneUrlForUser.mockResolvedValue({
        shortUrl,
        longUrl: 'https://open.gov.sg',
        state: 'ACTIVE',
        clicks: 100,
        isFile: false,
        createdAt: '',
        updatedAt: '',
      })
      findByShortUrl.mockResolvedValue(linkStatistics)

      await expect(
        service.getLinkStatistics(123, shortUrl),
      ).resolves.toStrictEqual({
        totalClicks: 1,
        deviceClicks: {
          desktop: 1,
          tablet: 0,
          mobile: 0,
          others: 0,
        },
        dailyClicks: [{ date: '2020-06-23', clicks: 1 }],
        weekdayClicks: [{ weekday: 2, hours: 23, clicks: 1 }],
      })
      expect(findByShortUrl).toHaveBeenCalledWith(shortUrl, undefined)
    })

    it('should forward offset days to repository', async () => {
      const shortUrl = 'hello'
      const offsetDays = 9

      findOneUrlForUser.mockResolvedValue({
        shortUrl,
        longUrl: 'https://open.gov.sg',
        state: 'ACTIVE',
        clicks: 100,
        isFile: false,
        createdAt: '',
        updatedAt: '',
      })
      findByShortUrl.mockResolvedValue(linkStatistics)

      await expect(
        service.getLinkStatistics(123, shortUrl, offsetDays),
      ).resolves.toStrictEqual({
        totalClicks: 1,
        deviceClicks: {
          desktop: 1,
          tablet: 0,
          mobile: 0,
          others: 0,
        },
        dailyClicks: [{ date: '2020-06-23', clicks: 1 }],
        weekdayClicks: [{ weekday: 2, hours: 23, clicks: 1 }],
      })
      expect(findByShortUrl).toHaveBeenCalledWith(shortUrl, offsetDays)
    })
  })

  describe('updateLinkStatistics', () => {
    it('should update relevant tables with same transaction', async () => {
      const shortUrl = 'a'
      await service.updateLinkStatistics(shortUrl, '')
      expect(updateLinkStatistics).toBeCalledWith(shortUrl, deviceType)
    })
  })
})
