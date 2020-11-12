import React from 'react'
import PropTypes from 'prop-types'
import { createStyles, makeStyles } from '@material-ui/core'

import { ApplyAppMargins } from '../../../app/components/AppMargins'
import useFullScreenDialog from '../../helpers/fullScreenDialog'

const useStyles = makeStyles((theme) =>
  createStyles({
    modalMargins: {
      marginLeft: (props) => (props.applyLeftMargin ? theme.spacing(6.25) : 0),
      marginRight: (props) =>
        props.applyRightMargin ? theme.spacing(6.25) : 0,
    },
  }),
)

export default function ModalMargins({
  children,
  applyLeftMargin,
  applyRightMargin,
}) {
  const classes = useStyles({ applyLeftMargin, applyRightMargin })
  const isFullScreenDialog = useFullScreenDialog()

  // Use app margins in full screen dialogs.
  if (isFullScreenDialog) {
    return <ApplyAppMargins>{children}</ApplyAppMargins>
  }
  return <div className={classes.modalMargins}>{children}</div>
}

ModalMargins.propTypes = {
  children: PropTypes.node.isRequired,
  applyLeftMargin: PropTypes.bool,
  applyRightMargin: PropTypes.bool,
}

ModalMargins.defaultProps = {
  applyLeftMargin: true,
  applyRightMargin: true,
}
