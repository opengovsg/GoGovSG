import { StatisticsService } from '..'

describe('StatisticsService', () => {
  const getGlobalStatistics = jest.fn()
  it('should return statistics from repository', async () => {
    const expected = {
      userCount: 1,
      clickCount: 2,
      linkCount: 3,
    }
    getGlobalStatistics.mockResolvedValue(expected)
    const service = new StatisticsService({ getGlobalStatistics })
    await expect(service.getGlobalStatistics()).resolves.toStrictEqual(expected)
  })
})
