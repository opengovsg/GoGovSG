import { injectable } from 'inversify'
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

export type UrlStats = UrlType & {
  DeviceClicks: DevicesType
  DailyClicks: ClicksType[]
  WeekdayClicks: WeekdayClicksType[]
}

@injectable()
export class LinkStatisticsRepository
  implements LinkStatisticsRepositoryInterface {
  /**
   * Retrieves link statistics for a specified short link.
   *
   * @param shortUrl The target short url to retrieve link statistics.
   */
  public findByShortUrl: (
    shortUrl: string,
  ) => Promise<LinkStatisticsInterface | null> = async (shortUrl) => {
    const url = await Url.findOne({
      where: { shortUrl },
      include: [
        { model: Devices, as: 'DeviceClicks' },
        { model: Clicks, as: 'DailyClicks' },
        { model: WeekdayClicks, as: 'WeekdayClicks' },
      ],
    })
    if (url) {
      const urlStats = url as UrlStats

      const deviceClicks = {
        desktopClicks: urlStats.DeviceClicks.desktop,
        tabletClicks: urlStats.DeviceClicks.tablet,
        mobileClicks: urlStats.DeviceClicks.mobile,
        otherClicks: urlStats.DeviceClicks.others,
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
}

export default LinkStatisticsRepository
