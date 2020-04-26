import React from 'react'
import { Trans } from 'react-i18next'
import { Typography, createStyles, makeStyles } from '@material-ui/core'
import Section from '../Section'
import { IgnoreAppRightMargins } from '../AppMargins'
import RotatingLinksGraphic from './RotatingLinksGraphic'

const useStyles = makeStyles((theme) =>
  createStyles({
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
      maxWidth: '532px',
      marginBottom: theme.spacing(8),
      '@media screen\\0': {
        display: 'inline',
      },
    },
    rotatingLinksGraphic: {
      marginLeft: 'auto',
    },
  }),
)

const LandingGraphicSliver = () => {
  const classes = useStyles()

  return (
    <Section backgroundType="dark">
      <main className={classes.container}>
        <div className={classes.titleTextContainer}>
          <Typography variant="h1" color="textPrimary" gutterBottom>
            <Trans>general.appCatchphrase.styled</Trans>
          </Typography>
          <Typography variant="subtitle1" color="textPrimary">
            <Trans>general.appDescription.subtitle</Trans>
          </Typography>
        </div>
        <IgnoreAppRightMargins className={classes.rotatingLinksGraphic}>
          <RotatingLinksGraphic />
        </IgnoreAppRightMargins>
      </main>
    </Section>
  )
}

export default LandingGraphicSliver
