import React from 'react'
import makeStyles from '@mui/styles/makeStyles'
import Tooltip from '@mui/material/Tooltip'

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

function FlexibleBar({ label, count, color }: FlexibleBarProps) {
  const classes = useStyles({ count, color })
  return (
    <Tooltip title={label} placement="top" arrow>
      <div className={classes.root} />
    </Tooltip>
  )
}

export default FlexibleBar
