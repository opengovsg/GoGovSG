import React, { FunctionComponent } from 'react'
import {
  Divider,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import { ApplyAppMargins } from '../../AppMargins'
import useAppMargins from '../../AppMargins/appMargins'
import BottomDrawer from '../../widgets/BottomDrawer'
import SortPanel from '../../widgets/SortPanel'

type SortDrawerProps = {
  open: boolean
  onClose: () => void
  selectedOrder: string
  options: Array<{ key: string; label: string }>
  onChoose: (orderBy: string) => void
}

// type SortDrawerStyleProps = {}

const useStyles = makeStyles((theme) =>
  createStyles({
    titleText: {
      marginTop: theme.spacing(4),
    },
    divider: {
      marginTop: theme.spacing(1.5),
      marginBottom: theme.spacing(0.5),
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: theme.spacing(3.5),
    },
  }),
)

const SortDrawer: FunctionComponent<SortDrawerProps> = ({
  open,
  onClose,
  selectedOrder,
  options,
  onChoose,
}: SortDrawerProps) => {
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })
  return (
    <BottomDrawer open={open} onClose={onClose}>
      <div className={classes.content}>
        <ApplyAppMargins>
          <Typography
            variant="h5"
            color="primary"
            className={classes.titleText}
          >
            Sort by
          </Typography>
        </ApplyAppMargins>
        <Divider className={classes.divider} />
        <SortPanel
          onChoose={onChoose}
          currentlyChosen={selectedOrder}
          options={options}
          noHeader
        />
      </div>
    </BottomDrawer>
  )
}

export default SortDrawer
