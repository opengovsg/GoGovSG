export interface DeviceClicksInterface {
  desktop: number
  tablet: number
  mobile: number
  others: number
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
  totalClicks: number
  deviceClicks: DeviceClicksInterface
  dailyClicks: DailyClicksInterface[]
  weekdayClicks: WeekdayClicksInterface[]
}
