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

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      padding: theme.spacing(8, 4),
    },
    card: {
      boxShadow: 'none',
      height: '100%',
      maxWidth: '270px',
      marginTop: theme.spacing(6),
      display: 'flex',
      flexDirection: 'column',
      fill: theme.palette.primary.main,
    },
    cardContent: {
      paddingLeft: theme.spacing(0),
      paddingRight: theme.spacing(0),
    },
  }),
)

const cards = [
  {
    icon: 'lock',
    title: 'Anti-phishing',
    description: <Trans>homePage.features.antiPhishing.description</Trans>,
  },
  {
    icon: 'customize',
    title: 'Customised',
    description: <Trans>homePage.features.customised.description</Trans>,
  },
  {
    icon: 'line-chart',
    title: 'Analytics',
    description: <Trans>homePage.features.analytics.description</Trans>,
  },
]

const AppBuiltForWho = () => {
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
              <box-icon name={card.icon} size="sm" />
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

export default AppBuiltForWho
