import React from 'react'
import { Trans } from 'react-i18next'
import i18next from 'i18next'
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
    header: {
      textAlign: 'center',
    },
    card: {
      boxShadow: 'none',
      height: '100%',
      maxWidth: '270px',
      marginTop: theme.spacing(6),
      marginLeft: theme.spacing(4),
      marginRight: theme.spacing(4),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      fill: theme.palette.primary.main,
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
      <header className={classes.header}>
        <Typography variant="h2" color="textPrimary" gutterBottom>
          Created for public officers
        </Typography>
        <Typography variant="caption" color="textPrimary" gutterBottom>
          (with {i18next.t('general.emailDomain')} emails)
        </Typography>
      </header>
      <Grid container justify="center">
        {cards.map((card) => (
          <Grid item key={card.title}>
            <Card className={classes.card}>
              <box-icon name={card.icon} size="sm" />
              <CardContent>
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
