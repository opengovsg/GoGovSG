import React from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { compactNumberFormatter } from '../../../../../../../../client/util/format'

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

export function HeatmapLegendItem(props: HeatmapLegendItemProps) {
  const classes = useHeatmapLegendItemStyles({ color: props.color })
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

export function HeatmapLegend(props: HeatmapLegendProps) {
  const classes = useHeatmapLegendStyles()
  const min = props.minClicks
  const max = props.maxClicks
  const mid = (min + max) / 2
  const minmid = (min + mid) / 2
  const midmax = (mid + max) / 2
  const ticks = [min, minmid, mid, midmax, max]
  const ticksCount = 5

  const getTickStyle = (index: number, length: number) => {
    if (index == 0) {
      return classes.tickLeading
    } else if (index >= length - 1) {
      return classes.tickTrailing
    }
    return classes.tick
  }

  return (
    <div className={classes.root}>
      <div className={classes.row}>
        <HeatmapLegendItem color={'#CDDCE0'} />
        <HeatmapLegendItem color={'#8CA6AD'} />
        <HeatmapLegendItem color={'#456682'} />
        <HeatmapLegendItem color={'#2F4B62'} />
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
