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
function getLocalDate(): moment.Moment {
  const time = moment.tz('Asia/Singapore')
  return time
}

/**
 * Get the local date string in the yyyy-MM-DD format.
 */
function getLocalDayGroup(): string {
  return getLocalDate().format('yyyy-MM-DD')
}

/**
 * Retrieves the day of the week as a number.
 */
function getLocalWeekday(): number {
  return getLocalDate().days()
}

/**
 * Retrieves the current UTC date information for statistics.
 */
export function getLocalTime(): Time {
  return {
    weekday: getLocalWeekday(),
    hours: getLocalDate().hours(),
    date: getLocalDayGroup(),
  }
}

export default { getLocalTime }
