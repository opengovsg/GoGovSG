import React from 'react'
import {
  Button,
  Divider,
  Drawer,
  Hidden,
  IconButton,
  Link,
  Typography,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'

import BackIcon from './assets/BackIcon'
import { DrawerActions } from './util/reducers'
import { useDrawerDispatch, useDrawerState } from '..'
import DrawerMargin from './DrawerMargin'
import CloseIcon from '../../../../app/components/widgets/CloseIcon'
import LinkAnalytics from './LinkAnalytics'
import LinkHistory from './LinkHistory/LinkHistory'
import LinkHistoryButton from './LinkHistory/LinkHistoryButton'
import DrawerHeader from './DrawerHeader'
import useShortLink from './util/shortlink'
import LinkInfoEditor from '../../../widgets/LinkInfoEditor'
import LinkOwnershipField from './widgets/LinkOwnershipField'
import FileEditor from './widgets/FileEditor'
import TrailingButton from './widgets/TrailingButton'
import DownloadButton from './widgets/DownloadButton'
import LinkStateText from './widgets/LinkStateText'
import LongUrlEditor from './widgets/LongUrlEditor'
import { SEARCH_PAGE } from '../../../../app/util/types'

const useStyles = makeStyles((theme) =>
  createStyles({
    backButton: {
      position: 'absolute',
      top: 0,
      right: 'auto',
      left: 0,
      margin: 45,
      padding: 0,
      backgroundColor: 'transparent',
      '&:hover': {
        backgroundColor: 'transparent',
      },
      [theme.breakpoints.down('md')]: {
        marginLeft: theme.spacing(4),
        marginRight: theme.spacing(4),
      },
    },
    backButtonText: {
      paddingLeft: 10,
    },
    drawerPaper: {
      width: '100%',
      height: '100%',
      maxWidth: theme.breakpoints.width('md'),
    },
    dialogContents: {
      marginTop: theme.spacing(9),
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
        marginTop: 80,
        marginBottom: 68,
      },
    },
    dividerAnalytics: {
      marginTop: 50,
      marginBottom: 50,
      [theme.breakpoints.up('md')]: {
        marginTop: 50,
        marginBottom: 68,
      },
    },
    dividerInformation: {
      marginTop: 50,
      marginBottom: 50,
      [theme.breakpoints.up('md')]: {
        marginTop: 73,
        marginBottom: 50,
      },
    },
    regularText: {
      fontWeight: 400,
    },
    topBar: {
      width: '100%',
      height: 110 + 33 + 33,
      /* 66 px for copy button's height and link history button */
      boxShadow: '0 0 8px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: theme.palette.background.default,
      position: 'absolute',
      top: 0,
      zIndex: -1,
    },
    textFieldsTopSpacer: {
      height: theme.spacing(1),
    },
    saveLinkInformationButtonWrapper: {
      display: 'flex',
      justifyContent: 'flex-end',
      flexDirection: 'column',
      [theme.breakpoints.up('md')]: {
        flexDirection: 'row',
        paddingTop: 9,
      },
    },
    previewButton: {
      '&:hover': {
        textDecoration: 'none',
      },
      marginBottom: theme.spacing(1),
      [theme.breakpoints.up('md')]: {
        marginRight: theme.spacing(1),
        marginBottom: 0,
      },
    },
    inactiveDesc: {
      display: 'none',
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

  // Toggle Link History
  const isHistoryToggled = drawerStates.linkHistoryIsToggled
  const toggleHistory: () => void = () =>
    modalDispatch({ type: DrawerActions.toggleLinkHistory })

  // Manage values in our text fields.
  const editedContactEmail = shortLinkState?.editedContactEmail || ''
  const editedDescription = shortLinkState?.editedDescription || ''
  const originalDescription = shortLinkState?.description || ''
  const originalContactEmail = shortLinkState?.contactEmail || ''

  const [isContactEmailValid, setContactEmailValid] = React.useState(
    Boolean(originalContactEmail),
  )
  const [isDescriptionValid, setDescriptionValid] = React.useState(
    Boolean(originalDescription),
  )

  // Disposes any current unsaved changes and closes the modal.
  const handleClose = () => {
    shortLinkDispatch?.setEditDescription(originalDescription)
    shortLinkDispatch?.setEditContactEmail(originalContactEmail)
    modalDispatch({ type: DrawerActions.closeControlPanel })
  }

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

        {!isHistoryToggled && (
          <>
            <IconButton className={classes.closeIcon} onClick={handleClose}>
              <CloseIcon />
            </IconButton>
            <DrawerMargin>
              <LinkHistoryButton clickHandler={toggleHistory} />
              <DrawerHeader title="Edit Link" />
              <LinkStateText />
              <DownloadButton />
              <Hidden smDown>
                <div className={classes.textFieldsTopSpacer} />
              </Hidden>
              <Hidden mdUp>
                <Divider className={classes.divider} />
              </Hidden>
              {shortLinkState?.isFile ? <FileEditor /> : <LongUrlEditor />}
              <Hidden mdUp>
                <Divider className={classes.divider} />
              </Hidden>
              <LinkOwnershipField closeModal={handleClose} />
              <div className={classes.inactiveDesc}>
                <Divider className={classes.dividerInformation} />
                <LinkInfoEditor
                  contactEmail={editedContactEmail}
                  description={editedDescription}
                  onContactEmailChange={(event) =>
                    shortLinkDispatch?.setEditContactEmail(event.target.value)
                  }
                  onDescriptionChange={(event) =>
                    shortLinkDispatch?.setEditDescription(
                      event.target.value.replace(/(\r\n|\n|\r)/gm, ''),
                    )
                  }
                  onContactEmailValidation={setContactEmailValid}
                  onDescriptionValidation={setDescriptionValid}
                />
                <div className={classes.saveLinkInformationButtonWrapper}>
                  <Link
                    target="_blank"
                    href={
                      isDescriptionValid &&
                      isContactEmailValid &&
                      editedDescription
                        ? `/#${SEARCH_PAGE}`
                        : undefined
                    }
                    className={classes.previewButton}
                  >
                    <TrailingButton
                      disabled={
                        !originalDescription ||
                        originalDescription !== editedDescription
                      }
                      fullWidth={isMobileView}
                      variant="outlined"
                    >
                      Preview
                    </TrailingButton>
                  </Link>
                  <TrailingButton
                    disabled={
                      !isDescriptionValid ||
                      (editedContactEmail === originalContactEmail &&
                        editedDescription === originalDescription) ||
                      !isContactEmailValid
                    }
                    fullWidth={isMobileView}
                    variant={isMobileView ? 'contained' : 'outlined'}
                    onClick={shortLinkDispatch?.applyEditInformation}
                  >
                    Save
                  </TrailingButton>
                </div>
              </div>
              <Divider className={classes.dividerAnalytics} />
              <LinkAnalytics />
            </DrawerMargin>
          </>
        )}

        {isHistoryToggled && (
          <>
            <Button
              className={classes.backButton}
              onClick={toggleHistory}
              size="large"
              variant="text"
              color="primary"
            >
              <BackIcon color={theme.palette.primary.main} />
              <Typography variant="h6" className={classes.backButtonText}>
                Back to Edit link
              </Typography>
            </Button>
            <DrawerMargin>
              <DrawerHeader title="Link History" />
              <LinkHistory />
            </DrawerMargin>
          </>
        )}
      </main>
    </Drawer>
  )
}
