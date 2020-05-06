import React from 'react'
import classNames from 'classnames'
import { createStyles, makeStyles } from '@material-ui/core'

export function fetchAppMargins(theme, leftMultiplier, rightMultiplier) {
  return {
    marginLeft: theme.spacing(4 * leftMultiplier),
    marginRight: theme.spacing(4 * rightMultiplier),
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(8 * leftMultiplier),
      marginRight: theme.spacing(8 * rightMultiplier),
    },
    [theme.breakpoints.up('md')]: {
      marginLeft: theme.spacing(12 * leftMultiplier),
      marginRight: theme.spacing(12 * rightMultiplier),
    },
    [theme.breakpoints.up('lg')]: {
      marginLeft: theme.spacing(16 * leftMultiplier),
      marginRight: theme.spacing(16 * rightMultiplier),
    },
  }
}

const useStyles = makeStyles((theme) =>
  createStyles({
    applyAppMarginsContainer: {
      ...fetchAppMargins(theme, 1, 1),
    },
    ignoreAppMarginsContainer: {
      ...fetchAppMargins(theme, -1, -1),
    },
    ignoreAppRightMarginsContainer: {
      ...fetchAppMargins(theme, 0, -1),
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

export const IgnoreAppRightMargins = ({ className, children }) => {
  const classes = useStyles()
  return (
    <div
      className={classNames(className, classes.ignoreAppRightMarginsContainer)}
    >
      {children}
    </div>
  )
}
