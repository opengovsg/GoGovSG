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

const useHeatmapLegendStyles = makeStyles(() => ({
  root: {
    width: '100%',
    maxWidth: 500,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
  },
  ticks: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: 4,
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
  return (
    <div className={classes.root}>
      <div className={classes.row}>
        <HeatmapLegendItem color={'#CDDCE0'} />
        <HeatmapLegendItem color={'#8CA6AD'} />
        <HeatmapLegendItem color={'#456682'} />
        <HeatmapLegendItem color={'#2F4B62'} />
      </div>
      <div className={classes.ticks}>
        {ticks.map((tick) => (
          <div>{compactNumberFormatter(tick)}</div>
        ))}
      </div>
    </div>
  )
}
