import React from 'react'
import classNames from 'classnames'
import { createStyles, makeStyles } from '@material-ui/core'

import useAppMargins from './appMargins'

type styleProps = {
  appMargins: number
}

const useStyles = makeStyles(() =>
  createStyles({
    applyAppMarginsContainer: {
      marginLeft: (props: styleProps) => props.appMargins,
      marginRight: (props: styleProps) => props.appMargins,
    },
    ignoreAppMarginsContainer: {
      marginLeft: (props: styleProps) => -props.appMargins,
      marginRight: (props: styleProps) => -props.appMargins,
    },
    ignoreAppRightMarginsContainer: {
      marginLeft: 0,
      marginRight: (props: styleProps) => -props.appMargins,
    },
    layout: {
      flexGrow: 1,
    },
  }),
)

type AppMarginsProps = {
  className?: string
  children: React.ReactElement
}

export const ApplyAppMargins = ({ className, children }: AppMarginsProps) => {
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })
  return (
    <div className={classNames(className, classes.applyAppMarginsContainer)}>
      {children}
    </div>
  )
}

export const IgnoreAppMargins = ({ className, children }: AppMarginsProps) => {
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })
  return (
    <div className={classNames(className, classes.ignoreAppMarginsContainer)}>
      {children}
    </div>
  )
}

export const IgnoreAppRightMargins = ({
  className,
  children,
}: AppMarginsProps) => {
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
