import React from 'react'
import { Dialog, Typography, createStyles, makeStyles } from '@material-ui/core'
import ModalMargins from '../ModalMargins'
import ModalActions from '../util/reducers'
import { useModalState, useModalDispatch } from '..'

const useDialogOverrideStyles = makeStyles(() =>
  createStyles({
    dialogPaper: {
      height: '100%',
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
    dialogTitle: {
      marginTop: 116,
      marginBottom: 44,
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
      <ModalMargins>
        <Typography
          className={classes.dialogTitle}
          variant="h2"
          color="primary"
        >
          Edit link
        </Typography>
      </ModalMargins>
    </Dialog>
  )
}
