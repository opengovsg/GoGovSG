import moment from 'moment'
import 'moment-timezone'

export type Time = {
  /**
   * Number representing a day of the week.
   *
   * 0: Sunday.
   * 1: Monday.
   * 2: Tuesday.
   * 3: Wednesday.
   * 4: Thursday.
   * 5: Friday.
   * 6: Saturday.
   */
  weekday: number
  /**
   * Number representing the hours into the day in local time.
   */
  hours: number
  /**
   * Date representation rounded down to the nearest day.
   */
  date: string
}

/**
 * Get the time now in Singapore time.
 */
function getLocalDate(offsetDays: number): moment.Moment {
  const time = moment.tz('Asia/Singapore').add(offsetDays, 'days')
  return time
}

/**
 * Get the local date string in the yyyy-MM-DD format.
 *
 * @param offsetDays The number of days after the time now.
 */
export function getLocalDayGroup(offsetDays: number = 0): string {
  return getLocalDate(offsetDays).format('yyyy-MM-DD')
}

/**
 * Retrieves the day of the week as a number.
 */
export function getLocalWeekday(offsetDays: number = 0): number {
  return getLocalDate(offsetDays).days()
}

/**
 * Retrieves the current UTC date information for statistics.
 */
export function getLocalTime(offsetDays: number = 0): Time {
  return {
    weekday: getLocalWeekday(offsetDays),
    hours: getLocalDate(offsetDays).hours(),
    date: getLocalDayGroup(offsetDays),
  }
}
