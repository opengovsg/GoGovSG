import React, { useEffect } from 'react'
import i18next from 'i18next'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  Button,
  FormControl,
  LinearProgress,
  Link,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import { Minimatch } from 'minimatch'
import { Redirect } from 'react-router-dom'
import loginActions from '~/actions/login'
import rootActions from '~/actions/root'
import { USER_PAGE, loginFormVariants } from '~/util/types'
import GoLogo from '~/assets/go-main-logo.png'
import { get } from '../../util/requests'
import LoginForm from './LoginForm'
import SectionBackground from '../SectionBackground'
import BaseLayout from '../BaseLayout'

const mapDispatchToProps = (dispatch) => ({
  getOTPEmail: (value) => dispatch(loginActions.getOTPEmail(value)),
  verifyOTP: () => dispatch(loginActions.verifyOTP()),
  setOTP: (otp) => dispatch(loginActions.setOTP(otp)),
  setEmail: (email) => dispatch(loginActions.setEmail(email)),
  getEmailValidator: () =>
    dispatch(loginActions.getEmailValidationGlobExpression()),
  setLoginInfoMessage: (message) =>
    dispatch(rootActions.setInfoMessage(message)),
})

const mapStateToProps = (state, ownProps) => ({
  isLoggedIn: state.login.isLoggedIn,
  location: ownProps.location,
  variant: state.login.formVariant,
  email: state.login.email,
  emailValidator: state.login.emailValidator,
})

const useStyles = makeStyles((theme) =>
  createStyles({
    loginWrapper: {
      display: 'grid',
      gridGap: theme.spacing(4),
    },
    headerGroup: {
      gridRow: 1,
    },
    logo: {
      maxWidth: '130px',
      width: '40%',
      marginBottom: theme.spacing(1),
    },
    textInputGroup: {
      gridRow: 2,
    },
    resendOTPBtn: {
      '&:disabled': {
        color: theme.palette.grey[300],
      },
    },
    '@media screen\\0': {
      // Styles for Internet Explorer compatibility
      logoLink: {
        marginBottom: '0',
      },
    },
  }),
)

const LoginPage = ({
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
  const classes = useStyles()
  // Display a login message from the server
  useEffect(() => {
    let cancelled = false

    getEmailValidator()
    get('/api/login/message').then((response) => {
      if (response.ok) {
        response.text().then((text) => {
          if (text && !cancelled) setLoginInfoMessage(text)
        })
      }
    })

    return (() => { cancelled = true })
  }, [])

  if (!isLoggedIn) {
    const variantMap = loginFormVariants.map[variant]
    const isEmailView = loginFormVariants.isEmailView(variant)
    const emailError = () => !!email && !emailValidator.match(email)
    const emailFormAttr = {
      id: 'email',
      submit: getOTPEmail,
      placeholder: `e.g. ${i18next.t('general.placeholders.email')}`,
      buttonMessage: 'Sign in',
      textError: emailError,
      textErrorMessage: () =>
        emailError()
          ? `This doesn't look like a valid ${i18next.t(
              'general.emailDomain',
            )} email.`
          : '',
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
      <BaseLayout withHeader={false}>
        <SectionBackground>
          <main className={classes.loginWrapper}>
            <section className={classes.headerGroup}>
              <Link href="/#/">
                <img className={classes.logo} src={GoLogo} alt="GoGovSG logo" />
              </Link>
              <Typography variant="body1">
                Only available for use by public officers with a{' '}
                <strong>{i18next.t('general.emailDomain')}</strong> email.
              </Typography>
            </section>
            <section className={classes.textInputGroup}>
              <Typography variant="body2">Email</Typography>
              {emailForm}
              {progressBar}
              {otpForm}
              {resendOTPBtn}
            </section>
          </main>
        </SectionBackground>
      </BaseLayout>
    )
  }

  // User is logged in, redirect if available
  if (location) {
    return <Redirect to={{ pathname: USER_PAGE, state: { from: location } }} />
  }
  return <Redirect to={{ pathname: USER_PAGE }} />
}

LoginPage.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage)
