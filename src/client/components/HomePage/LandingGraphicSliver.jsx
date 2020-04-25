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
    },
    titleTextContainer: {
      gridRow: 1,
      gridColumn: 1,
      display: 'grid',
      gridGap: theme.spacing(3),
      marginBottom: theme.spacing(8),
    },
  }),
)

const LandingGraphicSliver = () => {
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
        <IgnoreAppRightMargins>
          <RotatingLinksGraphic />
        </IgnoreAppRightMargins>
      </main>
    </Section>
  )
}

export default LandingGraphicSliver
