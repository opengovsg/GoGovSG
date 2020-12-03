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
    marginBottom: 2,
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 11,
    marginRight: 5,
    backgroundColor: (props: StyleProps) => props.dotColor,
  },
  label: {
    fontSize: 12,
  },
}))

export type DeviceLegendProps = {
  className?: string
  dotColor: string
  label: string
  percent: number
}

export default function DeviceLegend({
  className,
  dotColor,
  label,
  percent,
}: DeviceLegendProps) {
  const classes = useStyles({ dotColor })
  return (
    <div className={className}>
      <div className={classes.topRow}>
        <div className={classes.dot} />
        <Typography color="primary" className={classes.label}>
          {label}
        </Typography>
      </div>
      <Typography color="primary" variant="h5">
        {percent}%
      </Typography>
    </div>
  )
}
