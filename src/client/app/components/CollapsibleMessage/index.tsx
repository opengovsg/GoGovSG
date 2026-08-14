import React, { FunctionComponent, PropsWithChildren } from 'react'
import { Collapse } from '@mui/material'
import useStyles from './styles'
import { CollapsibleMessagePosition, CollapsibleMessageProps } from './types'

const CollapsibleMessage: FunctionComponent<CollapsibleMessageProps> = ({
  type,
  visible,
  children,
  timeout,
  position = CollapsibleMessagePosition.Static,
}: PropsWithChildren<CollapsibleMessageProps>) => {
  const classes = useStyles({ type, position })
  return (
    <Collapse className={classes.root} in={visible} timeout={timeout}>
      <div className={classes.message}>{children}</div>
    </Collapse>
  )
}

export default CollapsibleMessage
