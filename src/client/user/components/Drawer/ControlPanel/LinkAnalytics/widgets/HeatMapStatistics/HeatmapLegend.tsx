import React from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { compactNumberFormatter } from '../../../../../../../app/util/format'

export type HeatmapLegendItemStylesProps = {
  color: string
}

const useHeatmapLegendItemStyles = makeStyles(() => ({
  itemRoot: {
    flex: 1,
    height: 13,
    backgroundColor: (props: HeatmapLegendItemStylesProps) => props.color,
    marginTop: -8,
    marginRight: 4,
    '&:last-child': {
      marginRight: 0,
    },
  },
}))

export type HeatmapLegendItemProps = {
  color: string
}

export function HeatmapLegendItem({ color }: HeatmapLegendItemProps) {
  const classes = useHeatmapLegendItemStyles({ color })
  return <div className={classes.itemRoot} />
}

const useHeatmapLegendStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 500,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  row: {
    display: 'flex',
    maxWidth: 500,
    justifyContent: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  ticks: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  tickLeading: {
    width: 0,
    display: 'flex',
    justifyContent: 'start',
    fontSize: theme.typography.caption.fontSize,
  },
  tick: {
    width: 0,
    display: 'flex',
    justifyContent: 'center',
    fontSize: theme.typography.caption.fontSize,
  },
  tickTrailing: {
    width: 0,
    display: 'flex',
    justifyContent: 'flex-end',
    fontSize: theme.typography.caption.fontSize,
  },
}))

export type HeatmapLegendProps = {
  minClicks: number
  maxClicks: number
}

export function HeatmapLegend({ minClicks, maxClicks }: HeatmapLegendProps) {
  const theme = useTheme()
  const classes = useHeatmapLegendStyles()
  const min = minClicks
  const max = maxClicks
  const mid = (min + max) / 2
  const minmid = (min + mid) / 2
  const midmax = (mid + max) / 2
  const ticks = [min, minmid, mid, midmax, max]
  const ticksCount = 5

  const getTickStyle = (index: number, length: number) => {
    if (index === 0) {
      return classes.tickLeading
    }
    if (index >= length - 1) {
      return classes.tickTrailing
    }
    return classes.tick
  }

  return (
    <div className={classes.root}>
      <div className={classes.row}>
        <HeatmapLegendItem color={theme.palette.secondary.light} />
        <HeatmapLegendItem color={theme.palette.secondary.main} />
        <HeatmapLegendItem color={theme.palette.primary.main} />
        <HeatmapLegendItem color={theme.palette.secondary.dark} />
      </div>
      <div className={classes.ticks}>
        {ticks.map((tick, id) => {
          return (
            <div className={getTickStyle(id, ticksCount)} key={tick}>
              {compactNumberFormatter(tick)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
