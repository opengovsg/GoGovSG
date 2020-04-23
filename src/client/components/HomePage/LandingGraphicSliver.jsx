import React from 'react'
import { connect } from 'react-redux'
import { Trans } from 'react-i18next'
import { Link, Typography, createStyles, makeStyles } from '@material-ui/core'
import i18next from 'i18next'
import mainImage from '~/assets/landing-page-graphics/landing-main.svg'
import SectionBackground from '../SectionBackground'
import useRotatingLinks from './hooks/useRotatingLinks'

const mapStateToProps = (state) => ({
  linksToRotate: state.home.linksToRotate,
})

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      display: 'grid',
      gridTemplateRows: 'repeat(2, auto)',
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
      marginLeft: 'auto',
      // Negative margins are used for graphic to ignore app wide margins.
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
    // colorFillLayer: {
    //   gridRow: 2,
    //   gridColumn: 1,
    //   zIndex: -1,
    //   alignSelf: 'flex-end',
    // },
    rotatingLinksContainer: {
      // Alignments to align with graphic.
      display: 'flex',
      justifySelf: 'flex-end',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gridRow: 2,
      gridColumn: 1,
      marginTop: 'auto',
      height: '23.3923445%',
      width: '86.5779975%',
      maxWidth: '662.01px',
      paddingLeft: theme.spacing(4),
      [theme.breakpoints.up('sm')]: {
        paddingLeft: theme.spacing(6),
      },
      [theme.breakpoints.up('md')]: {
        paddingLeft: theme.spacing(8),
      },
      [theme.breakpoints.up('lg')]: {
        paddingLeft: theme.spacing(12),
      },
    },
    rotatingLinks: {
      fontSize: 'min(3.25vw, 26px)',
      fontWeight: 400,
      color: theme.palette.secondary.contrastText,
      opacity: 0.7,
      marginLeft: '5%',
      marginRight: '5%',
    },
  }),
)

const LandingGraphicSliver = ({ linksToRotate }) => {
  const classes = useStyles()
  const rotatingLinks = useRotatingLinks({
    linksToRotate: linksToRotate || ['go.gov.sg/whatsapp'],
    timeInternalInMs: 2500,
  })
  return (
    <SectionBackground backgroundType="dark">
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
        <section className={classes.rotatingLinksContainer}>
          <Link
            className={classes.rotatingLinks}
            href={rotatingLinks}
            underline="none"
          >
            {rotatingLinks}
          </Link>
        </section>
        {/* <span className={classes.colorFillLayer}>
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
      </span> */}
      </main>
    </SectionBackground>
  )
}

export default connect(mapStateToProps, null)(LandingGraphicSliver)
