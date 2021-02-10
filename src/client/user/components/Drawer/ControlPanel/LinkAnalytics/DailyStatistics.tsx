import React from 'react'
import { Line } from 'react-chartjs-2'
import moment from 'moment'

import BaseStatisticsLayout from './BaseStatisticsLayout'
import { DailyClicks } from '../../../../../../shared/interfaces/link-statistics'
import { useDateRangeWith } from './util/date-range'
import { compactNumberFormatter } from '../../../../../app/util/format'

export type DailyStatisticsProps = {
  dailyClicks: DailyClicks[]
}

export function processData(data: DailyClicks[]) {
  const labels = data.map((day) => {
    return moment(day.date, 'yyyy-MM-DD').format('D MMM')
  })
  const points = data.map((day) => day.clicks)
  const datasets = [
    {
      fill: false,
      lineTension: 0,
      backgroundColor: '#456682',
      borderColor: '#456682',
      pointColor: '#456682',
      pointHitRadius: 20,
      pointStrokeColor: '#456682',
      pointRadius: 0,
      pointHoverRadius: 5,
      data: points,
    },
  ]
  return { labels, datasets }
}

export default function DailyStatistics({ dailyClicks }: DailyStatisticsProps) {
  const filledData = useDateRangeWith(dailyClicks, 7)
  const data = processData(filledData)
  return (
    <BaseStatisticsLayout title="How many users have visited your link in the past week?">
      <Line
        data={data}
        legend={{ display: false }}
        options={{
          scales: {
            xAxes: [
              {
                gridLines: {
                  display: false,
                },
                ticks: {
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: 12,
                  fontColor: '#456682',
                  padding: 8,
                  callback: (label: string): string | undefined => {
                    return moment(label, 'D MMM').format('ddd')
                  },
                },
              },
            ],
            yAxes: [
              {
                ticks: {
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: 12,
                  fontColor: '#456682',
                  autoSkip: true,
                  maxTicksLimit: 5,
                  padding: 5,
                  min: 0,
                  callback: (label: number): string | undefined => {
                    // Prevents decimals on the y-axis.
                    if (Math.floor(label) === label) {
                      return compactNumberFormatter(label)
                    }
                    return undefined
                  },
                },
              },
            ],
          },
          tooltips: {
            callbacks: {
              title: (tooltipItems: any, data: any) => {
                const index = tooltipItems[0].index ?? 0
                const label = data.labels?.[index].toString() ?? ''
                const fullDate = moment(label, 'D MMM').format('DD MMMM yyyy')
                return fullDate.toString()
              },
              label: (tooltipItem: any) => {
                const label = tooltipItem.yLabel
                return `${label} total clicks`
              },
            },
            xPadding: 20,
            yPadding: 20,
            titleFontFamily: "'IBM Plex Sans', sans-serif",
            bodyFontFamily: "'IBM Plex Sans', sans-serif",
            titleFontSize: 10,
            bodyFontSize: 14,
            titleFontColor: '#456682',
            bodyFontColor: '#456682',
            titleFontStyle: 'normal',
            bodyFontStyle: 'bold',
            backgroundColor: '#FFFFFF',
            borderColor: '#2F4B62',
            borderWidth: 0.2,
            displayColors: false,
          },
        }}
      />
    </BaseStatisticsLayout>
  )
}
