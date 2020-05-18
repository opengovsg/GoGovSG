import React from 'react'
import { createStyles, makeStyles } from '@material-ui/core'

const useStyles = makeStyles(() =>
  createStyles({
    panelMargins: {
      marginLeft: 45,
      marginRight: 45,
    },
  }),
)

type PanelMarginProps = {
  children: React.ReactNode
}

export default function PanelMargin({ children }: PanelMarginProps) {
  const classes = useStyles()

  return <div className={classes.panelMargins}>{children}</div>
}
