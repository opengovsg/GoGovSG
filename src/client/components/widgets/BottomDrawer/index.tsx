import React, { FunctionComponent, PropsWithChildren } from 'react'
import { Drawer, createStyles, makeStyles } from '@material-ui/core'

const useStyles = makeStyles(() =>
  createStyles({
    paperRoot: {
      borderRadius: '10px 10px 0px 0px',
    },
  }),
)

type BottomDrawerProps = {
  open?: boolean
  onClose: () => void
}

const BottomDrawer: FunctionComponent<BottomDrawerProps> = ({
  open,
  children,
  onClose,
}: PropsWithChildren<BottomDrawerProps>) => {
  const classes = useStyles()
  return (
    <Drawer
      anchor="bottom"
      PaperProps={{ className: classes.paperRoot }}
      open={open}
      onClose={onClose}
    >
      {children}
    </Drawer>
  )
}

export default BottomDrawer
