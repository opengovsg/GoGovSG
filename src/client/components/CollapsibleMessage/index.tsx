import React, { FunctionComponent } from 'react'
import { Collapse } from '@material-ui/core'
import useStyles from './styles'
import { CollapsibleMessageProps, CollapsibleMessagePosition } from './types'

const CollapsibleMessage: FunctionComponent<CollapsibleMessageProps> = ({
  type,
  visible,
  children,
  position = CollapsibleMessagePosition.Static,
}) => {
  const classes = useStyles({ type, position })
  return (
    <Collapse className={classes.root} in={visible}>
      <div className={classes.message}>{children}</div>
    </Collapse>
  )
}

export default CollapsibleMessage
