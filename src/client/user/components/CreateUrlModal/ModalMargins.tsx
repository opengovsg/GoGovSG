import React, { FunctionComponent } from 'react'
import { createStyles, makeStyles } from '@material-ui/core'
import { ApplyAppMargins } from '../../../app/components/AppMargins'
import useFullScreenDialog from '../../helpers/fullScreenDialog'

type StyleProps = {
  applyRightMargin?: boolean
}

const useStyles = makeStyles((theme) =>
  createStyles({
    modalMargins: {
      marginLeft: theme.spacing(6.25),
      marginRight: (props: StyleProps) =>
        props.applyRightMargin ? theme.spacing(6.25) : 0,
    },
  }),
)

type ModalMarginsProps = {
  applyRightMargin?: boolean
}

const ModalMargins: FunctionComponent<ModalMarginsProps> = ({
  applyRightMargin,
  children,
}) => {
  const classes = useStyles({ applyRightMargin })
  const isFullScreenDialog = useFullScreenDialog()

  // Use app margins in full screen dialogs.
  if (isFullScreenDialog) {
    return <ApplyAppMargins>{children}</ApplyAppMargins>
  }
  return <div className={classes.modalMargins}>{children}</div>
}

ModalMargins.defaultProps = {
  applyRightMargin: true,
}

export default ModalMargins
