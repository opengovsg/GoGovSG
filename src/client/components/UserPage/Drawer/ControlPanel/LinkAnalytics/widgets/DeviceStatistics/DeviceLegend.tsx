import React from 'react'
import Typography from '@material-ui/core/Typography'
import makeStyles from '@material-ui/core/styles/makeStyles'

type StyleProps = {
  dotColor: string
}

const useStyles = makeStyles(() => ({
  topRow: {
    display: 'flex',
    alignItems: 'center',
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 11,
    marginRight: 5,
    backgroundColor: (props: StyleProps) => props.dotColor,
  },
  label: {
    fontSize: 10,
  },
}))

export type DeviceLegendProps = {
  className?: string
  dotColor: string
  label: string
  percent: number
}

export default function DeviceLegend(props: DeviceLegendProps) {
  const classes = useStyles({ dotColor: props.dotColor })
  return (
    <div className={props.className}>
      <div className={classes.topRow}>
        <div className={classes.dot} />
        <Typography color="primary" className={classes.label}>
          {props.label}
        </Typography>
      </div>
      <Typography color="primary" variant="h5">
        {props.percent}%
      </Typography>
    </div>
  )
}
