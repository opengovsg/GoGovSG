import React from 'react'
import { Dialog } from '@material-ui/core'
import useFullScreenDialog from '../util/useFullScreenDialog'
import ModalMargins from '../ModalMargins'
import ModalActions from '../util/reducers'
import { useModalState, useModalDispatch } from '..'

export default function ControlPanel() {
  const isFullScreenDialog = useFullScreenDialog()
  const modalStates = useModalState()
  const modalDispatch = useModalDispatch()
  const dialogIsOpen = modalStates.controlPanelIsOpen
  const handleClose = () =>
    modalDispatch({ type: ModalActions.closeControlPanel })

  return (
    <Dialog
      aria-labelledby="createUrlModal"
      aria-describedby="create-links"
      fullScreen={isFullScreenDialog}
      fullWidth={!isFullScreenDialog}
      maxWidth="sm"
      open={dialogIsOpen}
      onClose={handleClose}
    >
      <ModalMargins>Hello</ModalMargins>
    </Dialog>
  )
}
