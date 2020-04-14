import React, { useEffect } from 'react'
import i18next from 'i18next'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import FormControl from '@material-ui/core/FormControl'
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import { Minimatch } from 'minimatch'
import { Redirect } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import loginActions from '~/actions/login'
import rootActions from '~/actions/root'
import { USER_PAGE, loginFormVariants } from '~/util/types'
import loginPageStyle from '~/styles/loginPage'
import GoLogo from '~/assets/go-main-logo.png'
import { get } from '../util/requests'

const mapDispatchToProps = dispatch => ({
  getOTPEmail: value => dispatch(loginActions.getOTPEmail(value)),
  verifyOTP: () => dispatch(loginActions.verifyOTP()),
  setOTP: otp => dispatch(loginActions.setOTP(otp)),
  setEmail: email => dispatch(loginActions.setEmail(email)),
  getEmailValidator: () => dispatch(loginActions.getEmailValidationGlobExpression()),
  setLoginInfoMessage: message => dispatch(rootActions.setInfoMessage(message)),
})

const mapStateToProps = (state, ownProps) => ({
  isLoggedIn: state.login.isLoggedIn,
  location: ownProps.location,
  variant: state.login.formVariant,
  email: state.login.email,
  emailValidator: state.login.emailValidator,
})

// Form object to request for user's email or OTP
const LoginForm = ({
  classes,
  id,
  placeholder,
  submit,
  onChange,
  titleMessage,
  buttonMessage,
  textError,
  textErrorMessage,
  hidden,
  variant,
  autoComplete,
}) => {
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
        label={titleMessage}
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)}
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
      <FormControl margin="normal" fullWidth>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!variantMap.submitEnabled}
          size="large"
        >
          {buttonMessage}
        </Button>
      </FormControl>
    </form>
  )
}

LoginForm.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  id: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  submit: PropTypes.func.isRequired,
  titleMessage: PropTypes.string.isRequired,
  buttonMessage: PropTypes.string.isRequired,
  textError: PropTypes.func.isRequired,
  textErrorMessage: PropTypes.func.isRequired,
  hidden: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(Object.values(loginFormVariants.types)).isRequired,
  autoComplete: PropTypes.string.isRequired,
}

const LoginPage = ({
  classes,
  location,
  isLoggedIn,
  getOTPEmail,
  getEmailValidator,
  verifyOTP,
  setEmail,
  setOTP,
  email,
  emailValidator,
  variant,
  setLoginInfoMessage,
}) => {
  // Display a login message from the server
  useEffect(() => {
    getEmailValidator()
    get('/api/login/message').then((response) => {
      if (response.ok) {
        response.text().then((text) => {
          if (text) setLoginInfoMessage(text)
        })
      }
    })
  }, [])

  if (!isLoggedIn) {
    const variantMap = loginFormVariants.map[variant]
    const isEmailView = loginFormVariants.isEmailView(variant)
    const emailError = () => !!email && !emailValidator.match(email)
    const emailFormAttr = {
      id: 'email',
      submit: getOTPEmail,
      titleMessage: `${i18next.t('general.emailDomain')} email address`,
      placeholder: `e.g. ${i18next.t('general.placeholders.email')}`,
      buttonMessage: 'Sign in',
      textError: emailError,
      textErrorMessage: () => (emailError()
        ? `This doesn't look like a valid ${i18next.t('general.emailDomain')} email.`
        : ''
      ),
      hidden: !isEmailView,
      onChange: setEmail,
      variant,
      autoComplete: 'on',
    }
    const emailForm = <LoginForm classes={classes} {...emailFormAttr} />

    const otpFormAttr = {
      id: 'otp',
      submit: verifyOTP,
      titleMessage: 'One time password',
      placeholder: 'e.g. 123456',
      buttonMessage: 'Submit',
      textError: () => false,
      textErrorMessage: () => '',
      hidden: isEmailView,
      onChange: setOTP,
      variant,
      autoComplete: 'off',
    }
    const otpForm = <LoginForm classes={classes} {...otpFormAttr} />

    const progressBar = variantMap.progressBarShown ? (
      <LinearProgress className={classes.progressBar} />
    ) : null

    const resendOTPBtn = isEmailView ? null : (
      <FormControl margin="normal" fullWidth>
        <Button
          type="button"
          variant="text"
          color="primary"
          disabled={!variantMap.resendEnabled}
          className={classes.resendOTPBtn}
          onClick={getOTPEmail}
          size="large"
        >
          Resend OTP
        </Button>
      </FormControl>
    )

    return (
      <div className={classes.loginWrapper}>
        <div className={classes.headerOverlay} />
        <div className={classes.login}>
          <Paper className={classes.paper}>
            <div className={classes.loginHeader}>
              <a href="/#" className={classes.logoLink}>
                <img src={GoLogo} className={classes.logo} alt="GoGovSG logo" />
              </a>
              <Typography className={classes.signInText} variant="h2" color="textPrimary" gutterBottom>
                Sign in
              </Typography>
              <Typography align="center" variant="body1">
                Only available for use by public officers with a
                {' '}
                <strong>
                  {i18next.t('general.emailDomain')}
                </strong>
                {' '}
                email.
              </Typography>
            </div>
            {emailForm}
            {otpForm}
            {resendOTPBtn}
            {progressBar}
          </Paper>
        </div>
      </div>
    )
  }

  // User is logged in, redirect if available
  if (location) {
    return (
      <Redirect
        to={{
          pathname: USER_PAGE,
          state: { from: location },
        }}
      />
    )
  }
  return null
}

LoginPage.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  getOTPEmail: PropTypes.func.isRequired,
  getEmailValidator: PropTypes.func.isRequired,
  verifyOTP: PropTypes.func.isRequired,
  location: PropTypes.shape({}),
  setEmail: PropTypes.func.isRequired,
  setOTP: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
  emailValidator: PropTypes.instanceOf(Minimatch).isRequired,
  variant: PropTypes.oneOf(Object.values(loginFormVariants.types)).isRequired,
}

LoginPage.defaultProps = {
  location: undefined,
}

export default withStyles(loginPageStyle)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(LoginPage)
)
