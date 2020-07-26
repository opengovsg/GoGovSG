import React, { useState, useEffect, useRef } from 'react'
import { XYPlot, XAxis, YAxis, HeatmapSeries } from 'react-vis'

import BaseStatisticsLayout from './BaseStatisticsLayout'
import makeStyles from '@material-ui/core/styles/makeStyles'
import useWindowSize from './util/window-size'
import { getZeroedHeatMap, getWeekRange, getDayRange } from './util/date-range'
import { WeekdayClicksInterface } from '../../../../../../shared/interfaces/link-statistics'
import { HeatmapLegend } from './widgets/HeatMapStatistics/HeatmapLegend'
import { useTheme } from '@material-ui/core'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 24,
  },
}))

const processInputStatistics = (rawStatistics: WeekdayClicksInterface[]) => {
  const zeroed = getZeroedHeatMap()
  const hourMapping = getDayRange()
  const weekdayMapping = getWeekRange()
  rawStatistics.forEach((statistics) => {
    zeroed
      .filter(
        (item) =>
          item.x == hourMapping[statistics.hours] &&
          // In order to move Sunday, represented by index 0, to the final index.
          item.y == weekdayMapping[(statistics.weekday + 6) % 7],
      )
      .forEach((filteredItem) => (filteredItem.color = statistics.clicks))
  })
  return zeroed
}

export type HeatMapStatisticsProps = {
  weekdayClicks: WeekdayClicksInterface[]
}

export default function HeatMapStatistics(props: HeatMapStatisticsProps) {
  const classes = useStyles()
  const theme = useTheme()

  const [width, setWidth] = useState<number>(0)
  const containerEl = useRef<HTMLDivElement>(null)
  const windowSize = useWindowSize()

  const clicks = processInputStatistics(props.weekdayClicks)
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
          height={Math.max(width * 0.5, 275)}
          margin={{ left: 50, top: 32 }}
          xType="ordinal"
          xDomain={getDayRange()}
          yType="ordinal"
          yDomain={getWeekRange().reverse()}
        >
          <XAxis
            orientation="top"
            tickValues={['12am', '6am', '12pm', '6pm']}
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
