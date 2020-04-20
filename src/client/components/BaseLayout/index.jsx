import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import 'boxicons'
import AppBar from '@material-ui/core/AppBar'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import Grid from '@material-ui/core/Grid'
import Hidden from '@material-ui/core/Hidden'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import { withStyles } from '@material-ui/core/styles'
import i18next from 'i18next'
import { Trans } from 'react-i18next'
import baseLayoutStyle from '~/styles/baseLayout'
import loginActions from '~/actions/login'
import Masthead from '~/components/Masthead'
import GoLogo from '~/assets/go-main-logo.png'
import BuiltByImg from '~/assets/built-by.png'

const mapStateToProps = (state) => ({
  isLoggedIn: state.login.isLoggedIn,
})

const mapDispatchToProps = (dispatch) => ({
  logout: () => dispatch(loginActions.logout()),
})

const BaseLayout = ({ classes, children, isLoggedIn, logout }) => {
  const headers = [
    {
      text: 'Contribute',
      link: i18next.t('general.links.contribute'),
      public: true,
      xsHidden: false,
    },
    {
      text: 'FAQ',
      link: i18next.t('general.links.faq'),
      public: false,
      xsHidden: true,
    },
    {
      text: 'Help us improve',
      link: i18next.t('general.links.contact'),
      public: false,
      xsHidden: true,
    },
  ]
  const footers = [
    { text: 'FAQ', link: i18next.t('general.links.faq') },
    {
      text: 'Help us improve',
      link: i18next.t('general.links.contact'),
    },
    { text: 'Privacy', link: i18next.t('general.links.privacy') },
    { text: 'Terms of Use', link: i18next.t('general.links.terms') },
  ]
  const appBarBtn = isLoggedIn ? (
    <Button
      onClick={logout}
      size="large"
      color="primary"
      variant="text"
      className={classes.appBarSignOutBtn}
    >
      <strong>Sign out&nbsp;</strong>
      <box-icon name="log-out-circle" />
    </Button>
  ) : (
    <Button
      href="/#/login"
      size="large"
      color="primary"
      variant="contained"
      className={classes.appBarSignInBtn}
    >
      Sign in
    </Button>
  )

  return (
    <>
      <CssBaseline />
      <Masthead />
      <AppBar
        position="static"
        color={isLoggedIn ? 'primary' : 'transparent'}
        className={classes.appBar}
      >
        <Toolbar className={classes.toolbar}>
          <a href="/#" className={classes.toolbarLogo}>
            <img src={GoLogo} className={classes.logo} alt="GoGovSG Logo" />
          </a>
          <span className={classes.rowSpace} />
          {headers.map(
            (header) =>
              (header.public ? !isLoggedIn : isLoggedIn) && (
                <Hidden xsDown={header.xsHidden} key={header.text}>
                  <Button
                    href={header.link}
                    target="_blank"
                    color="primary"
                    size="large"
                    variant="text"
                  >
                    {header.text}
                  </Button>
                </Hidden>
              ),
          )}
          {appBarBtn}
        </Toolbar>
      </AppBar>
      <main className={classes.layout}>{children}</main>
      {/* Footer */}
      <footer className={classes.footer}>
        <div>
          <Typography
            variant="body2"
            color="textPrimary"
            className={classes.footerTitle}
          >
            <strong>{i18next.t('general.appTitle')}</strong>
          </Typography>
          <Typography variant="body1" display="inline" color="textPrimary">
            <Trans>general.appCatchphrase.noStyle</Trans>
          </Typography>
          <Grid container spacing={2} className={classes.subfooter}>
            <Hidden smDown>
              <Grid item>
                <Typography variant="caption" color="textPrimary" gutterBottom>
                  {i18next.t('general.copyright')}
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="caption" color="textPrimary" gutterBottom>
                  |
                </Typography>
              </Grid>
            </Hidden>
            {footers.map((footer) => (
              <Grid item key={footer.text} className={classes.footerItem}>
                <Typography variant="caption" gutterBottom>
                  <Link
                    className={classes.footerLink}
                    color="primary"
                    target="_blank"
                    href={footer.link}
                  >
                    {footer.text}
                  </Link>
                </Typography>
              </Grid>
            ))}
          </Grid>
        </div>
        <Link
          className={classes.builtByLink}
          href={i18next.t('general.links.builtBy')}
          target="_blank"
        >
          <img
            src={BuiltByImg}
            className={classes.builtByImg}
            alt={i18next.t('general.builtBy')}
          />
        </Link>
        <Hidden mdUp>
          <Typography variant="caption" color="textSecondary" gutterBottom>
            {i18next.t('general.copyright')}
          </Typography>
        </Hidden>
      </footer>
      {/* End footer */}
    </>
  )
}

BaseLayout.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  children: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired,
}

export default withStyles(baseLayoutStyle)(
  connect(mapStateToProps, mapDispatchToProps)(BaseLayout),
)
