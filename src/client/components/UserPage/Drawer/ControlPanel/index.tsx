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
  CircularProgress,
  Typography,
} from '@material-ui/core'

import DrawerActions from './util/reducers'
import { useDrawerState, useDrawerDispatch } from '..'
import DrawerMargin from './DrawerMargin'
import CloseIcon from '../../../widgets/CloseIcon'
import LinkAnalytics from './LinkAnalytics'
import DrawerHeader from './DrawerHeader'
import ConfigOption, { TrailingPosition } from './widgets/ConfigOption'
import DrawerTextField from './widgets/DrawerTextField'
import TrailingButton from './widgets/TrailingButton'
import GoSwitch from './widgets/GoSwitch'
import useShortLink from './util/shortlink'
import { removeHttpsProtocol } from '../../../../util/url'
import {
  isValidLongUrl,
  isPrintableAscii,
} from '../../../../../shared/util/validation'
import DownloadButton from './widgets/DownloadButton'
import helpIcon from '../../../../assets/help-icon.svg'
import FileInputField from '../../Widgets/FileInputField'
import CollapsibleMessage from '../../../CollapsibleMessage'
import {
  CollapsibleMessageType,
  CollapsibleMessagePosition,
} from '../../../CollapsibleMessage/types'
import { LINK_DESCRIPTION_MAX_LENGTH } from '../../../../../shared/constants'
import i18next from 'i18next'

