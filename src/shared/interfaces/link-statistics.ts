export interface DeviceClicks {
  desktop: number
  tablet: number
  mobile: number
  others: number
}

export interface DailyClicks {
  date: string
  clicks: number
}

export interface WeekdayClicks {
  weekday: number
  hours: number
  clicks: number
}

export interface LinkStatistics {
  totalClicks: number
  deviceClicks: DeviceClicks
  dailyClicks: DailyClicks[]
  weekdayClicks: WeekdayClicks[]
}
