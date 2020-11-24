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
import Section from '../../app/components/Section'
import {
  ApplyAppMargins,
  IgnoreAppRightMargins,
} from '../../app/components/AppMargins'
import RotatingLinksGraphic from './RotatingLinksGraphic'

const useStyles = makeStyles((theme) =>
  createStyles({
    pageHeightContainer: {
      display: 'flex',
      flexDirection: 'column',
      [theme.breakpoints.up('md')]: {
        minHeight: `calc(100vh - ${theme.spacing(4) + 108}px)`,
      },
      [theme.breakpoints.up('lg')]: {
        minHeight: `calc(100vh - ${theme.spacing(6) + 108}px)`,
      },
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
      maxWidth: '485px',
      marginBottom: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        minWidth: '500px',
      },
      '@media screen\\0': {
        display: 'inline',
      },
    },
    titleText: {
      fontWeight: 500,
    },
    subtitleText: {
      marginTop: theme.spacing(2),
      maxWidth: '404px',
    },
    rotatingLinksGraphic: {
      marginTop: theme.spacing(4),
      marginLeft: 'auto',
      [theme.breakpoints.up('lg')]: {
        marginTop: theme.spacing(0),
      },
    },
    fillColor: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      backgroundColor: theme.palette.primary.dark,
      maxHeight: '30vw',
      minHeight: '150px',
      [theme.breakpoints.up('sm')]: {
        minHeight: '200px',
      },
    },
    learnMoreButton: {
      height: '44px',
      width: '150px',
      // Creates the half in colour-fill, half outside it effect.
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
        marginTop: theme.spacing(2),
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
  const useTopPaddingMultipler = () => {
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
        backgroundType="light"
        topMultiplier={useTopPaddingMultipler()}
        bottomMultiplier={0}
      >
        <div className={classes.container}>
          <div className={classes.titleTextContainer}>
            <Typography
              variant="h1"
              color="textPrimary"
              gutterBottom
              className={classes.titleText}
            >
              <Trans>general.appCatchphrase.styled</Trans>
            </Typography>
            <Typography
              className={classes.subtitleText}
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
                document.getElementById('landing-bottom')?.scrollIntoView({ behavior: 'smooth' })
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
              variant="caption"
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
