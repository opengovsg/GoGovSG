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
import loginActions from '../../actions/login'
import Section from '../Section'
import logoutIcon from './assets/logout-icon.svg'
import helpIcon from '../../assets/help-icon.svg'
import feedbackIcon from './assets/feedback-icon.svg'
import githubIcon from './assets/github-icon.svg'
import signinIcon from './assets/signin-icon.svg'
import { SEARCH_PAGE } from '../../util/types'
import SearchIcon from '../widgets/SearchIcon'
import { IS_SEARCH_HIDDEN } from '../../util/config'

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
    },
    headerButton: {
      filter: (props) => (props.isLightItems ? 'brightness(10)' : ''),
      // this class is not mobile first by default as padding should not be set
      // when it is not mobile.
      [theme.breakpoints.down('xs')]: {
        paddingLeft: 0,
        paddingRight: 0,
        minWidth: theme.spacing(6),
      },
    },
  }),
)

const mapStateToProps = (state) => ({
  isLoggedIn: state.login.isLoggedIn,
})

const mapDispatchToProps = (dispatch) => ({
  logout: () => dispatch(loginActions.logout()),
})

const BaseLayoutHeader = ({ backgroundType, isLoggedIn, logout, hideAuth }) => {
  const isLightItems = backgroundType === 'darkest'
  const theme = useTheme()
  const isMobileVariant = useMediaQuery(theme.breakpoints.down('sm'))
  const classes = useStyles({ isLoggedIn, isLightItems })

  const headers = [
    {
      text: 'GoSearch',
      link: SEARCH_PAGE,
      internalLink: true,
      public: true,
      component: <SearchIcon size={24} />,
      hidden: IS_SEARCH_HIDDEN,
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

  return (
    <Section
      backgroundType={backgroundType}
      verticalMultiplier={0}
      shadow={!isLoggedIn && isMobileVariant}
    >
      <AppBar position="static" color="transparent" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <a href="/#/" className={classes.toolbarLogo}>
            <img
              src={isLightItems ? GoLogoLight : GoLogo}
              className={classes.logo}
              alt="GoGovSG Logo"
            />
          </a>
          <span className={classes.rowSpace} />
          {headers.map(
            (header) =>
              (header.public ? !isLoggedIn : isLoggedIn) &&
              !header.hidden && (
                <Button
                  href={header.internalLink ? `/#${header.link}` : header.link}
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
          {!hideAuth && appBarBtn}
        </Toolbar>
      </AppBar>
    </Section>
  )
}

BaseLayoutHeader.propTypes = {
  backgroundType: PropTypes.string.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired,
  hideAuth: PropTypes.bool,
}

BaseLayoutHeader.defaultProps = {
  hideAuth: false,
}

export default connect(mapStateToProps, mapDispatchToProps)(BaseLayoutHeader)
