import React, { useState } from 'react'
import {
  Drawer,
  createStyles,
  makeStyles,
  Divider,
  IconButton,
} from '@material-ui/core'

import DrawerActions from './helpers/reducers'
import { useDrawerState, useDrawerDispatch } from '..'
import DrawerMargin from './DrawerMargin'
import closeIcon from './assets/close-icon.svg'
import LinkAnalytics from './LinkAnalytics'
import DrawerHeader from './DrawerHeader'
import ConfigOption, { TrailingPosition } from './widgets/ConfigOption'
import DrawerTextField from './widgets/DrawerTextField'
import TrailingButton from './widgets/TrailingButton'
import GoSwitch from './assets/GoSwitch'
import useShortLink from './helpers/shortlink'
import { removeHttpsProtocol } from '../../../../util/url'
import { isValidLongUrl } from '../../../../../shared/util/validation'
import DownloadButton from './widgets/DownloadButton'

const useStyles = makeStyles(() =>
  createStyles({
    drawerPaper: {
      width: '100%',
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
  const drawerStates = useDrawerState()
  const drawerIsOpen = drawerStates.controlPanelIsOpen
  const modalDispatch = useDrawerDispatch()

  // Fetch short link state and dispatches from redux store through our helper hook.
  const { shortLinkState, shortLinkDispatch } = useShortLink(
    drawerStates.relevantShortLink!,
  )

  // Manage values in our text fields.
  const originalLongUrl = removeHttpsProtocol(shortLinkState?.longUrl || '')
  const editedLongUrl = shortLinkState?.editedLongUrl || ''
  const [pendingOwner, setPendingOwner] = useState<string>('')

  // Disposes any current unsaved changes and closes the modal.
  const handleClose = () => {
    shortLinkDispatch?.setEditLongUrl(originalLongUrl)
    setPendingOwner('')
    modalDispatch({ type: DrawerActions.closeControlPanel })
  }

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
        <DrawerMargin>
          <DrawerHeader />
          <ConfigOption
            title="Link status"
            subtitle="Analytics will not be collected for deactivated links"
            trailing={
              <GoSwitch
                color="primary"
                checked={shortLinkState?.state === 'ACTIVE'}
                onChange={shortLinkDispatch?.toggleStatus}
              />
            }
            trailingPosition={TrailingPosition.center}
          />
          <ConfigOption
            title="QR Code"
            subtitle="Download your link’s QR Code in PNG or SVG format"
            trailing={<DownloadButton />}
            trailingPosition={TrailingPosition.end}
          />
          <ConfigOption
            title="Original link"
            leading={
              <DrawerTextField
                value={editedLongUrl}
                onChange={(event) =>
                  shortLinkDispatch?.setEditLongUrl(event.target.value)
                }
                placeholder="Original link"
                prefix="https://"
                error={!isValidLongUrl(editedLongUrl, true)}
                helperText={
                  isValidLongUrl(editedLongUrl, true)
                    ? ' '
                    : "This doesn't look like a valid url."
                }
              />
            }
            trailing={
              <TrailingButton
                disabled={
                  !isValidLongUrl(editedLongUrl, false) ||
                  editedLongUrl === originalLongUrl
                }
                onClick={() =>
                  shortLinkDispatch?.applyEditLongUrl(editedLongUrl)
                }
              >
                Save
              </TrailingButton>
            }
            trailingPosition={TrailingPosition.end}
          />
          <ConfigOption
            title="Link ownership"
            subtitle="A Go.gov.sg link can only be transferred to an existing user"
            leading={
              <DrawerTextField
                value={pendingOwner}
                onChange={(event) => setPendingOwner(event.target.value)}
                placeholder="Email of link recipient"
                helperText={' '}
              />
            }
            trailing={
              <TrailingButton
                onClick={() => {
                  shortLinkDispatch?.applyNewOwner(pendingOwner, handleClose)
                }}
                disabled={!pendingOwner}
              >
                Transfer
              </TrailingButton>
            }
            trailingPosition={TrailingPosition.end}
          />
          <Divider className={classes.divider} />
          <LinkAnalytics />
        </DrawerMargin>
      </main>
    </Drawer>
  )
}
