import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Snackbar from '@material-ui/core/Snackbar'
import SnackbarContent from '@material-ui/core/SnackbarContent'
import IconButton from '@material-ui/core/IconButton'
import { withStyles } from '@material-ui/core/styles'
import rootActions from '~/actions/root'
import { snackbarVariants } from '~/util/types'
import 'boxicons'

const snackbarStyle = (theme) => ({
  error: {
    backgroundColor: theme.palette.error.main,
  },
  info: {
    backgroundColor: theme.palette.primary.dark,
  },
  wordSize: {
    fontSize: '0.875rem',
  },
})
const mapStateToProps = (state) => ({
  message: state.root.snackbarMessage.message,
  variant: state.root.snackbarMessage.variant,
})
const mapDispatchToProps = (dispatch) => ({
  closeSnackbar: (event, reason) => {
    if (reason !== 'clickaway') {
      dispatch(rootActions.closeSnackbar())
    }
  },
})

const MessageSnackbar = ({ classes, variant, message, closeSnackbar }) => {
  const colorClass =
    variant === snackbarVariants.ERROR ? classes.error : classes.info

  return (
    <Snackbar open={!!message} autoHideDuration={5000} onClose={closeSnackbar}>
      <SnackbarContent
        message={message}
        className={`${colorClass} ${classes.wordSize}`}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            onClick={closeSnackbar}
            size="small"
          >
            <box-icon name="x" color="white" size="sm" />
          </IconButton>,
        ]}
      />
    </Snackbar>
  )
}

MessageSnackbar.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  variant: PropTypes.oneOf(Object.values(snackbarVariants)).isRequired,
  message: PropTypes.string.isRequired,
  closeSnackbar: PropTypes.func.isRequired,
}

export default withStyles(snackbarStyle)(
  connect(mapStateToProps, mapDispatchToProps)(MessageSnackbar),
)
