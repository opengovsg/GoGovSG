export interface DeviceClicksInterface {
  desktop: number
  tablet: number
  mobile: number
  other: number
}

export interface DailyClicksInterface {
  date: string
  clicks: number
}

export interface WeekdayClicksInterface {
  weekday: number
  hours: number
  clicks: number
}

export interface LinkStatisticsInterface {
  deviceClicks: DeviceClicksInterface
  dailyClicks: DailyClicksInterface[]
  weekdayClicks: WeekdayClicksInterface[]
}
