import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { useHistory } from 'react-router-dom'
import {
  Dialog,
  IconButton,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import CloseIcon from '../../widgets/CloseIcon'

import CreateLinkForm from './CreateLinkForm'
import useFullScreenDialog from './helpers/fullScreenDialog'
import ModalMargins from './ModalMargins'
import userActions from '~/actions/user'

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
      fill: (props) =>
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

const mapStateToProps = (state) => ({
  createUrlModal: state.user.createUrlModal,
})

const mapDispatchToProps = (dispatch) => ({
  closeCreateUrlModal: () => dispatch(userActions.closeCreateUrlModal()),
  onCreateUrl: (history) => dispatch(userActions.createUrlOrRedirect(history)),
  onUploadFile: (file) => dispatch(userActions.uploadFile(file)),
})

const CreateUrlModal = ({
  createUrlModal,
  closeCreateUrlModal,
  onCreateUrl,
  onUploadFile,
}) => {
  const isFullScreenDialog = useFullScreenDialog()
  const classes = useStyles({ isFullScreenDialog })
  const [step, setStep] = useState(0)
  const incrementDecorator = (func) => async (...args) => {
    const proceed = await func(...args)
    if (proceed) {
      setStep(step + 1)
    }
  }
  const history = useHistory()
  const onSubmitLink = incrementDecorator(() => onCreateUrl(history))
  const onSubmitFile = incrementDecorator(onUploadFile)

  // Reset step when modal closes and reopens
  useEffect(() => setStep(0), [createUrlModal])
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
              Create new link
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
      <CreateLinkForm onSubmitLink={onSubmitLink} onSubmitFile={onSubmitFile} />
    </Dialog>
  )
}

CreateUrlModal.propTypes = {
  onCreateUrl: PropTypes.func.isRequired,
  onUploadFile: PropTypes.func.isRequired,
  createUrlModal: PropTypes.bool.isRequired,
  closeCreateUrlModal: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateUrlModal)
