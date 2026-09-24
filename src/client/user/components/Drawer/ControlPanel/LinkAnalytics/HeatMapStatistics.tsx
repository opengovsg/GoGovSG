import React, { useEffect, useRef, useState } from 'react'
import { Scatter } from 'react-chartjs-2'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { useMediaQuery, useTheme } from '@material-ui/core'

import {
  HeatMapDataPoint,
  getDayRange,
  getWeekRange,
  getZeroedHeatMap,
} from './util/date-range'
import BaseStatisticsLayout from './BaseStatisticsLayout'
import { useWindowSize } from './util/window-size'
import { HeatmapLegend } from './widgets/HeatMapStatistics/HeatmapLegend'
import { WeekdayClicks } from '../../../../../../shared/interfaces/link-statistics'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 24,
  },
}))

const HOUR_TICKS_TO_SHOW = ['12am', '6am', '12pm', '6pm']

// MUI's default root font size, used to convert its rem-based typography
// sizes to the pixel values Chart.js expects. This theme doesn't override it.
const HTML_FONT_SIZE = 16

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

  // Chart.js v2 expects `ticks.fontSize` in pixels; MUI's typography sizes
  // are rem strings (e.g. '0.8125rem'), so they must be converted or the
  // scale's box size computation silently resolves to NaN and nothing draws.
  const tickFontSize =
    parseFloat(theme.typography.caption.fontSize as string) * HTML_FONT_SIZE

  const xDomain = isMobileView ? getWeekRange() : getDayRange()
  const yDomain = isMobileView
    ? getDayRange().reverse()
    : getWeekRange().reverse()

  // Chart.js's built-in point styles (including 'rect') take a single
  // `radius` and always draw a square. To get an actual rectangle whose
  // width and height can differ, points are drawn invisibly (radius 0)
  // and a plugin below paints a rect of these dimensions in their place.
  const drawRectPointsPlugin = {
    afterDatasetsDraw: (chart: any) => {
      const meta = chart.getDatasetMeta(0)
      const { ctx } = chart
      const xScale = chart.scales['x-axis-1']
      const yScale = chart.scales['y-axis-1']
      if (!xScale || !yScale) return
      // Read spacing from the live scales (not chartArea / tick count) so
      // offset padding and breakpoint-driven axis changes stay in sync even
      // though react-chartjs-2 only registers plugins at chart construction.
      const cellWidth = Math.abs(
        xScale.getPixelForValue(1) - xScale.getPixelForValue(0),
      )
      const cellHeight = Math.abs(
        yScale.getPixelForValue(1) - yScale.getPixelForValue(0),
      )
      meta.data.forEach((point: any) => {
        const model = point._model
        if (!model) return
        ctx.save()
        ctx.fillStyle = model.backgroundColor
        ctx.strokeStyle = model.borderColor
        ctx.lineWidth = model.borderWidth
        // strokeRect strokes a path centered on it, so half of borderWidth
        // would otherwise extend past the cell into its neighbour. Inset
        // the path by borderWidth so the stroke's outer edge, not the
        // fill's edge, lines up with the cell boundary.
        const rectWidth = cellWidth
        const rectHeight = cellHeight
        const x = model.x - rectWidth / 2
        const y = model.y - rectHeight / 2
        ctx.fillRect(x, y, rectWidth, rectHeight)
        ctx.strokeRect(x, y, rectWidth, rectHeight)
        ctx.restore()
      })
    },
  }

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
        // Actual drawing is done by drawRectPointsPlugin so it can use
        // independent width/height; keep chart.js's own points invisible.
        pointRadius: 0,
        pointHoverRadius: 0,
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
            fontSize: tickFontSize,
            // Gap between the tick labels and the plot area.
            padding: 12,
            // Chart.js only centers a tick label on its tick when unrotated;
            // once it auto-rotates to fit, it anchors from the label's start
            // instead, which visibly shifts it off-center. Force no rotation
            // so labels (e.g. '12am' on the first tick) stay centered.
            minRotation: 0,
            maxRotation: 0,
            callback: categoryTick(xDomain, (label) =>
              isMobileView || HOUR_TICKS_TO_SHOW.includes(label) ? label : '',
            ),
          },
          gridLines: false,
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
            fontSize: tickFontSize,
            // Gap between the tick labels and the plot area.
            padding: 12,
            callback: categoryTick(yDomain, (label) => label),
          },
          gridLines: false,
        },
      ],
    },
  }

  return (
    <BaseStatisticsLayout title="When do your users visit?">
      <div ref={containerEl} className={classes.root}>
        <div
          style={{
            width: chartWidth,
            height: chartHeight,
            marginBottom: '2rem',
          }}
        >
          <Scatter
            data={data}
            options={options as any}
            plugins={[drawRectPointsPlugin]}
          />
        </div>
        <HeatmapLegend minClicks={minClicks} maxClicks={maxClicks} />
      </div>
    </BaseStatisticsLayout>
  )
}
