import React, { useEffect, useRef, useState } from 'react'
import { Scatter } from 'react-chartjs-2'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { useMediaQuery, useTheme } from '@material-ui/core'

import {
  HeatMapDataPoint,
  getDayRange,
  getWeekRange,
  getZeroedHeatMap,
} from './util/date-range.js'
import BaseStatisticsLayout from './BaseStatisticsLayout.js'
import { useWindowSize } from './util/window-size.js'
import { HeatmapLegend } from './widgets/HeatMapStatistics/HeatmapLegend.js'
import { WeekdayClicks } from '../../../../../../shared/interfaces/link-statistics.js'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 24,
  },
}))

const HOUR_TICKS_TO_SHOW = ['12am', '6am', '12pm', '6pm']

const processInputStatistics = (rawStatistics: WeekdayClicks[]) => {
  const zeroed = getZeroedHeatMap()
  const hourMapping = getDayRange()
  const weekdayMapping = getWeekRange()
  rawStatistics.forEach((statistics) => {
    zeroed
      .filter(
        (item) =>
          item.x === hourMapping[statistics.hours] &&
          // In order to move Sunday, represented by index 0, to the final index.
          item.y === weekdayMapping[(statistics.weekday + 6) % 7],
      )
      .forEach((filteredItem) => {
        /* eslint-disable no-param-reassign */
        filteredItem.color = statistics.clicks
      })
  })
  return zeroed
}

const flipChart = (data: HeatMapDataPoint[]): HeatMapDataPoint[] => {
  return data.map((point) => {
    return { x: point.y, y: point.x, color: point.color } as HeatMapDataPoint
  })
}

const hexToRgb = (hex: string): [number, number, number] => {
  const parsed = hex.replace('#', '')
  const r = parseInt(parsed.substring(0, 2), 16)
  const g = parseInt(parsed.substring(2, 4), 16)
  const b = parseInt(parsed.substring(4, 6), 16)
  return [r, g, b]
}

const interpolateColor = (from: string, to: string, ratio: number): string => {
  const clampedRatio = Number.isFinite(ratio)
    ? Math.min(Math.max(ratio, 0), 1)
    : 0
  const [r1, g1, b1] = hexToRgb(from)
  const [r2, g2, b2] = hexToRgb(to)
  const r = Math.round(r1 + (r2 - r1) * clampedRatio)
  const g = Math.round(g1 + (g2 - g1) * clampedRatio)
  const b = Math.round(b1 + (b2 - b1) * clampedRatio)
  return `rgb(${r}, ${g}, ${b})`
}

export type HeatMapStatisticsProps = {
  weekdayClicks: WeekdayClicks[]
}

export default function HeatMapStatistics({
  weekdayClicks,
}: HeatMapStatisticsProps) {
  const classes = useStyles()
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('xs'))

  const [width, setWidth] = useState<number>(0)
  const containerEl = useRef<HTMLDivElement>(null)
  const windowSize = useWindowSize()

  let clicks = processInputStatistics(weekdayClicks)

  // Flip axes in mobile view.
  if (isMobileView) {
    clicks = flipChart(clicks)
  }

  const minClicks = Math.min(...clicks.map((el) => el.color))
  // Round up to next multiple of 4.
  const maxClicks = Math.ceil(Math.max(...clicks.map((el) => el.color)) / 4) * 4

  useEffect(() => {
    if (containerEl != null && containerEl.current != null) {
      setWidth(containerEl.current.getBoundingClientRect().width)
    }
  }, [windowSize])

  const chartWidth = Math.max(width, 275)
  const chartHeight = isMobileView ? 500 : Math.max(width * 0.5, 275)

  const xDomain = isMobileView ? getWeekRange() : getDayRange()
  const yDomain = isMobileView
    ? getDayRange().reverse()
    : getWeekRange().reverse()

  const columns = xDomain.length
  const rows = yDomain.length
  const plotWidth = chartWidth - 50
  const plotHeight = chartHeight - 32
  const cellSize = Math.min(plotWidth / columns, plotHeight / rows)
  const pointRadius = (cellSize * 0.9) / Math.SQRT2

  const categoryTick =
    (labels: string[], formatLabel: (label: string) => string) =>
    (value: string | number) => {
      const index = typeof value === 'number' ? value : Number(value)
      if (!Number.isInteger(index) || index < 0 || index >= labels.length) {
        return ''
      }

      return formatLabel(labels[index])
    }

  const data = {
    datasets: [
      {
        data: clicks.map((point) => ({
          x: xDomain.indexOf(point.x),
          y: yDomain.indexOf(point.y),
        })),
        pointBackgroundColor: clicks.map((point) =>
          interpolateColor(
            theme.palette.secondary.light,
            theme.palette.secondary.dark,
            (point.color - minClicks) / (maxClicks - minClicks),
          ),
        ),
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointStyle: 'rect' as const,
        pointRadius,
        pointHoverRadius: pointRadius,
        showLine: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    legend: { display: false },
    tooltips: { enabled: false },
    scales: {
      xAxes: [
        {
          type: 'linear',
          position: 'top',
          offset: true,
          ticks: {
            min: 0,
            max: xDomain.length - 1,
            stepSize: 1,
            fontColor: theme.palette.primary.main,
            fontSize: theme.typography.caption.fontSize,
            callback: categoryTick(xDomain, (label) =>
              isMobileView || HOUR_TICKS_TO_SHOW.includes(label) ? label : '',
            ),
          },
          gridLines: {
            offsetGridLines: true,
          },
        },
      ],
      yAxes: [
        {
          type: 'linear',
          offset: true,
          ticks: {
            min: 0,
            max: yDomain.length - 1,
            stepSize: 1,
            fontColor: theme.palette.primary.main,
            fontSize: theme.typography.caption.fontSize,
            callback: categoryTick(yDomain, (label) => label),
          },
          gridLines: {
            offsetGridLines: true,
          },
        },
      ],
    },
  }

  return (
    <BaseStatisticsLayout title="When do your users visit?">
      <div ref={containerEl} className={classes.root}>
        <div style={{ width: chartWidth, height: chartHeight }}>
          <Scatter data={data} options={options as any} />
        </div>
        <HeatmapLegend minClicks={minClicks} maxClicks={maxClicks} />
      </div>
    </BaseStatisticsLayout>
  )
}
