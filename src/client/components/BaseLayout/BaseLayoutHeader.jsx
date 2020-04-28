import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  AppBar,
  Button,
  Hidden,
  Toolbar,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import i18next from 'i18next'
import GoLogo from '~/assets/go-main-logo.png'
import loginActions from '~/actions/login'
import Section from '../Section'

const useStyles = makeStyles((theme) =>
  createStyles({
    appBar: {
      zIndex: '1',
      boxShadow: 'none',
      flexShrink: 1,
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      [theme.breakpoints.up('md')]: {
        paddingTop: theme.spacing(4),
      },
      [theme.breakpoints.up('lg')]: {
        paddingTop: theme.spacing(6),
      },
    },
    toolbar: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingLeft: theme.spacing(0),
      paddingRight: theme.spacing(0),
    },
    rowSpace: {
      flexGrow: 0.85,
    },
    appBarSignOutBtn: {
      fill: theme.palette.primary.main,
    },
    appBarSignInBtn: {
      flexGrow: '0.05',
      minWidth: '90px',
    },
    toolbarLogo: {
      maxWidth: '130px',
      width: '40%',
    },
    logo: {
      display: 'flex',
      width: '100%',
      height: '100%',
    },
  }),
)

const mapStateToProps = (state) => ({
  isLoggedIn: state.login.isLoggedIn,
})

const mapDispatchToProps = (dispatch) => ({
  logout: () => dispatch(loginActions.logout()),
})

const BaseLayoutHeader = ({ backgroundType, isLoggedIn, logout }) => {
  const classes = useStyles()

  const headers = [
    {
      text: 'Contribute',
      link: i18next.t('general.links.contribute'),
      public: true,
      xsHidden: true,
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
    <Section backgroundType={backgroundType} verticalMultiplier={0}>
      <AppBar position="static" color="transparent" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <a href="/#/" className={classes.toolbarLogo}>
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
    </Section>
  )
}

BaseLayoutHeader.propTypes = {
  backgroundType: PropTypes.string.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(BaseLayoutHeader)
