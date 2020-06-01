import React from 'react'
import PropTypes from 'prop-types'
import i18next from 'i18next'
import {
  Button,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@material-ui/core'

import useCreateLinkFormStyles from './styles/createLinkForm'
import {
  isValidLongUrl,
  isValidShortUrl,
} from '../../../../shared/util/validation'
import ModalMargins from './ModalMargins'
import refreshIcon from './assets/refresh-icon.svg'

// Height of the text field in the create link dialog.
const TEXT_FIELD_HEIGHT = 44

const FormStartAdorment = ({ children }) => {
  const classes = useCreateLinkFormStyles({
    textFieldHeight: TEXT_FIELD_HEIGHT,
  })
  return (
    <InputAdornment className={classes.startAdorment} position="start">
      <Typography className={classes.startAdormentText} color="textSecondary">
        {children}
      </Typography>
    </InputAdornment>
  )
}

export default function CreateLinkForm({
  onSubmit,
  shortUrl,
  setShortUrl,
  longUrl,
  setLongUrl,
  setRandomShortUrl,
}) {
  const classes = useCreateLinkFormStyles({
    textFieldHeight: TEXT_FIELD_HEIGHT,
  })
  return (
    <>
      <Divider />
      <ModalMargins>
        <form
          className={classes.form}
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
        >
          <Typography className={classes.labelText} variant="body1">
            Original link
          </Typography>
          <TextField
            error={!isValidLongUrl(longUrl, true)}
            InputProps={{
              className: classes.outlinedInput,
              classes: { input: classes.input },
              startAdornment: <FormStartAdorment>https://</FormStartAdorment>,
            }}
            required
            variant="outlined"
            placeholder="Enter your link"
            onChange={(event) => setLongUrl(event.target.value)}
            value={longUrl}
            helperText={
              isValidLongUrl(longUrl, true)
                ? ''
                : "This doesn't look like a valid URL."
            }
          />
          <div className={classes.labelText}>
            <Typography variant="body1">Customise your link</Typography>
            <Typography variant="caption" color="textSecondary">
              <i>
                {'(Links are unique and '}
                <strong>cannot be deleted</strong>
                {' after creation)'}
              </i>
            </Typography>
          </div>
          <TextField
            error={!isValidShortUrl(shortUrl, true)}
            InputProps={{
              className: classes.outlinedInput,
              classes: { input: classes.input },
              startAdornment: (
                <FormStartAdorment>
                  {i18next.t('general.shortUrlPrefix')}
                </FormStartAdorment>
              ),
              endAdornment: (
                <InputAdornment position="end" className={classes.endAdornment}>
                  <IconButton
                    className={classes.refreshIcon}
                    onClick={setRandomShortUrl}
                    size="small"
                  >
                    <img src={refreshIcon} alt="Get new short link" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            required
            variant="outlined"
            placeholder="Customise your link"
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
            disabled={
              !isValidShortUrl(shortUrl, false) ||
              !isValidLongUrl(longUrl, false)
            }
          >
            Create link
          </Button>
        </form>
      </ModalMargins>
    </>
  )
}

CreateLinkForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  shortUrl: PropTypes.string.isRequired,
  setShortUrl: PropTypes.func.isRequired,
  longUrl: PropTypes.string.isRequired,
  setLongUrl: PropTypes.func.isRequired,
  setRandomShortUrl: PropTypes.func.isRequired,
}
