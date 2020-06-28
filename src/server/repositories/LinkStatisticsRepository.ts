import { injectable } from 'inversify'
import { Op, Transaction } from 'sequelize'

import { Url, UrlType } from '../models/url'
import { Clicks, ClicksType } from '../models/statistics/daily'
import { Devices, DevicesType } from '../models/statistics/devices'
import { WeekdayClicks, WeekdayClicksType } from '../models/statistics/weekday'
import {
  DailyClicksInterface,
  DeviceClicksInterface,
  LinkStatisticsInterface,
  WeekdayClicksInterface,
} from '../../shared/interfaces/link-statistics'
import { LinkStatisticsRepositoryInterface } from './interfaces/LinkStatisticsRepositoryInterface'
import { getLocalDayGroup, getLocalTime } from '../util/time'
import { NotFoundError } from '../util/error'
import { container } from '../util/inversify'
import { DeviceCheckServiceInterface } from '../services/interfaces/DeviceCheckServiceInterface'
import { DependencyIds } from '../constants'

export type UrlStats = UrlType & {
  DeviceClicks?: DevicesType
  DailyClicks: ClicksType[]
  WeekdayClicks: WeekdayClicksType[]
}

@injectable()
export class LinkStatisticsRepository
  implements LinkStatisticsRepositoryInterface {
  public findByShortUrl: (
    shortUrl: string,
  ) => Promise<LinkStatisticsInterface | null> = async (shortUrl) => {
    const url = await Url.findOne({
      where: { shortUrl },
      include: [
        { model: Devices, as: 'DeviceClicks' },
        {
          model: Clicks,
          as: 'DailyClicks',
          where: {
            date: {
              // To retrieve a range from today, and up to 6 days ago inclusive.
              [Op.between]: [getLocalDayGroup(-6), getLocalDayGroup()],
            },
          },
        },
        {
          model: WeekdayClicks,
          as: 'WeekdayClicks',
        },
      ],
      order: [
        [{ model: Clicks, as: 'DailyClicks' }, 'date', 'ASC'],
        [{ model: WeekdayClicks, as: 'WeekdayClicks' }, 'weekday', 'ASC'],
        [{ model: WeekdayClicks, as: 'WeekdayClicks' }, 'hours', 'ASC'],
      ],
    })
    if (url) {
      const urlStats = url as UrlStats

      const deviceClicks = {
        desktopClicks: urlStats.DeviceClicks?.desktop ?? 0,
        tabletClicks: urlStats.DeviceClicks?.tablet ?? 0,
        mobileClicks: urlStats.DeviceClicks?.mobile ?? 0,
        otherClicks: urlStats.DeviceClicks?.others ?? 0,
      } as DeviceClicksInterface

      const dailyClicks = urlStats.DailyClicks.map((clicks) => {
        return {
          date: clicks.date,
          clicks: clicks.clicks,
        } as DailyClicksInterface
      })

      const weekdayClicks = urlStats.WeekdayClicks.map((clicks) => {
        return {
          weekday: clicks.weekday,
          hours: clicks.hours,
          clicks: clicks.clicks,
        } as WeekdayClicksInterface
      })

      return {
        deviceClicks,
        dailyClicks,
        weekdayClicks,
      } as LinkStatisticsInterface
    }
    return null
  }

  public incrementClick: (
    shortUrl: string,
    transaction?: Transaction,
  ) => Promise<void> = async (shortUrl, transaction) => {
    const url = await Url.findOne({ where: { shortUrl }, transaction })
    if (!url) {
      throw new NotFoundError(
        `shortUrl not found in database:\tshortUrl=${shortUrl}`,
      )
    }
    await url.increment('clicks', { transaction })
  }

  public updateDailyStatistics: (
    shortUrl: string,
    transaction?: Transaction,
  ) => Promise<void> = async (shortUrl, transaction) => {
    const time = getLocalTime()
    const [clickStats] = await Clicks.findOrCreate({
      where: { shortUrl, date: time.date },
      transaction,
    })
    await clickStats.increment('clicks', { transaction })
  }

  public updateWeekdayStatistics: (
    shortUrl: string,
    transaction?: Transaction,
  ) => Promise<void> = async (shortUrl, transaction) => {
    const time = getLocalTime()
    const [clickStats] = await WeekdayClicks.findOrCreate({
      where: { shortUrl, weekday: time.weekday, hours: time.hours },
      transaction,
    })
    await clickStats.increment('clicks', { transaction })
  }

  public updateDeviceStatistics: (
    shortUrl: string,
    userAgent: string,
    transaction?: Transaction,
  ) => Promise<void> = async (shortUrl, userAgent, transaction) => {
    const deviceCheck = container.get<DeviceCheckServiceInterface>(
      DependencyIds.deviceCheckService,
    )
    const deviceType = deviceCheck.getDeviceType(userAgent)
    if (deviceType) {
      const [clickStats] = await Devices.findOrCreate({
        where: { shortUrl },
        transaction,
      })
      await clickStats.increment(deviceType!, { transaction })
    }
  }
}

export default LinkStatisticsRepository
