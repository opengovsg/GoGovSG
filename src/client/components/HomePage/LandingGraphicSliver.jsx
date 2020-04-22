import React from 'react'
import { Trans } from 'react-i18next'
import { Link, Typography, createStyles, makeStyles } from '@material-ui/core'
import i18next from 'i18next'
import mainImage from '~/assets/landing-page-graphics/landing-main.svg'
import SectionBackground from '../SectionBackground'

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      display: 'grid',
      gridTemplateRows: 'repeat(2, auto)',
      marginTop: theme.spacing(6),
    },
    titleTextContainer: {
      gridRow: 1,
      gridColumn: 1,
      display: 'grid',
      gridGap: theme.spacing(3),
      marginBottom: theme.spacing(8),
    },
    heroContainer: {
      gridRow: 2,
      gridColumn: 1,
      maxWidth: '100%',
      marginBottom: theme.spacing(12),
      marginLeft: 'auto',
      marginRight: theme.spacing(-4),
      [theme.breakpoints.up('sm')]: {
        marginRight: theme.spacing(-6),
      },
      [theme.breakpoints.up('md')]: {
        marginRight: theme.spacing(-8),
      },
      [theme.breakpoints.up('lg')]: {
        marginRight: theme.spacing(-12),
      },
    },
    signInPrompt: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      height: theme.spacing(12),
      marginTop: theme.spacing(4),
    },
    colorFillLayer: {
      gridRow: 2,
      gridColumn: 1,
      zIndex: -1,
      alignSelf: 'flex-end',
    },
  }),
)

const LandingGraphicSliver = () => {
  const classes = useStyles()
  return (
    <main className={classes.container}>
      <section>
        <span className={classes.titleTextContainer}>
          <Typography variant="h1" color="textPrimary" gutterBottom>
            <Trans>general.appCatchphrase.styled</Trans>
          </Typography>
          <Typography variant="subtitle1" color="textPrimary">
            <Trans>general.appDescription.subtitle</Trans>
          </Typography>
        </span>
      </section>
      <img
        className={classes.heroContainer}
        src={mainImage}
        alt={i18next.t('general.appTitle')}
      />
      <span className={classes.colorFillLayer}>
        <SectionBackground backgroundType="primaryDark" isSliver={false}>
          <span className={classes.signInPrompt}>
            <Typography variant="body2" color="secondary">
              <Trans>general.appSignInPrompt</Trans>{' '}
              <Link href="/#/login" color="secondary" underline="always">
                Sign in
              </Link>
            </Typography>
          </span>
        </SectionBackground>
      </span>
    </main>
  )
}

export default LandingGraphicSliver
