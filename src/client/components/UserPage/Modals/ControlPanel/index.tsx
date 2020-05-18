import React from 'react'
import { Dialog, createStyles, makeStyles, Divider } from '@material-ui/core'

import ModalActions from '../util/reducers'
import { useModalState, useModalDispatch } from '..'
import PanelMargin from './PanelMargin'
import closeIcon from './assets/close-icon.svg'
import LinkAnalytics from './LinkAnalytics'
import DialogHeader from './DialogHeader'

const useDialogOverrideStyles = makeStyles(() =>
  createStyles({
    dialogPaper: {
      height: '100%',
      width: '100%',
      borderRadius: 'unset',
      marginLeft: 'auto',
      marginRight: 0,
    },
    dialogPaperScrollPaper: {
      display: 'flex',
      maxHeight: 'unset',
      flexDirection: 'column',
    },
  }),
)

const useStyles = makeStyles(() =>
  createStyles({
    closeIcon: {
      position: 'absolute',
      top: 0,
      left: 0,
      margin: 30,
    },
    divider: {
      marginTop: 21,
      marginBottom: 68,
    },
  }),
)

export default function ControlPanel() {
  const overrideClasses = useDialogOverrideStyles()
  const classes = useStyles()
  const modalStates = useModalState()
  const modalDispatch = useModalDispatch()
  const dialogIsOpen = modalStates.controlPanelIsOpen
  const handleClose = () =>
    modalDispatch({ type: ModalActions.closeControlPanel })

  return (
    <Dialog
      classes={{
        paper: overrideClasses.dialogPaper,
        paperScrollPaper: overrideClasses.dialogPaperScrollPaper,
      }}
      aria-labelledby="createUrlModal"
      aria-describedby="create-links"
      fullWidth={true}
      maxWidth="md"
      open={dialogIsOpen}
      onClose={handleClose}
    >
      <img
        className={classes.closeIcon}
        src={closeIcon}
        alt="Close"
        draggable={false}
      />
      <PanelMargin>
        <DialogHeader />
        <Divider className={classes.divider} />
        <LinkAnalytics />
      </PanelMargin>
    </Dialog>
  )
}
