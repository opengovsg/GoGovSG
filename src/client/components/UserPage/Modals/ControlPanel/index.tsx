import React from 'react'
import {
  Dialog,
  createStyles,
  makeStyles,
  Divider,
  IconButton,
} from '@material-ui/core'

import ModalActions from '../util/reducers'
import { useModalState, useModalDispatch } from '..'
import PanelMargin from './PanelMargin'
import closeIcon from './assets/close-icon.svg'
import LinkAnalytics from './LinkAnalytics'
import DialogHeader from './DialogHeader'
import ConfigOption, { TrailingPosition } from './ConfigOption'
import PanelTextField from './PanelTextField'
import TrailingButton from './TrailingButton'
import GoSwitch from './assets/GoSwitch'

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
    dialogContents: {
      marginTop: 116,
      marginBottom: 141,
    },
    closeIcon: {
      position: 'absolute',
      top: 0,
      left: 0,
      margin: 30,
    },
    trailingButton: {
      width: 135,
      height: 44,
    },
    divider: {
      marginTop: 51,
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
      fullWidth={true}
      maxWidth="md"
      open={dialogIsOpen}
      onClose={handleClose}
    >
      <main className={classes.dialogContents}>
        <IconButton className={classes.closeIcon} onClick={handleClose}>
          <img src={closeIcon} alt="Close" draggable={false} />
        </IconButton>
        <PanelMargin>
          <DialogHeader />
          <ConfigOption
            title="Link status"
            subtitle="Analytics will not be collected for deactivated links"
            trailing={
              <GoSwitch color="primary" />
            }
            trailingPosition={TrailingPosition.center}
          />
          <ConfigOption
            title="QR Code"
            subtitle="Download your link’s QR Code in PNG or SVG format"
            trailing={
              <TrailingButton onClick={() => {}}>Download</TrailingButton>
            }
            trailingPosition={TrailingPosition.end}
          />
          <ConfigOption
            title="Original link"
            leading={
              <PanelTextField
                value=""
                onChange={() => {}}
                placeholder="Original link"
                prefix="https://"
              />
            }
            trailing={<TrailingButton onClick={() => {}}>Save</TrailingButton>}
            trailingPosition={TrailingPosition.end}
          />
          <ConfigOption
            title="Link ownership"
            subtitle="A Go.gov.sg link can only be transferred to an existing user"
            leading={
              <PanelTextField
                value=""
                onChange={() => {}}
                placeholder="Email of link recipient"
              />
            }
            trailing={
              <TrailingButton onClick={() => {}}>Transfer</TrailingButton>
            }
            trailingPosition={TrailingPosition.end}
          />
          <Divider className={classes.divider} />
          <LinkAnalytics />
        </PanelMargin>
      </main>
    </Dialog>
  )
}
