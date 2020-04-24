import React from 'react'
import classNames from 'classnames'
import { createStyles, makeStyles } from '@material-ui/core'

function fetchAppMargins(theme, multiplier) {
  return {
    marginLeft: theme.spacing(4 * multiplier),
    marginRight: theme.spacing(4 * multiplier),
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(6 * multiplier),
      marginRight: theme.spacing(6 * multiplier),
    },
    [theme.breakpoints.up('md')]: {
      marginLeft: theme.spacing(8 * multiplier),
      marginRight: theme.spacing(8 * multiplier),
    },
    [theme.breakpoints.up('lg')]: {
      marginLeft: theme.spacing(12 * multiplier),
      marginRight: theme.spacing(12 * multiplier),
    },
  }
}

const useStyles = makeStyles((theme) =>
  createStyles({
    applyAppMarginsContainer: {
      ...fetchAppMargins(theme, 1),
    },
    ignoreAppMarginsContainer: {
      ...fetchAppMargins(theme, -1),
    },
    layout: {
      flexGrow: 1,
    },
  }),
)

export const ApplyAppMargins = ({ className, children }) => {
  const classes = useStyles()
  return (
    <div className={classNames(className, classes.applyAppMarginsContainer)}>
      {children}
    </div>
  )
}

export const IgnoreAppMargins = ({ className, children }) => {
  const classes = useStyles()
  return (
    <div className={classNames(className, classes.ignoreAppMarginsContainer)}>
      {children}
    </div>
  )
}
