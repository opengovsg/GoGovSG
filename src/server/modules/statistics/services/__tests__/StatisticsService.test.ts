import { StatisticsService } from '..'

describe('StatisticsService', () => {
  const getGlobalStatistics = jest.fn()
  it('should return statistics from repository', () => {
    // NOTE: these are injected inside `test/server/config`
    // and hence, don't actually read from the config file
    // which we defined
    const expected = {
      userCount: 1,
      clickCount: 2,
      linkCount: 3,
    }
    getGlobalStatistics.mockReturnValueOnce(expected)
    const service = new StatisticsService()
    expect(service.getGlobalStatistics()).toStrictEqual(expected)
  })
})
