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
import 'boxicons'

import userActions from '../../../../actions/user'
import CreateLinkForm from './CreateLinkForm'
import useFullScreenDialog from '../util/useFullScreenDialog'
import ModalMargins from '../ModalMargins'

const mapStateToProps = (state) => ({
  shortUrl: state.user.shortUrl,
  longUrl: state.user.longUrl,
})

const mapDispatchToProps = (dispatch) => ({
  setShortUrl: (shortUrl) => dispatch(userActions.setShortUrl(shortUrl)),
  setLongUrl: (longUrl) => dispatch(userActions.setLongUrl(longUrl)),
  setRandomShortUrl: () => dispatch(userActions.setRandomShortUrl()),
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
}) => {
  const isFullScreenDialog = useFullScreenDialog()
  const classes = useStyles({ isFullScreenDialog })
  return (
    <Dialog
      aria-labelledby="createUrlModal"
      aria-describedby="create-links"
      fullScreen={isFullScreenDialog}
      fullWidth={!isFullScreenDialog}
      maxWidth="sm"
      open={createUrlModal}
      onClose={closeCreateUrlModal}
    >
      <ModalMargins applyRightMargin={false}>
        <div className={classes.headerDiv}>
          <Typography
            className={classes.headerText}
            variant="h3"
            color="primary"
          >
            Create new link
          </Typography>
          <IconButton
            className={classes.closeIconButton}
            onClick={closeCreateUrlModal}
            size="small"
          >
            <box-icon size={isFullScreenDialog ? 'md' : 'sm'} name="x" />
          </IconButton>
        </div>
      </ModalMargins>
      {/* // TODO: Convert props drilling to redux. */}
      <CreateLinkForm
        onSubmit={onSubmit}
        shortUrl={shortUrl}
        setShortUrl={setShortUrl}
        longUrl={longUrl}
        setLongUrl={setLongUrl}
        setRandomShortUrl={setRandomShortUrl}
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