const useStyles = makeStyles((theme) =>
  createStyles({
    drawerPaper: {
      width: '100%',
      maxWidth: theme.breakpoints.width('md'),
    },
    dialogContents: {
      marginTop: theme.spacing(6.5),
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
    drawerTooltip: {
      // margin: theme.spacing(1.5, 1, 1.5, 1),
      whiteSpace: 'nowrap',
      maxWidth: 'unset',
      [theme.breakpoints.up('md')]: {
        marginTop: '-12px',
        padding: '16px',
      },
    },
    topBar: {
      width: '100%',
      height: '110px',
      boxShadow: '0 0 8px 0 rgba(0, 0, 0, 0.1)',
      backgroundColor: '#f9f9f9',
      position: 'absolute',
      top: 0,
      zIndex: -1,
    },
    textFieldsTopSpacer: {
      height: theme.spacing(1),
    },
    stateSwitch: {
      marginBottom: theme.spacing(2),
    },
    originalFileLabel: {
      marginBottom: theme.spacing(1),
    },
    fileInputField: {
      marginBottom: theme.spacing(3),
      [theme.breakpoints.up('md')]: {
        marginBottom: 0,
      },
    },
    characterCount: {
      marginLeft: 2,
      marginTop: 9,
    },
    linkInformationHeader: {
      marginBottom: theme.spacing(1.25),
    },
    linkInformationDesc: {
      marginBottom: theme.spacing(3),
      fontWeight: 400,
    },
    saveLinkInformationButtonWrapper: {
      display: 'flex',
      justifyContent: 'flex-end',
      [theme.breakpoints.up('md')]: {
        paddingTop: 9,
      },
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

  // Error from attempt to replace file
  const uploadFileError = drawerStates.uploadFileError
  const setUploadFileError = (error: string | null) =>
    modalDispatch({ type: DrawerActions.setUploadFileError, payload: error })

  // Fetch short link state and dispatches from redux store through our helper hook.
  const {
    shortLinkState,
    shortLinkDispatch,
    isUploading,
    emailValidator,
  } = useShortLink(drawerStates.relevantShortLink!)

  // Manage values in our text fields.
  const originalLongUrl = removeHttpsProtocol(shortLinkState?.longUrl || '')
  const editedLongUrl = shortLinkState?.editedLongUrl || ''
  const editedContactEmail = shortLinkState?.editedContactEmail || ''
  const editedDescription = shortLinkState?.editedDescription || ''
  const [pendingOwner, setPendingOwner] = useState<string>('')
  const originalDescription = shortLinkState?.description || ''
  const originalContactEmail = shortLinkState?.contactEmail || ''
  const isContactEmailValid =
    !editedContactEmail || emailValidator.match(editedContactEmail)
  const isDescriptionValid =
    editedDescription.length <= LINK_DESCRIPTION_MAX_LENGTH &&
    isPrintableAscii(editedDescription)

  // Disposes any current unsaved changes and closes the modal.
  const handleClose = () => {
    shortLinkDispatch?.setEditLongUrl(originalLongUrl)
    shortLinkDispatch?.setEditDescription(originalDescription)
    shortLinkDispatch?.setEditContactEmail(originalContactEmail)
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
        classes={{ tooltip: classes.drawerTooltip }}
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

  const contactEmailHelp = (
    <>
      Contact email{' '}
      <Tooltip
        title="Enter an email which users can contact if they have queries about your short link."
        arrow
        placement="top"
        classes={{ tooltip: classes.drawerTooltip }}
      >
        <img
          className={classes.ownershipHelpIcon}
          src={helpIcon}
          alt="Contact help"
          draggable={false}
        />
      </Tooltip>
    </>
  )

  const linkDescriptionHelp = (
    <>
      Link description{' '}
      <Tooltip
        title="Write a description that will help the public understand what your short link is for."
        arrow
        placement="top"
        classes={{ tooltip: classes.drawerTooltip }}
      >
        <img
          className={classes.ownershipHelpIcon}
          src={helpIcon}
          alt="Description help"
          draggable={false}
        />
      </Tooltip>
    </>
  )

  const replaceFileHelp = (
    <div className={classes.originalFileLabel}>
      Original file{' '}
      <Tooltip
        title="Original file will be replaced after you select file. Maximum file size is 10mb."
        arrow
        placement="top"
        classes={{ tooltip: classes.drawerTooltip }}
      >
        <img
          className={classes.ownershipHelpIcon}
          src={helpIcon}
          alt="Replace file help"
          draggable={false}
        />
      </Tooltip>
    </div>
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
          <CloseIcon />
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
                className={classes.stateSwitch}
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
          <Hidden smDown>
            <div className={classes.textFieldsTopSpacer} />
          </Hidden>
          <Hidden mdUp>
            <Divider className={classes.divider} />
          </Hidden>
          {!shortLinkState?.isFile && (
            <>
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
          {shortLinkState?.isFile && (
            <ConfigOption
              title={replaceFileHelp}
              titleVariant="body2"
              titleClassName={classes.regularText}
              leading={
                <>
                  <FileInputField
                    className={classes.fileInputField}
                    uploadFileError={uploadFileError}
                    textFieldHeight="44px"
                    inputId="replace-file-input"
                    text={originalLongUrl}
                    setFile={(newFile) => {
                      shortLinkDispatch?.replaceFile(
                        newFile,
                        setUploadFileError,
                      )
                    }}
                    setUploadFileError={setUploadFileError}
                  />
                  <CollapsibleMessage
                    type={CollapsibleMessageType.Error}
                    visible={!!uploadFileError}
                    position={CollapsibleMessagePosition.Absolute}
                  >
                    {uploadFileError}
                  </CollapsibleMessage>
                </>
              }
              trailing={
                <label htmlFor="replace-file-input">
                  <TrailingButton
                    onClick={() => {}}
                    disabled={isUploading}
                    variant={isMobileView ? 'contained' : 'outlined'}
                    fullWidth={isMobileView}
                    component="span"
                  >
                    {isUploading ? (
                      <CircularProgress color="primary" size={20} />
                    ) : (
                      'Replace file'
                    )}
                  </TrailingButton>
                </label>
              }
              wrapTrailing={isMobileView}
              trailingPosition={TrailingPosition.end}
            />
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
          <Divider className={classes.dividerInformation} />
          <Typography
            variant="h3"
            className={classes.linkInformationHeader}
            color="primary"
          >
            Link information
          </Typography>
          <Typography variant="body2" className={classes.linkInformationDesc}>
            The information you enter below will be displayed on our Go Search
            page (coming soon), and the error page if users are unable to access
            your short link.
          </Typography>
          <ConfigOption
            title={contactEmailHelp}
            titleVariant="body2"
            titleClassName={classes.regularText}
            leading={
              <DrawerTextField
                value={editedContactEmail}
                onChange={(event) =>
                  shortLinkDispatch?.setEditContactEmail(event.target.value)
                }
                placeholder=""
                helperText={
                  isContactEmailValid
                    ? ''
                    : `This doesn't look like a valid ${i18next.t(
                        'general.emailDomain',
                      )} email.`
                }
                error={!isContactEmailValid}
              />
            }
            trailing={<></>}
            wrapTrailing={isMobileView}
            trailingPosition={TrailingPosition.none}
          />
          <ConfigOption
            title={linkDescriptionHelp}
            titleVariant="body2"
            titleClassName={classes.regularText}
            leading={
              <>
                <DrawerTextField
                  value={editedDescription}
                  onChange={(event) =>
                    shortLinkDispatch?.setEditDescription(
                      event.target.value.replace(/(\r\n|\n|\r)/gm, ''),
                    )
                  }
                  error={!isDescriptionValid}
                  placeholder="Tip: Include your agency name to tell users who this link belongs to."
                  helperText={
                    isDescriptionValid
                      ? `${editedDescription.length}/${LINK_DESCRIPTION_MAX_LENGTH}`
                      : undefined
                  }
                  multiline
                  rows={2}
                  rowsMax={isMobileView ? 5 : undefined}
                  FormHelperTextProps={{ className: classes.characterCount }}
                />
                <CollapsibleMessage
                  type={CollapsibleMessageType.Error}
                  visible={!isDescriptionValid}
                  position={CollapsibleMessagePosition.Static}
                  timeout={0}
                >
                  {isPrintableAscii(editedDescription)
                    ? `${editedDescription.length}/200`
                    : 'Description should only contain alphanumeric characters and symbols.'}
                </CollapsibleMessage>
              </>
            }
            trailing={<></>}
            wrapTrailing={isMobileView}
            trailingPosition={TrailingPosition.none}
          />
          <div className={classes.saveLinkInformationButtonWrapper}>
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
          <Divider className={classes.dividerAnalytics} />
          <LinkAnalytics />
        </DrawerMargin>
      </main>
    </Drawer>
  )
}
