import React from 'react'
import { Trans } from 'react-i18next'
import {
  Button,
  Hidden,
  Link,
  Typography,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'
import Section from '../Section'
import { ApplyAppMargins, IgnoreAppRightMargins } from '../AppMargins'
import RotatingLinksGraphic from './RotatingLinksGraphic'

const useStyles = makeStyles((theme) =>
  createStyles({
    pageHeightContainer: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: `calc(100vh - 99px)`,
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      [theme.breakpoints.up('lg')]: {
        flexDirection: 'row',
      },
    },
    titleTextContainer: {
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '460px',
      marginBottom: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        minWidth: '460px',
      },
      '@media screen\\0': {
        display: 'inline',
      },
    },
    subtitleTextContainer: {
      marginTop: theme.spacing(2),
      maxWidth: '404px',
      [theme.breakpoints.up('lg')]: {
        marginTop: theme.spacing(0),
      },
    },
    rotatingLinksGraphic: {
      marginTop: theme.spacing(8),
      marginLeft: 'auto',
      [theme.breakpoints.up('xl')]: {
        marginTop: theme.spacing(0),
      },
    },
    fillColor: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: '1',
      backgroundColor: theme.palette.primary.dark,
      minHeight: '200px',
    },
    learnMoreButton: {
      height: '44px',
      width: '150px',
      marginTop: 'calc(-44px / 2)',
      backgroundColor: theme.palette.secondary.main,
      '&:hover': {
        backgroundColor: theme.palette.secondary.main,
      },
    },
    signInTextContainer: {
      display: 'flex',
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      [theme.breakpoints.up('md')]: {
        justifyContent: 'flex-start',
      },
      [theme.breakpoints.up('lg')]: {
        alignItems: 'flex-start',
      },
    },
    signInText: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  }),
)

const LandingGraphicSliver = () => {
  const classes = useStyles()
  const topPaddingMultipler = () => {
    const theme = useTheme()
    const isMediumWidth = useMediaQuery(theme.breakpoints.up('md'))
    const isDesktopWidth = useMediaQuery(theme.breakpoints.up('lg'))
    if (isMediumWidth) {
      return 1
    }
    if (isDesktopWidth) {
      return 1.75
    }
    return 0.5
  }

  return (
    <div className={classes.pageHeightContainer}>
      <Section
        backgroundType="dark"
        topMultiplier={topPaddingMultipler()}
        bottomMultiplier={0}
      >
        <div className={classes.container}>
          <div className={classes.titleTextContainer}>
            <Typography variant="h1" color="textPrimary" gutterBottom>
              <Trans>general.appCatchphrase.styled</Trans>
            </Typography>
            <Typography
              className={classes.subtitleTextContainer}
              variant="subtitle1"
              color="textPrimary"
            >
              <Trans>general.appDescription.subtitle</Trans>
            </Typography>
          </div>
          <IgnoreAppRightMargins className={classes.rotatingLinksGraphic}>
            <RotatingLinksGraphic />
          </IgnoreAppRightMargins>
        </div>
      </Section>
      <div className={classes.fillColor}>
        <Hidden mdDown>
          <ApplyAppMargins>
            <Button
              className={classes.learnMoreButton}
              variant="outlined"
              color="primary"
              size="large"
              onClick={() =>
                document
                  .getElementById('landing-bottom')
                  .scrollIntoView({ behavior: 'smooth' })
              }
            >
              Learn more
            </Button>
          </ApplyAppMargins>
        </Hidden>
        <div className={classes.signInTextContainer}>
          <ApplyAppMargins>
            <Typography
              className={classes.signInText}
              variant="subtitle1"
              color="secondary"
            >
              <Trans>general.appSignInPrompt</Trans>{' '}
              <Link href="/#/login" color="inherit" underline="always">
                Sign in
              </Link>
            </Typography>
          </ApplyAppMargins>
        </div>
      </div>
    </div>
  )
}

export default LandingGraphicSliver
