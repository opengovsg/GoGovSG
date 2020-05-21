import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  AppBar,
  Button,
  Grid,
  Hidden,
  Toolbar,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'
import i18next from 'i18next'
import GoLogo from '~/assets/go-main-logo.svg'
import loginActions from '../../actions/login'
import Section from '../Section'
import logoutIcon from './assets/logout-icon.svg'
import helpIcon from './assets/help-icon.svg'
import feedbackIcon from './assets/feedback-icon.svg'

const useStyles = makeStyles((theme) =>
  createStyles({
    appBar: {
      zIndex: 1,
      boxShadow: 'none',
      flexShrink: 1,
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      [theme.breakpoints.up('md')]: {
        paddingTop: (props) =>
          props.isLoggedIn ? theme.spacing(2) : theme.spacing(4),
      },
      [theme.breakpoints.up('lg')]: {
        paddingTop: (props) =>
          props.isLoggedIn ? theme.spacing(2) : theme.spacing(6),
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
      order: 10,
    },
    appBarSignInBtn: {
      width: '140px',
      minWidth: '90px',
      order: 10,
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
  const theme = useTheme()
  const isMobileVariant = useMediaQuery(theme.breakpoints.down('xs'))
  const classes = useStyles({ isLoggedIn })

  const headers = [
    {
      text: 'Contribute',
      link: i18next.t('general.links.contribute'),
      public: true,
    },
    {
      text: 'FAQ',
      link: i18next.t('general.links.faq'),
      public: false,
      icon: helpIcon,
      mobileOrder: 2,
    },
    {
      text: 'Help us improve',
      link: i18next.t('general.links.contact'),
      public: false,
      icon: feedbackIcon,
      mobileOrder: 1,
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
      <Hidden xsDown>
        <strong>Sign out&nbsp;</strong>
      </Hidden>
      <img src={logoutIcon} alt="Sign out" />
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
                <Button
                  href={header.link}
                  target="_blank"
                  color="primary"
                  size="large"
                  variant="text"
                  key={header.text}
                  style={
                    isMobileVariant && header.mobileOrder
                      ? { order: header.mobileOrder }
                      : {}
                  }
                >
                  {isMobileVariant && header.icon ? (
                    <img src={header.icon} alt={header.text} />
                  ) : (
                    header.text
                  )}
                </Button>
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
