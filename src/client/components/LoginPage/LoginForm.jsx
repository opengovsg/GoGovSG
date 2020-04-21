import React from 'react'
import PropTypes from 'prop-types'
import i18next from 'i18next'
import { Button, TextField, createStyles, makeStyles } from '@material-ui/core'
import { loginFormVariants } from '~/util/types'

const useStyles = makeStyles((theme) =>
  createStyles({
    loginField: {
      borderRadius: '3px',
    },
    loginInputText: {
      color: theme.palette.grey[800],
    },
    buttonRow: {
      display: 'grid',
      gridGap: theme.spacing(4),
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
    },
    signInButton: {
      gridColumn: 2,
      width: '100%',
      maxWidth: '200px',
      minWidth: '120px',
      justifySelf: 'right',
    },
    helpButton: {
      gridColumn: 1,
      width: '100%',
      maxWidth: '200px',
      minWidth: '120px',
      justifySelf: 'left',
      color: theme.palette.text.secondary,
      fontWeight: 400,
    },
  }),
)

// Form object to request for user's email or OTP
const LoginForm = ({
  id,
  placeholder,
  submit,
  onChange,
  buttonMessage,
  textError,
  textErrorMessage,
  hidden,
  variant,
  autoComplete,
}) => {
  const classes = useStyles()
  const variantMap = loginFormVariants.map[variant]
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      hidden={hidden}
      autoComplete={autoComplete}
    >
      <TextField
        autoFocus
        required
        fullWidth
        variant="outlined"
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        InputProps={{
          classes: {
            input: classes.loginInputText,
          },
        }}
        className={classes.loginField}
        margin="normal"
        id={id}
        name={id}
        disabled={!variantMap.inputEnabled}
        error={textError()}
        helperText={textErrorMessage()}
      />
      <section className={classes.buttonRow}>
        <Button
          className={classes.helpButton}
          href={i18next.t('general.links.faq')}
          target="_blank"
          variant="outlined"
          size="large"
        >
          Need help?
        </Button>
        <Button
          className={classes.signInButton}
          type="submit"
          variant="contained"
          color="primary"
          disabled={!variantMap.submitEnabled}
          size="large"
        >
          {buttonMessage}
        </Button>
      </section>
    </form>
  )
}

LoginForm.propTypes = {
  id: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  submit: PropTypes.func.isRequired,
  buttonMessage: PropTypes.string.isRequired,
  textError: PropTypes.func.isRequired,
  textErrorMessage: PropTypes.func.isRequired,
  hidden: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(Object.values(loginFormVariants.types)).isRequired,
  autoComplete: PropTypes.string.isRequired,
}

export default LoginForm
