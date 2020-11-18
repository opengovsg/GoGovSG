import React, { FunctionComponent } from 'react'
import { createStyles, makeStyles } from '@material-ui/core'
import { ApplyAppMargins } from '../../../app/components/AppMargins'
import useFullScreenDialog from '../../helpers/fullScreenDialog'

type StyleProps = {
  applyLeftMargin?: boolean,
  applyRightMargin?: boolean,
}

const useStyles = makeStyles((theme) =>
  createStyles({
    modalMargins: {
      marginLeft: (props: StyleProps) => (props.applyLeftMargin ? theme.spacing(6.25) : 0),
      marginRight: (props: StyleProps) =>
        props.applyRightMargin ? theme.spacing(6.25) : 0,
    },
  }),
)

type ModalMarginsProps = {
  applyLeftMargin?: boolean,
  applyRightMargin?: boolean
}

const ModalMargins: FunctionComponent<ModalMarginsProps> = ({
  applyLeftMargin,
  applyRightMargin,
  children,
}) => {
  const classes = useStyles({ applyLeftMargin, applyRightMargin })
  const isFullScreenDialog = useFullScreenDialog()

  // Use app margins in full screen dialogs.
  if (isFullScreenDialog) {
    return <ApplyAppMargins>{children}</ApplyAppMargins>
  }
  return <div className={classes.modalMargins}>{children}</div>
}

ModalMargins.defaultProps = {
  applyLeftMargin: true,
  applyRightMargin: true,
}

export default ModalMargins