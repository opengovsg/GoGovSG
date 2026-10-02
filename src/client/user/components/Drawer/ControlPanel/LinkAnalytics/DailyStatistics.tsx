import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import moment from 'moment'

import { useTheme } from '@mui/material'
import BaseStatisticsLayout from './BaseStatisticsLayout'
import { DailyClicks } from '../../../../../../shared/interfaces/link-statistics'
import { useDateRangeWith } from './util/date-range'
import { compactNumberFormatter } from '../../../../../app/util/format'
import DownloadClicksButton from './widgets/DailyStatistics/DownloadClicksButton'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
)

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
      tension: 0,
      backgroundColor: primaryColor,
      borderColor: primaryColor,
      pointHitRadius: 20,
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
        options={{
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                font: {
                  family: "'IBM Plex Sans', sans-serif",
                  size: 12,
                },
                color: primaryColor,
                padding: 8,
                callback: (_value, index): string | undefined => {
                  const label = data.labels?.[index]
                  return moment(label, 'D MMM').format('ddd')
                },
              },
            },
            y: {
              ticks: {
                font: {
                  family: "'IBM Plex Sans', sans-serif",
                  size: 12,
                },
                color: primaryColor,
                autoSkip: true,
                maxTicksLimit: 5,
                padding: 5,
                callback: (label): string | undefined => {
                  const numericLabel = Number(label)
                  // Prevents decimals on the y-axis.
                  if (Math.floor(numericLabel) === numericLabel) {
                    return compactNumberFormatter(numericLabel)
                  }
                  return undefined
                },
              },
              min: 0,
            },
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                title: (tooltipItems) => {
                  const label = tooltipItems[0]?.label ?? ''
                  const fullDate = moment(label, 'D MMM').format('DD MMMM yyyy')
                  return fullDate.toString()
                },
                label: (tooltipItem) => {
                  return `${tooltipItem.parsed.y} total clicks`
                },
              },
              padding: 20,
              titleFont: {
                family: "'IBM Plex Sans', sans-serif",
                size: 10,
                weight: 'normal',
              },
              bodyFont: {
                family: "'IBM Plex Sans', sans-serif",
                size: 14,
                weight: 'bold',
              },
              titleColor: primaryColor,
              bodyColor: primaryColor,
              backgroundColor: '#FFFFFF',
              borderColor: theme.palette.secondary.dark,
              borderWidth: 0.2,
              displayColors: false,
            },
          },
        }}
      />
    </BaseStatisticsLayout>
  )
}
