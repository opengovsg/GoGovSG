import React, { useState } from 'react'
import {
  Drawer,
  createStyles,
  makeStyles,
  Hidden,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@material-ui/core'

import DrawerActions from './helpers/reducers'
import { useDrawerState, useDrawerDispatch } from '..'
import DrawerMargin from './DrawerMargin'
import closeIcon from '~/assets/icons/close-icon.svg'
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
import helpIcon from '../../../../assets/help-icon.svg'

const useStyles = makeStyles((theme) =>
  createStyles({
    drawerPaper: {
      width: '100%',
      maxWidth: 885,
    },
    dialogContents: {
      marginTop: theme.spacing(6.5),
      marginBottom: 141,
      [theme.breakpoints.up('md')]: {
        marginTop: 116,
      },
    },
    closeIcon: {
      position: 'absolute',
      top: 0,
      right: theme.spacing(0),
      left: 'auto',
      margin: theme.spacing(2),
      [theme.breakpoints.up('md')]: {
        left: 0,
        margin: 30,
        right: 'auto',
      },
    },
    divider: {
      marginTop: 50,
      marginBottom: 50,
      [theme.breakpoints.up('md')]: {
        marginTop: 51,
        marginBottom: 68,
      },
    },
    activeText: {
      color: '#6d9067',
    },
    inactiveText: {
      color: '#c85151',
    },
    regularText: {
      fontWeight: 400,
    },
    ownershipHelpIcon: {
      width: '14px',
      verticalAlign: 'middle',
    },
    ownershipTooltip: {
      margin: theme.spacing(1.5, 1, 1.5, 1),
      whiteSpace: 'nowrap',
      maxWidth: 'unset',
    },
    topBar: {
      width: '100%',
      height: '100px',
      boxShadow: '0 0 8px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: '#f9f9f9',
      position: 'absolute',
      top: 0,
      zIndex: -1,
    },
  }),
)

export default function ControlPanel() {
  // Styles used in this component.
  const classes = useStyles()
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))

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

  const stateTitleActive = (
    <>
      Your link is <span className={classes.activeText}>active</span> and
      publicly accessible
    </>
  )

  const stateTitleInactive = (
    <>
      Your link is <span className={classes.inactiveText}>inactive</span> and
      not publicly accessible
    </>
  )

  const linkOwnershipHelp = (
    <>
      Link owner{' '}
      <Tooltip
        title="Links can only be transferred to an existing Go.gov.sg user"
        arrow
        placement="top"
        classes={{ tooltip: classes.ownershipTooltip }}
      >
        <img
          className={classes.ownershipHelpIcon}
          src={helpIcon}
          alt="Ownership help"
          draggable={false}
        />
      </Tooltip>
    </>
  )

  return (
    <Drawer
      classes={{
        paper: classes.drawerPaper,
      }}
      anchor={isMobileView ? 'bottom' : 'right'}
      open={drawerIsOpen}
      onClose={handleClose}
    >
      <main className={classes.dialogContents}>
        <Hidden mdUp>
          <div className={classes.topBar} />
        </Hidden>
        <IconButton className={classes.closeIcon} onClick={handleClose}>
          <img src={closeIcon} alt="Close" draggable={false} />
        </IconButton>
        <DrawerMargin>
          <DrawerHeader />
          <ConfigOption
            title={
              shortLinkState?.state === 'ACTIVE'
                ? stateTitleActive
                : stateTitleInactive
            }
            titleVariant="h6"
            titleClassName={isMobileView ? classes.regularText : ''}
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
            title="Download QR Code"
            titleVariant="h6"
            titleClassName={isMobileView ? classes.regularText : ''}
            trailing={<DownloadButton />}
            trailingPosition={TrailingPosition.end}
          />

          {shortLinkState?.isFile && (
            <>
              <Hidden mdUp>
                <Divider className={classes.divider} />
              </Hidden>
              <ConfigOption
                title="Original link"
                titleVariant="body2"
                titleClassName={classes.regularText}
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
                    fullWidth={isMobileView}
                    variant={isMobileView ? 'contained' : 'outlined'}
                  >
                    Save
                  </TrailingButton>
                }
                wrapTrailing={isMobileView}
                trailingPosition={TrailingPosition.end}
              />
            </>
          )}
          <Hidden mdUp>
            <Divider className={classes.divider} />
          </Hidden>
          <ConfigOption
            title={linkOwnershipHelp}
            titleVariant="body2"
            titleClassName={classes.regularText}
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
                variant={isMobileView ? 'contained' : 'outlined'}
                fullWidth={isMobileView}
              >
                Transfer
              </TrailingButton>
            }
            wrapTrailing={isMobileView}
            trailingPosition={TrailingPosition.end}
          />
          <Divider className={classes.divider} />
          <LinkAnalytics />
        </DrawerMargin>
      </main>
    </Drawer>
  )
}
