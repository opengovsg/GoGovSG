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
  createStyles,
  makeStyles,
} from '@material-ui/core'

import { isValidLongUrl, isValidShortUrl } from '~/../shared/util/validation'
import { ApplyAppMargins } from '../../../AppMargins'

const useStyles = makeStyles((theme) =>
  createStyles({
    startAdorment: {
      minHeight: (props) => props.textFieldHeight,
      backgroundColor: theme.palette.dividerLight,
      borderRight: `1px solid ${theme.palette.divider}`,
    },
    startAdormentText: {
      width: '87px',
      paddingLeft: theme.spacing(2),
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: theme.spacing(4),
    },
    labelText: {
      marginLeft: '1px',
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(0.5),
    },
    outlinedInput: {
      padding: theme.spacing(0),
    },
    input: {
      flexGrow: '1',
      height: (props) => props.textFieldHeight,
      padding: theme.spacing(0),
    },
    button: {
      width: '180px',
      margin: theme.spacing(4, 0, 2),
      padding: theme.spacing(1, 5),
      alignSelf: 'center',
    },
    refreshIcon: {
      marginRight: theme.spacing(1),
      fill: theme.palette.primary.dark,
    },
  }),
)

// Height of the text field in the create link dialog.
const textFieldHeight = 44

const FormStartAdorment = ({ children }) => {
  const classes = useStyles({ textFieldHeight })
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
  const classes = useStyles({ textFieldHeight })
  return (
    <>
      <Divider />
      <ApplyAppMargins>
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
          <Typography className={classes.labelText}>
            <Typography variant="body1">Customise your link</Typography>
            <Typography variant="body2" fontStyle="italics" display="inline">
              {'(Links are unique and '}
              {/* <strong>cannot be deleted</strong> */}
              {' after creation)'}
            </Typography>
          </Typography>
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
      </ApplyAppMargins>
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
