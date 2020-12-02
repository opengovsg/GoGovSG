import React from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'
import Tooltip from '@material-ui/core/Tooltip'

type StylesProps = {
  count: number
  color: string
}

const useStyles = makeStyles(() => ({
  root: {
    height: '100%',
    flex: (props: StylesProps) => props.count,
    backgroundColor: (props: StylesProps) => props.color,
  },
}))

export type FlexibleBarProps = {
  label: string
  count: number
  color: string
}

const FlexibleBar = ({ label, count, color }: FlexibleBarProps) => {
  const classes = useStyles({ count, color })
  return (
    <Tooltip title={label} placement="top" arrow>
      <div className={classes.root} />
    </Tooltip>
  )
}

export default FlexibleBar
