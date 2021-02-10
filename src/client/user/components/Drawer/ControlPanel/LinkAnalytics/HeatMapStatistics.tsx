import React, { useEffect, useRef, useState } from 'react'
import { HeatmapSeries, XAxis, XYPlot, YAxis } from 'react-vis'
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

  return (
    <BaseStatisticsLayout title="When do your users visit?">
      <div ref={containerEl} className={classes.root}>
        <XYPlot
          width={Math.max(width, 275)}
          height={isMobileView ? 500 : Math.max(width * 0.5, 275)}
          margin={{ left: 50, top: 32 }}
          xType="ordinal"
          xDomain={isMobileView ? getWeekRange() : getDayRange()}
          yType="ordinal"
          yDomain={
            isMobileView ? getDayRange().reverse() : getWeekRange().reverse()
          }
        >
          <XAxis
            orientation="top"
            tickValues={
              !isMobileView ? ['12am', '6am', '12pm', '6pm'] : undefined
            }
            style={{
              fill: theme.palette.primary.main,
              fontSize: theme.typography.caption.fontSize,
            }}
          />
          <YAxis
            style={{
              fill: theme.palette.primary.main,
              fontSize: theme.typography.caption.fontSize,
            }}
          />
          <HeatmapSeries
            className="heatmap-statistics"
            colorRange={['#CDDCE0', '#2F4B62']}
            colorDomain={[minClicks, maxClicks]}
            data={clicks as any[]}
            style={{
              stroke: 'white',
              strokeWidth: '2px',
            }}
          />
        </XYPlot>
        <HeatmapLegend minClicks={minClicks} maxClicks={maxClicks} />
      </div>
    </BaseStatisticsLayout>
  )
}
