import React from 'react'
import { createStyles, makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) =>
  createStyles({
    panelMargins: {
      marginLeft: theme.spacing(4),
      marginRight: theme.spacing(4),
      [theme.breakpoints.up('md')]: {
        marginLeft: 45,
        marginRight: 45,
      },
    },
  }),
)

type PanelMarginProps = {
  children: React.ReactNode
}

export default function DrawerMargin({ children }: PanelMarginProps) {
  const classes = useStyles()

  return <div className={classes.panelMargins}>{children}</div>
}
