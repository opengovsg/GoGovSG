import React from 'react'
import { createStyles, makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) =>
  createStyles({
    panelMargins: {
      marginLeft: 45,
      marginRight: 45,
      [theme.breakpoints.down('sm')]: {
        marginLeft: theme.spacing(4),
        marginRight: theme.spacing(4),
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
