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
import { ApplyAppMargins } from '../../../AppMargins'

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
      height: '87px',
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
    headerText: {
      alignSelf: 'flex-end',
    },
    closeIcon: {
      fill: theme.palette.primary.dark,
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
  const classes = useStyles()
  return (
    <Dialog
      aria-labelledby="createUrlModal"
      aria-describedby="create-links"
      fullScreen
      open={createUrlModal}
      onClose={closeCreateUrlModal}
    >
      <ApplyAppMargins>
        <div className={classes.headerDiv}>
          <Typography
            className={classes.headerText}
            variant="h2"
            color="primary"
          >
            Create new link
          </Typography>
          <IconButton
            className={classes.closeIcon}
            onClick={closeCreateUrlModal}
            size="small"
          >
            <box-icon size="md" name="x" />
          </IconButton>
        </div>
      </ApplyAppMargins>
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
