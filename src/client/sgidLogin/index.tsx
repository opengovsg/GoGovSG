import React, { useEffect } from 'react'
import i18next from 'i18next'
import {
  Button,
  Hidden,
  Link,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import GoLogo from '@assets/go-logo-graphics/go-main-logo.svg'
import LoginGraphics from '@assets/login-page-graphics/login-page-graphics.svg'
import { useDispatch } from 'react-redux'
import rootActions from '../app/components/pages/RootPage/actions'

import assetVariant from '../../shared/util/asset-variant'

import { htmlSanitizer } from '../app/util/format'
import Section from '../app/components/Section'
import BaseLayout from '../app/components/BaseLayout'
import { get } from '../app/util/requests'

const URL_PREFIX_LENGTH = '#/ogp-login'.length

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
    signInButton: {
      width: '250px',
      minWidth: '120px',
      marginRight: theme.spacing(2),
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
    },
    loginReferral: {
      fontSize: '0.85rem',
      color: '#767676',
      marginBottom: theme.spacing(4),
    },
    graphicColorFill: {
      backgroundColor: theme.palette.primary.dark,
      width: '50vw',
      height: '100%',
      // allocates space for the government masthead when on gov variant
      maxHeight: assetVariant === 'gov' ? 'calc(100vh - 28px)' : '100vh',
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
  }),
)

const SgidLoginPage = (): JSX.Element => {
  const dispatch = useDispatch()
  const classes = useStyles()
  const queryParams = new URLSearchParams(
    new URL(window.location.href).hash.substring(URL_PREFIX_LENGTH),
  )

  const setLoginStatusMessage = (message: string) =>
    dispatch(rootActions.setInfoMessage(message))

  useEffect(() => {
    const officerEmail = queryParams.get('officerEmail')
    const statusCode = queryParams.get('statusCode')
    if (officerEmail) {
      setLoginStatusMessage(
        `${officerEmail} doesn't look like a valid ${i18next.t(
          'general.emailDomain',
        )} email.`,
      )
    } else if (statusCode) {
      setLoginStatusMessage(
        `Unable to fetch a valid work email for authentication.`,
      )
    }
  }, [])

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
                  <Typography
                    className={classes.loginHeader}
                    variant="body1"
                    dangerouslySetInnerHTML={{
                      __html: htmlSanitizer(i18next.t('login.whitelistPhrase')),
                    }}
                  >
                    {/* <text ></text> NOTE: dangerouslySetInnerHTML is used as copy includes <a href></a> tag */}
                  </Typography>
                  <Typography className={classes.loginReferral} variant="body1">
                    {i18next.t('login.referrals.1.officerPhrase')} can use their{' '}
                    {i18next.t('login.referrals.1.emailDomain')} emails at{' '}
                    <Link
                      href={`https://${i18next.t('login.referrals.1.link')}`}
                    >
                      {i18next.t('login.referrals.1.link')}
                    </Link>
                    , and {i18next.t('login.referrals.2.officerPhrase')} can use
                    their {i18next.t('login.referrals.2.emailDomain')} emails at{' '}
                    <Link
                      href={`https://${i18next.t('login.referrals.2.link')}`}
                    >
                      {i18next.t('login.referrals.2.link')}
                    </Link>{' '}
                    to shorten links.
                  </Typography>
                  <Button
                    className={classes.signInButton}
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={() => {
                      get('/api/sgidLogin/authurl').then(async (response) => {
                        if (response.ok) {
                          const text = await response.text()
                          window.open(text, '_self')
                        }
                      })
                    }}
                  >
                    Log in with Singpass app
                  </Button>
                </span>
              </section>
            </Section>
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}

export default SgidLoginPage
