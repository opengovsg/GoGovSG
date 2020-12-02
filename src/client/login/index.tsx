import React, { FunctionComponent, useEffect, useState } from 'react'
import classNames from 'classnames'
import i18next from 'i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  Hidden,
  LinearProgress,
  Link,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import { Redirect } from 'react-router-dom'
import { GoGovReduxState } from '../app/reducers/types'
import loginActions from './actions'
import rootActions from '../app/components/pages/RootPage/actions'
import {
  DIRECTORY_PAGE,
  USER_PAGE,
  VariantType,
  loginFormVariants,
} from '../app/util/types'
import GoLogo from '../app/assets/go-logo-graphics/go-main-logo.svg'
import LoginGraphics from '../app/assets/login-page-graphics/login-page-graphics.svg'
import { get } from '../app/util/requests'
import LoginForm from './components/LoginForm'
import Section from '../app/components/Section'
import BaseLayout from '../app/components/BaseLayout'
import { GAEvent, GAPageView } from '../app/util/ga'
import TextButton from './widgets/TextButton'

type LoginPageProps = {
  location?: {
    state?: {
      previous: string
    }
  }
}

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      display: 'flex',
      flexGrow: 1,
      '-ms-flex': '1 1 auto',
    },
    loginContainer: {
      display: 'flex',
      width: '100%',
      [theme.breakpoints.up('lg')]: {
        width: '50%',
      },
    },
    verticalAlign: {
      display: 'flex',
      width: '100%',
      [theme.breakpoints.up('lg')]: {
        alignItems: 'center',
      },
    },
    loginWrapper: {
      display: 'block',
      [theme.breakpoints.up('lg')]: {
        // Gives the contents slightly more than enough height,
        // so that validation messages do not shift the centering.
        height: '400px',
        maxHeight: '80vh',
      },
    },
    headerGroup: {
      marginBottom: theme.spacing(4),
    },
    logo: {
      maxWidth: '130px',
      width: '40%',
    },
    loginHeader: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(4),
    },
    textInputGroup: {
      marginBottom: theme.spacing(4),
    },
    graphicColorFill: {
      backgroundColor: theme.palette.primary.dark,
      width: '50vw',
      height: '100%',
      maxHeight: 'calc(100vh - 28px)',
      textAlign: 'center',
      overflow: 'hidden',
    },
    loginGraphic: {
      userDrag: 'none',
      height: '100%',
    },
    '@media screen\\0': {
      // Styles for Internet Explorer compatibility
      logoLink: {
        marginBottom: '0',
      },
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

const LoginPage: FunctionComponent<LoginPageProps> = ({
  location,
}: LoginPageProps) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const getEmailValidator = dispatch(
    loginActions.getEmailValidationGlobExpression(),
  )
  const setLoginInfoMessage = (message: string) =>
    dispatch(rootActions.setInfoMessage(message))
  const emailValidator = useSelector(
    (state: GoGovReduxState) => state.login.emailValidator,
  )
  const isLoggedIn = useSelector(
    (state: GoGovReduxState) => state.login.isLoggedIn,
  )
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const variant: VariantType = useSelector(
    (state: GoGovReduxState) => state.login.formVariant,
  )
  // Google Analytics
  useEffect(() => {
    // Filter out redirects from directory page
    // TODO (#988): Can this be fixed to cater to all routes?
    if (location?.state?.previous !== '/directory') {
      GAPageView('EMAIL LOGIN PAGE')
      GAEvent('login page', 'email')
    }
  }, [location?.state?.previous])

  // Display a login message from the server
  useEffect(() => {
    let cancelled = false
    get('/api/login/message').then((response) => {
      if (response.ok) {
        response.text().then((text) => {
          if (text && !cancelled) setLoginInfoMessage(text)
        })
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Fetch backend validation expression
  useEffect(() => {
    dispatch(loginActions.getEmailValidationGlobExpression())
    return
  }, [getEmailValidator])

  if (!isLoggedIn) {
    const variantMap = loginFormVariants.map[variant]
    const isEmailView = loginFormVariants.isEmailView(variant)
    const emailError = () => !!email && !emailValidator(email)

    const formAttr = isEmailView
      ? {
          id: 'email',
          onSubmit: (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            dispatch(loginActions.getOTPEmail(email))
            GAPageView('OTP LOGIN PAGE')
            GAEvent('login page', 'otp', 'successful')
          },
          placeholder: `e.g. ${i18next.t('general.placeholders.email')}`,
          buttonMessage: 'Sign in',
          textError: emailError,
          textErrorMessage: () =>
            emailError()
              ? `This doesn't look like a valid ${i18next.t(
                  'general.emailDomain',
                )} email.`
              : '',
          onChange: (email: string) => setEmail(email.toLowerCase()),
          variant,
          autoComplete: 'on',
          value: email,
        }
      : {
          id: 'otp',
          onSubmit: (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            dispatch(loginActions.verifyOTP(otp))
          },
          titleMessage: 'One time password',
          placeholder: 'e.g. 123456',
          buttonMessage: 'Submit',
          textError: () => false,
          textErrorMessage: () => '',
          onChange: (otp: string) => setOtp(otp),
          variant,
          autoComplete: 'off',
          value: otp,
        }

    return (
      <BaseLayout withHeader={false} withFooter={false} withLowFooter={false}>
        <div className={classes.container}>
          <div>
            <Hidden mdDown>
              <div className={classes.graphicColorFill}>
                <img
                  className={classes.loginGraphic}
                  src={LoginGraphics}
                  alt="Login page graphic"
                />
              </div>
            </Hidden>
          </div>
          <div className={classes.loginContainer}>
            <div className={classes.verticalAlign}>
              <Section>
                <section className={classes.loginWrapper}>
                  <span className={classes.headerGroup}>
                    <Link href="/#/">
                      <img
                        className={classes.logo}
                        src={GoLogo}
                        alt="GoGovSG logo"
                      />
                    </Link>
                    <Typography className={classes.loginHeader} variant="body1">
                      Only available for use by public officers with a{' '}
                      <strong>{i18next.t('general.emailDomain')}</strong> email.
                    </Typography>
                  </span>
                  <span className={classes.textInputGroup}>
                    <Typography variant="body1">
                      {isEmailView ? 'Email' : 'One-time password'}
                    </Typography>
                    {/* eslint-disable-next-line */}
                    <LoginForm {...formAttr}>
                      {isEmailView ? (
                        <TextButton
                          className={classes.secondaryButton}
                          href={i18next.t('general.links.faq')}
                        >
                          Need help?
                        </TextButton>
                      ) : (
                        <TextButton
                          className={classNames(
                            classes.secondaryButton,
                            classes.resendOTPBtn,
                          )}
                          disabled={!variantMap.resendEnabled}
                          onClick={() =>
                            dispatch(loginActions.getOTPEmail(email))
                          }
                        >
                          Resend OTP
                        </TextButton>
                      )}
                    </LoginForm>
                    {variantMap.progressBarShown ? <LinearProgress /> : null}
                  </span>
                </section>
              </Section>
            </div>
          </div>
        </div>
      </BaseLayout>
    )
  }

  if (location) {
    // ensure redirection back to directory and reset the state
    if (location?.state?.previous === '/directory') {
      // reason why we record directory here is because going into directory page will always go into login page first
      // before going into directory page
      GAEvent('directory page', 'main')
      GAPageView('DIRECTORY PAGE')
      return <Redirect to={{ pathname: DIRECTORY_PAGE, state: {} }} />
    }

    return <Redirect to={{ pathname: USER_PAGE, state: { from: location } }} />
  }
  return <Redirect to={{ pathname: USER_PAGE }} />
}

LoginPage.defaultProps = {
  location: undefined,
}

export default LoginPage
