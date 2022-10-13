import React, { FunctionComponent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
import GoLogo from '@assets/go-logo-graphics/go-main-logo.svg'
import GoLogoLight from '@assets/go-logo-graphics/go-main-logo-light.svg'
import GoLogoMini from '@assets/go-logo-graphics/go-main-logo-mini.svg'
import GoLogoMiniLight from '@assets/go-logo-graphics/go-main-logo-mini-light.svg'
import helpIcon from '@assets/shared/help-icon.svg'
import logoutIcon from '@assets/components/app/base-layout/logout-icon.svg'
import logoutWhiteIcon from '@assets/components/app/base-layout/logout-white-icon.svg'
import directoryIcon from '@assets/components/app/base-layout/directory-icon.svg'
import feedbackIcon from '@assets/components/app/base-layout/feedback-icon.svg'
import githubIcon from '@assets/components/app/base-layout/github-icon.svg'
import signinIcon from '@assets/components/app/base-layout/signin-icon.svg'
import Section from '../Section'
import loginActions from '../../../login/actions'
import { GoGovReduxState } from '../../reducers/types'

type StyleProps = {
  isLoggedIn: boolean
  isLightItems: boolean
  isSticky: boolean
  toStick: boolean
}

const useStyles = makeStyles((theme) =>
  createStyles({
    appBar: {
      zIndex: 1,
      boxShadow: 'none',
      flexShrink: 1,
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      [theme.breakpoints.up('md')]: {
        paddingTop: (props: StyleProps) =>
          props.isLoggedIn ? theme.spacing(2) : theme.spacing(4),
      },
      [theme.breakpoints.up('lg')]: {
        paddingTop: (props: StyleProps) =>
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
      color: (props: StyleProps) =>
        props.isLightItems ? 'white' : theme.palette.text.primary,
      order: 10,
    },
    appBarSignInBtn: {
      width: '140px',
      minWidth: '90px',
      order: 10,
      color: (props: StyleProps) =>
        props.isLightItems ? theme.palette.text.primary : 'white',
      background: (props: StyleProps) =>
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
      [theme.breakpoints.down('xs')]: {
        paddingLeft: 0,
        paddingRight: 0,
        minWidth: theme.spacing(6),
      },
    },
    logoutIcon: {
      width: '24px',
    },
    sectionPage: {
      paddingTop: (props) => (props.isSticky && props.toStick ? '76px' : '0px'),
    },
  }),
)

type BaseLayoutHeaderProps = {
  backgroundType: string
  hideNavButtons?: boolean
  isSticky: boolean
  toStick: boolean
}

const BaseLayoutHeader: FunctionComponent<BaseLayoutHeaderProps> = ({
  backgroundType,
  hideNavButtons = false,
  isSticky,
  toStick,
}: BaseLayoutHeaderProps) => {
  const isLoggedIn = useSelector(
    (state: GoGovReduxState) => state.login.isLoggedIn,
  )
  const dispatch = useDispatch()
  const logout = () => dispatch(loginActions.logout())
  const isLightItems = backgroundType === 'darkest'
  const theme = useTheme()
  const isMobileVariant = useMediaQuery(theme.breakpoints.down('sm'))
  const classes = useStyles({ isLoggedIn, isLightItems, isSticky, toStick })
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
      text: 'API Integration',
      link: i18next.t('general.links.apiintegration'),
      public: false,
      icon: helpIcon,
      mobileOrder: 3,
      internalLink: true,
    },
    {
      text: 'Help us improve',
      link: i18next.t('general.links.contact'),
      public: false,
      icon: feedbackIcon,
      mobileOrder: 4,
    },
  ]

  const appBarBtn = isLoggedIn ? (
    <Button
      onClick={logout}
      size="large"
      color={isLightItems ? 'primary' : 'secondary'}
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
      className={classes.sectionPage}
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
                (header.public ? !isLoggedIn : isLoggedIn) && (
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

export default BaseLayoutHeader
