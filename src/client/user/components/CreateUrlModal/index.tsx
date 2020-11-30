import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { History } from 'history'
import {
  Dialog,
  IconButton,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import CloseIcon from '../../../app/components/widgets/CloseIcon'
import CreateLinkForm from './CreateLinkForm'
import useFullScreenDialog from '../../helpers/fullScreenDialog'
import ModalMargins from './ModalMargins'
import userActions from '../../actions'
import AddDescriptionForm from './AddDescriptionForm'
import { GAEvent, GAPageView } from '../../../app/util/ga'
import { GoGovReduxState } from '../../../app/reducers/types'

type StyleProps = {
  isFullScreenDialog: boolean,
}

const useStyles = makeStyles((theme) =>
  createStyles({
    headerDiv: {
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
    },
    headerText: {
      alignSelf: 'flex-end',
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(2),
    },
    closeIconButton: {
      fill: (props: StyleProps) =>
        props.isFullScreenDialog ? '#BBBBBB' : theme.palette.primary.dark,
      height: (props) => (props.isFullScreenDialog ? 44 : 30.8),
      width: (props) => (props.isFullScreenDialog ? 44 : 30.8),
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      marginLeft: (props) => (props.isFullScreenDialog ? 0 : theme.spacing(2)),
      marginRight: (props) => (props.isFullScreenDialog ? 0 : theme.spacing(2)),
    },
    headerWrapper: {
      background: '#f9f9f9',
      boxShadow: '0 0 8px 0 rgba(0, 0, 0, 0.1)',
      [theme.breakpoints.up('sm')]: {
        background: 'unset',
        boxShadow: 'unset',
      },
    },
  }),
)

const CreateUrlModal = () => {
  const createUrlModal = useSelector((state: GoGovReduxState) => state.user.createUrlModal)
  const urlUploadState = useSelector((state: GoGovReduxState) => state.user.uploadState.urlUpload)
  const fileUploadState = useSelector((state: GoGovReduxState) => state.user.uploadState.fileUpload)
  const dispatch = useDispatch()
  const closeCreateUrlModal = () => dispatch(userActions.closeCreateUrlModal())
  const onCreateUrl = (history: History) => dispatch(userActions.createUrlOrRedirect(history))
  const onUploadFile = (file: File | null) => dispatch(userActions.uploadFile(file))

  const isFullScreenDialog = useFullScreenDialog()
  const classes = useStyles({ isFullScreenDialog })
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (fileUploadState) {
      closeCreateUrlModal()
      dispatch(userActions.setFileUploadState(false))
    }
  }, [fileUploadState])

  useEffect(() => {
    if (urlUploadState) {
      closeCreateUrlModal()
      dispatch(userActions.setUrlUploadState(false))
    }
  }, [urlUploadState])

  // Reset step when modal closes and reopens
  useEffect(() => {
    if (createUrlModal) {
      setStep(0)
      // Google Analytics: open link creation modal in user page
      GAPageView('CREATE LINK PAGE')
      GAEvent('user page', 'open link creation modal')

      return () => {
        // Google Analytics: close link creation modal in user page
        GAPageView('USER PAGE')
      }
    }
    return undefined
  }, [createUrlModal])
  return (
    <Dialog
      aria-labelledby="createUrlModal"
      aria-describedby="create-links"
      fullScreen={isFullScreenDialog}
      fullWidth={!isFullScreenDialog}
      maxWidth="md"
      open={createUrlModal}
      onClose={closeCreateUrlModal}
    >
      <div className={classes.headerWrapper}>
        <ModalMargins applyRightMargin={false}>
          <div className={classes.headerDiv}>
            <Typography
              className={classes.headerText}
              variant={isFullScreenDialog ? 'h6' : 'h3'}
              color="primary"
            >
              {step === 0
                ? 'Create new link'
                : "Done! You can now customise your link's visibility"}
            </Typography>
            <IconButton
              className={classes.closeIconButton}
              onClick={closeCreateUrlModal}
              size="small"
            >
              <CloseIcon size={isFullScreenDialog ? 36 : 24} />
            </IconButton>
          </div>
        </ModalMargins>
      </div>
      {step === 0 ? (
        <CreateLinkForm
          onSubmitLink={onCreateUrl}
          onSubmitFile={onUploadFile}
        />
      ) : (
        <AddDescriptionForm />
      )}
    </Dialog>
  )
}

export default CreateUrlModal
