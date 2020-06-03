import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  Dialog,
  IconButton,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import CloseIcon from '../../widgets/CloseIcon'

import userActions from '../../../actions/user'
import CreateLinkForm from './CreateLinkForm'
import useFullScreenDialog from './helpers/fullScreenDialog'
import ModalMargins from './ModalMargins'

const mapStateToProps = (state) => ({
  shortUrl: state.user.shortUrl,
  longUrl: state.user.longUrl,
  isUploading: state.user.isUploading,
  createShortLinkError: state.user.createShortLinkError,
  uploadFileError: state.user.uploadFileError,
})

const mapDispatchToProps = (dispatch) => ({
  setShortUrl: (shortUrl) => dispatch(userActions.setShortUrl(shortUrl)),
  setLongUrl: (longUrl) => dispatch(userActions.setLongUrl(longUrl)),
  setRandomShortUrl: () => dispatch(userActions.setRandomShortUrl()),
  uploadFile: (file) => dispatch(userActions.uploadFile(file)),
  setUploadFileError: (error) =>
    dispatch(userActions.setUploadFileError(error)),
  setCreateShortLinkError: (error) =>
    dispatch(userActions.setCreateShortLinkError(error)),
})

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

const CreateUrlModal = ({
  createUrlModal,
  closeCreateUrlModal,
  onSubmit,
  shortUrl,
  setShortUrl,
  longUrl,
  setLongUrl,
  setRandomShortUrl,
  isUploading,
  uploadFile,
  uploadFileError,
  setUploadFileError,
  createShortLinkError,
  setCreateShortLinkError,
}) => {
  const isFullScreenDialog = useFullScreenDialog()
  const classes = useStyles({ isFullScreenDialog })
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
      {/* // TODO: Convert props drilling to redux. */}
      <CreateLinkForm
        onSubmitLink={onSubmit}
        shortUrl={shortUrl}
        setShortUrl={setShortUrl}
        longUrl={longUrl}
        setLongUrl={setLongUrl}
        setRandomShortUrl={setRandomShortUrl}
        isUploading={isUploading}
        onSubmitFile={uploadFile}
        uploadFileError={uploadFileError}
        setUploadFileError={setUploadFileError}
        createShortLinkError={createShortLinkError}
        setCreateShortLinkError={setCreateShortLinkError}
      />
    </Dialog>
  )
}

CreateUrlModal.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  shortUrl: PropTypes.string.isRequired,
  setShortUrl: PropTypes.func.isRequired,
  longUrl: PropTypes.string.isRequired,
  setLongUrl: PropTypes.func.isRequired,
  setRandomShortUrl: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateUrlModal)
