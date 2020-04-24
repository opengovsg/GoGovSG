import React from 'react'
import { connect } from 'react-redux'
import { Trans } from 'react-i18next'
import { Typography, createStyles, makeStyles } from '@material-ui/core'
import i18next from 'i18next'
import mainImage from '~/assets/landing-page-graphics/landing-main.svg'
import Section from '../Section'
import RotatingLinks from './RotatingLinks'
import { IgnoreAppMargins } from '../AppMargins'

const mapStateToProps = (state) => ({
  linksToRotate: state.home.linksToRotate,
})

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      display: 'grid',
      gridTemplateRows: 'min-content min-content',
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
      marginLeft: 'auto',
    },
    heroImage: {
      maxWidth: '100%',
      verticalAlign: 'top',
    },
    signInPrompt: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      height: theme.spacing(12),
      marginTop: theme.spacing(4),
    },
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

  return (
    <Section backgroundType="dark">
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
        <IgnoreAppMargins className={classes.heroContainer}>
          <img
            className={classes.heroImage}
            src={mainImage}
            alt={i18next.t('general.appTitle')}
          />
        </IgnoreAppMargins>
        <section className={classes.rotatingLinksContainer}>
          <RotatingLinks
            className={classes.rotatingLinks}
            prefix={i18next.t('general.shortUrlPrefix')}
            strings={linksToRotate || ['whatsapp']}
          />
        </section>
      </main>
    </Section>
  )
}

export default connect(mapStateToProps, null)(LandingGraphicSliver)
