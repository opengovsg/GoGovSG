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
  useMediaQuery,
  useTheme,
} from '@material-ui/core'
import i18next from 'i18next'
import GoLogo from '~/assets/go-main-logo.svg'
import GoLogoLight from '~/assets/go-main-logo-light.svg'
import GoLogoMini from '~/assets/go-main-logo-mini.svg'
import GoLogoMiniLight from '~/assets/go-main-logo-mini-light.svg'
import loginActions from '../../actions/login'
import Section from '../Section'
import logoutIcon from './assets/logout-icon.svg'
import logoutWhiteIcon from './assets/logout-white-icon.svg'
import helpIcon from '../../assets/help-icon.svg'
import directoryIcon from './assets/directory-icon.svg'
import feedbackIcon from './assets/feedback-icon.svg'
import githubIcon from './assets/github-icon.svg'
import signinIcon from './assets/signin-icon.svg'

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
      // fill: theme.palette.primary.main,
      color: (props) => (props.isLightItems ? 'white' : '#384A51'),
      order: 10,
    },
    appBarSignInBtn: {
      width: '140px',
      minWidth: '90px',
      order: 10,
      color: (props) => (props.isLightItems ? '#384A51' : 'white'),
      background: (props) =>
        props.isLightItems ? 'white' : theme.palette.primary.main,
    },
    signInIcon: {
      paddingLeft: theme.spacing(0.5),
    },
    toolbarLogo: {
      maxWidth: '130px',
      width: '40%',
    },
    logo: {
      display: 'flex',
      width: '100%',
      height: '100%',
      [theme.breakpoints.down('sm')]: {
        width: 'auto',
      },
    },
    headerButton: {
      filter: (props) => (props.isLightItems ? 'brightness(10)' : ''),
      // this class is not mobile first by default as padding should not be set
      // when it is not mobile.
      [theme.breakpoints.down('xm')]: {
        paddingLeft: 0,
        paddingRight: 0,
        minWidth: theme.spacing(6),
      },
    },
    logoutIcon: {
      width: '24px',
    sectionPageSticky: {
      paddingTop: '43px',
    },
    sectionPage: {
      paddingTop: '0px',
    },
  }),
)

const mapStateToProps = (state) => ({
  isLoggedIn: state.login.isLoggedIn,
})

const mapDispatchToProps = (dispatch) => ({
  logout: () => dispatch(loginActions.logout()),
})

const BaseLayoutHeader = ({
  backgroundType,
  isLoggedIn,
  logout,
  hideNavButtons,
  isSticky,
}) => {
  const isLightItems = backgroundType === 'darkest'
  const theme = useTheme()
  const isMobileVariant = useMediaQuery(theme.breakpoints.down('sm'))
  const classes = useStyles({ isLoggedIn, isLightItems })

  const headers = [
    {
      text: 'Directory',
      link: i18next.t('general.links.directory'),
      public: false,
      icon: directoryIcon,
      mobileOrder: 1,
      internalLink: true,
    },
    {
      text: 'Contribute',
      link: i18next.t('general.links.contribute'),
      public: true,
      icon: githubIcon,
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
      mobileOrder: 3,
    },
  ]

  const appBarBtn = isLoggedIn ? (
    <Button
      onClick={logout}
      size="large"
      color={isLightItems ? 'primary' : 'white'}
      variant="text"
      className={classes.appBarSignOutBtn}
    >
      <Hidden xsDown>
        <strong>Sign out&nbsp;</strong>
      </Hidden>
      {isLightItems ? (
        <img
          className={classes.logoutIcon}
          src={logoutWhiteIcon}
          alt="Sign out"
        />
      ) : (
        <img className={classes.logoutIcon} src={logoutIcon} alt="Sign out" />
      )}
    </Button>
  ) : (
    <>
      <Hidden smDown>
        <Button
          href="/#/login"
          size="large"
          variant="contained"
          color={isLightItems ? 'default' : 'primary'}
          className={classes.appBarSignInBtn}
        >
          Sign in
        </Button>
      </Hidden>
      <Hidden mdUp>
        <Button href="/#/login" size="large" className={classes.headerButton}>
          Sign in
          <img
            src={signinIcon}
            alt="Sign in icon"
            className={classes.signInIcon}
            aria-hidden
          />
        </Button>
      </Hidden>
    </>
  )

  const getGoLogo = () => {
    if (isLightItems && isMobileVariant) {
      return GoLogoMiniLight
    }
    if (isLightItems) {
      return GoLogoLight
    }
    if (!isLightItems && isMobileVariant) {
      return GoLogoMini
    }
    return GoLogo
  }

  return (
    <Section
      backgroundType={backgroundType}
      verticalMultiplier={0}
      shadow={!isLoggedIn && isMobileVariant}
      className={isSticky ? classes.sectionPageSticky : classes.sectionPage}
    >
      <AppBar position="static" color="transparent" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <a href="/#/" className={classes.toolbarLogo}>
            <img
              src={getGoLogo()}
              className={classes.logo}
              alt="GoGovSG Logo"
            />
          </a>
          <span className={classes.rowSpace} />
          {!hideNavButtons &&
            headers.map(
              (header) =>
                (header.public ? !isLoggedIn : isLoggedIn) &&
                !header.hidden && (
                  <Button
                    href={
                      header.internalLink ? `/#${header.link}` : header.link
                    }
                    target={header.internalLink ? '' : '_blank'}
                    color="primary"
                    size="large"
                    variant="text"
                    key={header.text}
                    className={classes.headerButton}
                    style={
                      isMobileVariant && header.mobileOrder
                        ? { order: header.mobileOrder }
                        : {}
                    }
                  >
                    {isMobileVariant && header.icon && (
                      <img src={header.icon} alt={header.text} />
                    )}
                    {isMobileVariant && header.component}
                    {!isMobileVariant && header.text}
                  </Button>
                ),
            )}
          {!hideNavButtons && appBarBtn}
        </Toolbar>
      </AppBar>
    </Section>
  )
}

BaseLayoutHeader.propTypes = {
  backgroundType: PropTypes.string.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired,
  hideNavButtons: PropTypes.bool,
  isSticky: PropTypes.bool,
}

BaseLayoutHeader.defaultProps = {
  hideNavButtons: false,
  isSticky: false,
}

export default connect(mapStateToProps, mapDispatchToProps)(BaseLayoutHeader)
