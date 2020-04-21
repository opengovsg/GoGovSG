import React from 'react'
import { Trans } from 'react-i18next'
import {
  Card,
  CardContent,
  Grid,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import antiPhisingIcon from '~/assets/icons/anti-phishing-icon.svg'
import customisedIcon from '~/assets/icons/customised-icon.svg'
import analyticsIcon from '~/assets/icons/analytics-icon.svg'

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      padding: theme.spacing(8, 4),
    },
    card: {
      boxShadow: 'none',
      height: '100%',
      marginTop: theme.spacing(6),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      fill: theme.palette.primary.main,
    },
    cardVectorIcon: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      minHeight: '70px',
    },
    cardContent: {
      paddingLeft: theme.spacing(0),
      paddingRight: theme.spacing(0),
    },
  }),
)

const cards = [
  {
    icon: antiPhisingIcon,
    title: 'Anti-phishing',
    description: <Trans>homePage.features.antiPhishing.description</Trans>,
  },
  {
    icon: customisedIcon,
    title: 'Customised',
    description: <Trans>homePage.features.customised.description</Trans>,
  },
  {
    icon: analyticsIcon,
    title: 'Analytics',
    description: <Trans>homePage.features.analytics.description</Trans>,
  },
]

const FeatureListSliver = () => {
  const classes = useStyles()
  return (
    <main className={classes.container}>
      <Typography variant="h2" color="textPrimary" gutterBottom>
        The official link shortener for the Singapore government
      </Typography>
      <Grid container>
        {cards.map((card) => (
          <Grid item key={card.title}>
            <Card className={classes.card}>
              <img
                className={classes.cardVectorIcon}
                src={card.icon}
                alt={card.title}
              />
              <CardContent className={classes.cardContent}>
                <Typography color="primary" variant="h3" gutterBottom>
                  <strong>{card.title}</strong>
                </Typography>
                <Typography color="textPrimary">{card.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </main>
  )
}

export default FeatureListSliver
