import React from 'react'
import i18next from 'i18next'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Paper from '@material-ui/core/Paper'
import Modal from '@material-ui/core/Modal'
import Button from '@material-ui/core/Button'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import 'boxicons'

import { isValidLongUrl, isValidShortUrl } from '~/../shared/util/validation'
import userActions from '~/actions/user'
import createUrlStyle from '~/styles/createUrlModal'

const mapStateToProps = (state) => ({
  shortUrl: state.user.shortUrl,
  longUrl: state.user.longUrl,
})

const mapDispatchToProps = (dispatch) => ({
  setShortUrl: (shortUrl) => dispatch(userActions.setShortUrl(shortUrl)),
  setLongUrl: (longUrl) => dispatch(userActions.setLongUrl(longUrl)),
  setRandomShortUrl: () => dispatch(userActions.setRandomShortUrl()),
})

const CreateUrlModal = (props) => {
  const {
    classes,
    createUrlModal,
    closeCreateUrlModal,
    onSubmit,
    shortUrl,
    setShortUrl,
    longUrl,
    setLongUrl,
    setRandomShortUrl,
  } = props

  return (
    <Modal
      aria-labelledby="creatUrlModal"
      aria-describedby="create-links"
      open={createUrlModal}
      onClose={closeCreateUrlModal}
    >
      <Paper className={classes.createUrlModal}>
        <div className={classes.header}>
          <Typography variant="h3">Create new link</Typography>
          <IconButton
            className={classes.closeIcon}
            onClick={closeCreateUrlModal}
            size="small"
          >
            <box-icon size="sm" name="x" />
          </IconButton>
        </div>
        <form
          className={classes.form}
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
        >
          <Typography
            className={classes.labelText}
            variant="caption"
            gutterBottom
          >
            Enter your original link
            <strong>(https only)</strong>
          </Typography>
          <TextField
            error={!isValidLongUrl(longUrl, true)}
            InputProps={{
              className: classes.outlinedInput,
              classes: { input: classes.input },
              startAdornment: (
                <InputAdornment
                  className={classes.startAdorment}
                  position="start"
                >
                  https://
                </InputAdornment>
              ),
            }}
            required
            variant="outlined"
            placeholder="Enter URL here"
            onChange={(event) => setLongUrl(event.target.value)}
            value={longUrl}
            helperText={
              isValidLongUrl(longUrl, true)
                ? ''
                : "This doesn't look like a valid URL."
            }
          />
          <Typography
            className={classes.labelText}
            variant="caption"
            gutterBottom
          >
            Customise link{' '}
            <i>
              (links are unique and <strong>cannot be deleted</strong> after
              creation)
            </i>
          </Typography>
          <TextField
            error={!isValidShortUrl(shortUrl, true)}
            className={classes.textField}
            InputProps={{
              className: classes.outlinedInput,
              classes: { input: classes.input },
              startAdornment: (
                <InputAdornment
                  className={classes.startAdorment}
                  position="start"
                >
                  {i18next.t('general.shortUrlPrefix')}
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    className={classes.refreshIcon}
                    onClick={setRandomShortUrl}
                    size="small"
                  >
                    <box-icon name="refresh" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            required
            variant="outlined"
            onChange={(event) => setShortUrl(event.target.value)}
            value={shortUrl}
            helperText={
              isValidShortUrl(shortUrl, true)
                ? ''
                : 'Short links should only consist of lowercase letters, numbers and hyphens.'
            }
          />
          <Button
            className={classes.button}
            type="submit"
            size="large"
            variant="contained"
            color="primary"
            // Both short and long url needs to be valid for the create button to be enabled.
            // In this case, blank url is not a valid short or long url.
            disabled={
              !isValidShortUrl(shortUrl, false) ||
              !isValidLongUrl(longUrl, false)
            }
          >
            Create link
          </Button>
        </form>
      </Paper>
    </Modal>
  )
}

CreateUrlModal.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  onSubmit: PropTypes.func.isRequired,
  shortUrl: PropTypes.string.isRequired,
  setShortUrl: PropTypes.func.isRequired,
  longUrl: PropTypes.string.isRequired,
  setLongUrl: PropTypes.func.isRequired,
  setRandomShortUrl: PropTypes.func.isRequired,
}

export default withStyles(createUrlStyle)(
  connect(mapStateToProps, mapDispatchToProps)(CreateUrlModal),
)
