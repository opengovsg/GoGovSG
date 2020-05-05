import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { connect } from 'react-redux'
import i18next from 'i18next'
import { Button, TextField, createStyles, makeStyles } from '@material-ui/core'
import { loginFormVariants } from '~/util/types'
import loginActions from '~/actions/login'
import TextButton from './widgets/TextButton'

const mapDispatchToProps = (dispatch) => ({
  getOTPEmail: (value) => dispatch(loginActions.getOTPEmail(value)),
})

const useStyles = makeStyles((theme) =>
  createStyles({
    loginField: {
      borderRadius: '3px',
    },
    loginInputText: {
      color: theme.palette.grey[800],
    },
    buttonRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
    },
    signInButton: {
      width: '140px',
      minWidth: '120px',
      marginRight: theme.spacing(2),
    },
    secondaryButton: {
      fontWeight: 400,
      marginLeft: theme.spacing(2),
    },
    resendOTPBtn: {
      marginRight: 'auto',
      '&:disabled': {
        opacity: 0.5,
      },
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
  isEmailView,
  getOTPEmail,
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
          className={classes.signInButton}
          type="submit"
          variant="contained"
          color="primary"
          disabled={!variantMap.submitEnabled}
          size="large"
        >
          {buttonMessage}
        </Button>
        {!isEmailView ? (
          <TextButton
            className={classNames(
              classes.secondaryButton,
              classes.resendOTPBtn,
            )}
            disabled={!variantMap.resendEnabled}
            onClick={getOTPEmail}
          >
            Resend OTP
          </TextButton>
        ) : (
          <TextButton
            className={classes.secondaryButton}
            href={i18next.t('general.links.faq')}
            target="_blank"
          >
            Need help?
          </TextButton>
        )}
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
  isEmailView: PropTypes.bool,
}

LoginForm.defaultProps = {
  isEmailView: true,
}

export default connect(null, mapDispatchToProps)(LoginForm)
