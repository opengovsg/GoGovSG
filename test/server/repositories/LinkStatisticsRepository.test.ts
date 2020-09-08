import { QueryTypes } from 'sequelize'
import { sequelizeMock, urlModelMock } from '../api/util'

import {
  LinkStatisticsRepository,
  updateLinkStatistics,
} from '../../../src/server/repositories/LinkStatisticsRepository'

jest.mock('../../../src/server/util/sequelize', () => ({
  sequelize: sequelizeMock,
}))
jest.mock('../../../src/server/models/url', () => ({
  Url: urlModelMock,
}))

jest.mock('../../../src/server/models/statistics/devices', () => ({
  Devices: { getTableName: () => 'devices' },
}))
jest.mock('../../../src/server/models/statistics/daily', () => ({
  Clicks: { getTableName: () => 'daily' },
}))
jest.mock('../../../src/server/models/statistics/weekday', () => ({
  WeekdayClicks: { getTableName: () => 'weekday' },
}))

const findOne = jest.spyOn(urlModelMock, 'findOne')

const shortUrl = 'short-url'

const repository = new LinkStatisticsRepository()

describe('LinkStatisticsRepository', () => {
  beforeEach(async () => {
    findOne.mockClear()
  })

  it('returns null on no url', async () => {
    findOne.mockResolvedValue(null)
    await expect(repository.findByShortUrl(shortUrl)).resolves.toBeFalsy()
    expect(findOne).toBeCalledWith(
      expect.objectContaining({ where: { shortUrl } }),
    )
  })

  it('returns null on no device click stats', async () => {
    findOne.mockResolvedValue({ DailyClicks: [], WeekdayClicks: [] })
    await expect(repository.findByShortUrl(shortUrl)).resolves.toBeFalsy()
    expect(findOne).toBeCalledWith(
      expect.objectContaining({ where: { shortUrl } }),
    )
  })

  it('returns values on some device click stats', async () => {
    const url = {
      clicks: 4,
      DeviceClicks: { toJSON: () => ({ desktop: 1 }) },
      DailyClicks: [{ date: 'today', clicks: 2 }],
      WeekdayClicks: [
        { weekday: 0, hours: 12, clicks: 3 },
        { weekday: 0, hours: 13, clicks: 1 },
      ],
    }
    findOne.mockResolvedValue(url)
    await expect(repository.findByShortUrl(shortUrl)).resolves.toStrictEqual({
      totalClicks: url.clicks,
      deviceClicks: url.DeviceClicks.toJSON(),
      dailyClicks: url.DailyClicks,
      weekdayClicks: url.WeekdayClicks,
    })
    expect(findOne).toBeCalledWith(
      expect.objectContaining({ where: { shortUrl } }),
    )
  })

  it('correctly interpolates table names into update_link_statistics', () => {
    expect(updateLinkStatistics).toMatch('devices')
    expect(updateLinkStatistics).toMatch('daily')
    expect(updateLinkStatistics).toMatch('weekday')
  })

  it('correctly calls sequelize from updateLinkStatistics', () => {
    const query = jest.spyOn(sequelizeMock, 'query')
    sequelizeMock.$queueQueryResult({})

    const device = 'desktop'

    repository.updateLinkStatistics(shortUrl, device)
    expect(query).toHaveBeenCalledWith(expect.stringContaining(shortUrl), {
      type: QueryTypes.SELECT,
    })
    expect(query).toHaveBeenCalledWith(expect.stringContaining(device), {
      type: QueryTypes.SELECT,
    })
  })
})
