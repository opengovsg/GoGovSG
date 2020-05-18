import React from 'react'
import classNames from 'classnames'
import { createStyles, makeStyles } from '@material-ui/core'

import useAppMargins from './useAppMargins'

const useStyles = makeStyles(() =>
  createStyles({
    applyAppMarginsContainer: {
      marginLeft: (props) => props.appMargins,
      marginRight: (props) => props.appMargins,
    },
    ignoreAppMarginsContainer: {
      marginLeft: (props) => -props.appMargins,
      marginRight: (props) => -props.appMargins,
    },
    ignoreAppRightMarginsContainer: {
      marginLeft: 0,
      marginRight: (props) => -props.appMargins,
    },
    layout: {
      flexGrow: 1,
    },
  }),
)

export const ApplyAppMargins = ({ className, children }) => {
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })
  return (
    <div className={classNames(className, classes.applyAppMarginsContainer)}>
      {children}
    </div>
  )
}

export const IgnoreAppMargins = ({ className, children }) => {
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })
  return (
    <div className={classNames(className, classes.ignoreAppMarginsContainer)}>
      {children}
    </div>
  )
}

export const IgnoreAppRightMargins = ({ className, children }) => {
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })
  return (
    <div
      className={classNames(className, classes.ignoreAppRightMarginsContainer)}
    >
      {children}
    </div>
  )
}
