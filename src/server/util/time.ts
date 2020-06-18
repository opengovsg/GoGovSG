import moment from 'moment'
import 'moment-timezone'

import { StorageDay } from '../repositories/enums'

export type UtcDate = {
  dayOfWeekSGT: StorageDay
  hoursfromEpochUTC: number
}

/**
 * Get the time now in Singapore time.
 */
function getLocalDate(): moment.Moment {
  return moment.tz('Asia/Singapore')
}

/**
 * Returns the number from epoch, with all decimals truncated.
 */
function getHoursFromEpoch(): number {
  const epochSeconds = getLocalDate().unix()
  const epochHours = Math.floor(epochSeconds / (60 * 60))
  return epochHours
}

/**
 * Maps the day of the week in number, into a enum value that our database table can consume.
 *
 * @param day Number representing the day of the week.
 */
function mapDayToWeekEnum(day: number): StorageDay {
  if (day < 0 || day > 7) throw Error('Invalid day invalid provided.')
  switch (day) {
    case 0:
      return StorageDay.Sunday
    case 1:
      return StorageDay.Monday
    case 2:
      return StorageDay.Tuesday
    case 3:
      return StorageDay.Wednesday
    case 4:
      return StorageDay.Thursday
    case 5:
      return StorageDay.Friday
    case 6:
      return StorageDay.Saturday
    default:
      throw Error('Invalid day invalid provided.')
  }
}

/**
 * Retrieves the day of the week as a number.
 */
function getDayOfWeek(): number {
  return getLocalDate().days()
}

/**
 * Retrieves the day of the week as a StorageWeekState.
 */
function getWeekEnumDay(): StorageDay {
  const day = getDayOfWeek()
  return mapDayToWeekEnum(day)
}

/**
 * Retrieves the current UTC date information for statistics.
 */
export function getUtcDate(): UtcDate {
  return {
    dayOfWeekSGT: getWeekEnumDay(),
    hoursfromEpochUTC: getHoursFromEpoch(),
  }
}

export default { getUtcDate }
