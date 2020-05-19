import React from 'react'
import {
  Drawer,
  createStyles,
  makeStyles,
  Divider,
  IconButton,
} from '@material-ui/core'

import ModalActions from './store/reducers'
import { useModalState, useModalDispatch } from '..'
import PanelMargin from './PanelMargin'
import closeIcon from './assets/close-icon.svg'
import LinkAnalytics from './LinkAnalytics'
import DialogHeader from './DialogHeader'
import ConfigOption, { TrailingPosition } from './widgets/ConfigOption'
import PanelTextField from './PanelTextField'
import TrailingButton from './TrailingButton'
import GoSwitch from './assets/GoSwitch'
import useShortLink from './helpers/shortlink'

const useStyles = makeStyles(() =>
  createStyles({
    drawerPaper: {
      width: '60%',
      maxWidth: 885,
    },
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
  // Styles used in this component.
  const classes = useStyles()

  // Modal controller.
  const modalStates = useModalState()
  const drawerIsOpen = modalStates.controlPanelIsOpen
  const modalDispatch = useModalDispatch()
  const handleClose = () =>
    modalDispatch({ type: ModalActions.closeControlPanel })

  // Fetch short link state and dispatches from redux store through our helper hook.
  const [drawerState, drawerDispatch] = useShortLink(
    modalStates.relevantShortLink!,
  )

  return (
    <Drawer
      classes={{
        paper: classes.drawerPaper,
      }}
      anchor="right"
      open={drawerIsOpen}
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
              <GoSwitch
                color="primary"
                checked={drawerState?.state === 'ACTIVE'}
                onChange={drawerDispatch?.toggleStatus}
              />
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
                value={drawerState?.longUrl || ''}
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
    </Drawer>
  )
}
