import _ from 'lodash'

import { getLocalDayGroup } from '../../../../../../../server/util/time'
import { DailyClicksInterface } from '../../../../../../../shared/interfaces/link-statistics'

export const useDateRange = (days: number): DailyClicksInterface[] => {
  const range: DailyClicksInterface[] = []
  for (let i = 0; i < days; i += 1) {
    range.unshift({
      date: getLocalDayGroup(-i),
      clicks: 0,
    })
  }
  return range
}

export const useDateRangeWith = (
  data: DailyClicksInterface[],
  days: number,
): DailyClicksInterface[] => {
  const range = useDateRange(days)
  data.forEach((item) => {
    range
      .filter((rangeItem) => rangeItem.date === item.date)
      .forEach((rangeItem) => {
        // eslint-disable-next-line no-param-reassign
        rangeItem.clicks = item.clicks
      })
  })
  return range
}

export const getWeekRange = () => {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
}

export const getDayRange = () => {
  const hours = _.range(0, 24)
  return hours.map((hour) => {
    if (hour === 0) return '12am'
    if (hour < 12) return `${hour}am`
    if (hour === 12) return '12pm'
    return `${hour - 12}pm`
  })
}

export type HeatMapDataPoint = {
  x: string
  y: string
  color: number
}

export const getZeroedHeatMap = (): HeatMapDataPoint[] => {
  const days = getWeekRange()
  const hours = getDayRange()
  const zeroredData: any[] = []
  days.forEach((day) =>
    hours.forEach((hour) => zeroredData.push({ x: hour, y: day, color: 0 })),
  )
  return zeroredData
}
