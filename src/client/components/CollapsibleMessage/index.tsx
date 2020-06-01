import React, { FunctionComponent } from 'react'
import { Collapse } from '@material-ui/core'
import useStyles from './styles'
import { CollapsibleMessageProps } from './types'

const CollapsibleMessage: FunctionComponent<CollapsibleMessageProps> = ({
  type,
  visible,
  children,
}) => {
  const classes = useStyles({ type })
  return (
    <Collapse className={classes.root} in={visible}>
      <div className={classes.message}>{children}</div>
    </Collapse>
  )
}

export default CollapsibleMessage
