import { injectable } from 'inversify'
import { Op, QueryTypes } from 'sequelize'
import _ from 'lodash'

import { Url, UrlType } from '../models/url'
import { Clicks, ClicksType } from '../models/statistics/daily'
import { Devices, DevicesType } from '../models/statistics/devices'
import { WeekdayClicks, WeekdayClicksType } from '../models/statistics/weekday'
import { LinkStatisticsInterface } from '../../shared/interfaces/link-statistics'
import { LinkStatisticsRepositoryInterface } from './interfaces/LinkStatisticsRepositoryInterface'
import { getLocalDayGroup } from '../util/time'
import { sequelize } from '../util/sequelize'
import { DeviceType } from '../services/interfaces/DeviceCheckServiceInterface'

// Get the relevant table names from their models.
const urlTable = Url.getTableName()
const devicesTable = Devices.getTableName()
const clicksTable = Clicks.getTableName()
const weekdayTable = WeekdayClicks.getTableName()
const timeZone = 'Asia/Singapore'

/**
 * This function is used to update the relevant link statistics tables, when called.
 */
export const updateLinkStatistics = `CREATE OR REPLACE FUNCTION update_link_statistics (inputShortUrl text, device text)
RETURNS void AS $$
BEGIN
-- Update total clicks.
UPDATE "${urlTable}" SET "clicks" = "${urlTable}"."clicks" + 1
WHERE "shortUrl" = inputShortUrl;
-- Update devices clicks.
IF device='mobile' THEN
  INSERT INTO "${devicesTable}" ("shortUrl", "mobile", "tablet", "desktop", "others", "createdAt", "updatedAt")
  VALUES (inputShortUrl, 1, 0, 0, 0, current_timestamp, current_timestamp)
  ON CONFLICT ("shortUrl")
  DO UPDATE SET "mobile" = "${devicesTable}"."mobile" + 1;
ELSIF device='tablet' THEN
  INSERT INTO "${devicesTable}" ("shortUrl", "mobile", "tablet", "desktop", "others", "createdAt", "updatedAt")
  VALUES (inputShortUrl, 0, 1, 0, 0, current_timestamp, current_timestamp)
  ON CONFLICT ("shortUrl")
  DO UPDATE SET "tablet" = "${devicesTable}"."tablet" + 1;
ELSIF device='desktop' THEN
  INSERT INTO "${devicesTable}" ("shortUrl", "mobile", "tablet", "desktop", "others", "createdAt", "updatedAt")
  VALUES (inputShortUrl, 0, 0, 1, 0, current_timestamp, current_timestamp)
  ON CONFLICT ("shortUrl")
  DO UPDATE SET "desktop" = "${devicesTable}"."desktop" + 1;
ELSIF device='others' THEN
  INSERT INTO "${devicesTable}" ("shortUrl", "mobile", "tablet", "desktop", "others", "createdAt", "updatedAt")
  VALUES (inputShortUrl, 0, 0, 0, 1, current_timestamp, current_timestamp)
  ON CONFLICT ("shortUrl")
  DO UPDATE SET "others" = "${devicesTable}"."others" + 1;
END IF;
-- Update daily clicks.
INSERT INTO "${clicksTable}" ("shortUrl", "date", "clicks", "createdAt", "updatedAt")
VALUES (inputShortUrl, date(current_timestamp at time zone '${timeZone}'), 1, current_timestamp, current_timestamp)
ON CONFLICT ("shortUrl", "date")
DO UPDATE SET "clicks" = "${clicksTable}"."clicks" + 1;
-- Update weekday clicks.
INSERT INTO "${weekdayTable}" ("shortUrl", "weekday", "hours", "clicks", "createdAt", "updatedAt")
VALUES (inputShortUrl, extract(dow from date(current_timestamp at time zone '${timeZone}')), extract(hour from current_timestamp at time zone '${timeZone}'), 1, current_timestamp, current_timestamp)
ON CONFLICT ("shortUrl", "weekday", "hours")
DO UPDATE SET "clicks" = "${weekdayTable}"."clicks" + 1;
END; $$ LANGUAGE plpgsql;
`

export type UrlStats = UrlType & {
  Url: UrlType
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
          // As previously accessed links can be inactive for over a week.
          required: false,
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

      const totalClicks = url.clicks

      const deviceClicks = urlStats.DeviceClicks
        ? _.pick(urlStats.DeviceClicks.toJSON(), [
            'desktop',
            'tablet',
            'mobile',
            'others',
          ])
        : // Fallback if device statistics is never updated.
          { desktop: 0, tablet: 0, mobile: 0, others: 0 }

      const dailyClicks = urlStats.DailyClicks.map((clicks) => {
        return _.pick(clicks, ['date', 'clicks'])
      })

      const weekdayClicks = urlStats.WeekdayClicks.map((clicks) => {
        return _.pick(clicks, ['weekday', 'hours', 'clicks'])
      })

      if (Object.values(deviceClicks).some((val) => val !== 0)) {
        return {
          totalClicks,
          deviceClicks,
          dailyClicks,
          weekdayClicks,
        } as LinkStatisticsInterface
      }
      // There are no statistics to show yet.
      return null
    }
    return null
  }

  public updateLinkStatistics: (
    shortUrl: string,
    device: DeviceType,
  ) => void = (shortUrl, device) => {
    // Creates or modifies an existing function.
    const rawFunction = `
      SELECT update_link_statistics('${shortUrl}', '${device}')
    `
    return sequelize.query(rawFunction, { type: QueryTypes.SELECT })
  }
}

export default LinkStatisticsRepository
