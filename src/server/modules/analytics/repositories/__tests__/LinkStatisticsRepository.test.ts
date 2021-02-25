import { Op, QueryTypes } from 'sequelize'
import {
  sequelizeMock,
  urlModelMock,
} from '../../../../../../test/server/api/util'

import {
  LinkStatisticsRepository,
  updateLinkStatistics,
} from '../LinkStatisticsRepository'
import { DailyClicks } from '../../../../models/statistics/daily'
import { getLocalDayGroup } from '../../../../util/time'

jest.mock('../../../../util/sequelize', () => ({
  sequelize: sequelizeMock,
}))
jest.mock('../../../../models/url', () => ({
  Url: urlModelMock,
}))

jest.mock('../../../../models/statistics/devices', () => ({
  Devices: { getTableName: () => 'devices' },
}))
jest.mock('../../../../models/statistics/daily', () => ({
  DailyClicks: { getTableName: () => 'daily' },
}))
jest.mock('../../../../models/statistics/weekday', () => ({
  WeekdayClicks: { getTableName: () => 'weekday' },
}))

const findOne = jest.spyOn(urlModelMock, 'findOne')
const scope = jest.spyOn(urlModelMock, 'scope')

const shortUrl = 'short-url'

const repository = new LinkStatisticsRepository()

describe('LinkStatisticsRepository', () => {
  beforeEach(async () => {
    findOne.mockClear()
    scope.mockClear()
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
      DeviceClicks: { toJSON: () => ({ desktop: 1 }) },
      DailyClicks: [{ date: 'today', clicks: 2 }],
      WeekdayClicks: [
        { weekday: 0, hours: 12, clicks: 3 },
        { weekday: 0, hours: 13, clicks: 1 },
      ],
      UrlClicks: {
        clicks: 2,
      },
    }
    findOne.mockResolvedValue(url)
    await expect(repository.findByShortUrl(shortUrl)).resolves.toStrictEqual({
      totalClicks: url.UrlClicks.clicks,
      deviceClicks: url.DeviceClicks.toJSON(),
      dailyClicks: url.DailyClicks,
      weekdayClicks: url.WeekdayClicks,
    })
    expect(findOne).toBeCalledWith(
      expect.objectContaining({ where: { shortUrl } }),
    )
    expect(scope).toBeCalledWith('getClicks')
  })

  it('correctly queries daily click stats', async () => {
    const url = {
      DeviceClicks: { toJSON: () => ({ desktop: 1 }) },
      DailyClicks: [{ date: 'today', clicks: 2 }],
      WeekdayClicks: [
        { weekday: 0, hours: 12, clicks: 3 },
        { weekday: 0, hours: 13, clicks: 1 },
      ],
      UrlClicks: {
        clicks: 2,
      },
    }
    findOne.mockResolvedValue(url)
    await expect(repository.findByShortUrl(shortUrl)).resolves.toStrictEqual({
      totalClicks: url.UrlClicks.clicks,
      deviceClicks: url.DeviceClicks.toJSON(),
      dailyClicks: url.DailyClicks,
      weekdayClicks: url.WeekdayClicks,
    })
    expect(findOne).toBeCalledWith(
      expect.objectContaining({
        where: { shortUrl },
        include: expect.arrayContaining([
          {
            model: DailyClicks,
            as: 'DailyClicks',
            where: {
              date: {
                // To retrieve a range from today, and up to 6 days ago inclusive.
                [Op.between]: [getLocalDayGroup(-6), getLocalDayGroup()],
              },
            },
            required: false,
          },
        ]),
      }),
    )
    expect(scope).toBeCalledWith('getClicks')
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
