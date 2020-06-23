export interface DeviceClicksInterface {
  desktopClicks: number
  tabletClicks: number
  mobileClicks: number
  otherClicks: number
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
