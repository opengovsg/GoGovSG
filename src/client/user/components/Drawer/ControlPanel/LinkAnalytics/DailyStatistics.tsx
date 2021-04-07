import React from 'react'
import { Line } from 'react-chartjs-2'
import moment from 'moment'

import { useTheme } from '@material-ui/core'
import BaseStatisticsLayout from './BaseStatisticsLayout'
import { DailyClicks } from '../../../../../../shared/interfaces/link-statistics'
import { useDateRangeWith } from './util/date-range'
import { compactNumberFormatter } from '../../../../../app/util/format'
import DownloadClicksButton from './widgets/DailyStatistics/DownloadClicksButton'

export type DailyStatisticsProps = {
  dailyClicks: DailyClicks[]
}

export function processData(data: DailyClicks[], primaryColor: string) {
  const labels = data.map((day) => {
    return moment(day.date, 'yyyy-MM-DD').format('D MMM')
  })
  const points = data.map((day) => day.clicks)
  const datasets = [
    {
      fill: false,
      lineTension: 0,
      backgroundColor: primaryColor,
      borderColor: primaryColor,
      pointColor: primaryColor,
      pointHitRadius: 20,
      pointStrokeColor: primaryColor,
      pointRadius: 0,
      pointHoverRadius: 5,
      data: points,
    },
  ]
  return { labels, datasets }
}

export default function DailyStatistics({ dailyClicks }: DailyStatisticsProps) {
  const theme = useTheme()
  const filledData = useDateRangeWith(dailyClicks, 7)

  const primaryColor = theme.palette.primary.main

  const data = processData(filledData, primaryColor)
  return (
    <BaseStatisticsLayout
      title="How many users have visited your link in the past week?"
      subtitle={<DownloadClicksButton />}
    >
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
                  fontColor: primaryColor,
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
                  fontColor: primaryColor,
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
            titleFontColor: primaryColor,
            bodyFontColor: primaryColor,
            titleFontStyle: 'normal',
            bodyFontStyle: 'bold',
            backgroundColor: '#FFFFFF',
            borderColor: theme.palette.secondary.dark,
            borderWidth: 0.2,
            displayColors: false,
          },
        }}
      />
    </BaseStatisticsLayout>
  )
}
