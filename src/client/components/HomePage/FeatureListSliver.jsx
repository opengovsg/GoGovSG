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

// Grid configurations used by FeatureListSliver.
// To be used by other components which are aligning to it.
export const featureCardGridConfiguration = (theme) => {
  return {
    display: 'grid',
    gridTemplateRows: 'repeat(3, 1fr)',
    gridGap: theme.spacing(6),
    marginTop: theme.spacing(6),
    [theme.breakpoints.up('md')]: {
      gridTemplateColumns: 'repeat(auto-fit, 320px)',
      gridGap: theme.spacing(8),
    },
  }
}

const useStyles = makeStyles((theme) =>
  createStyles({
    cardGrid: {
      ...featureCardGridConfiguration,
    },
    card: {
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 'none',
      height: '100%',
      backgroundColor: 'transparent',
      alignItems: 'flex-start',
      [theme.breakpoints.up('md')]: {
        flexDirection: 'row',
        alignItems: 'flex-start',
      },
    },
    cardVectorIcon: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      minWidth: '50px',
      [theme.breakpoints.up('sm')]: {
        marginRight: theme.spacing(4),
      },
    },
    cardContent: {
      paddingTop: theme.spacing(4),
      paddingLeft: theme.spacing(0),
      paddingRight: theme.spacing(0),
      '&:last-child': {
        paddingBottom: 0,
      },
      [theme.breakpoints.up('md')]: {
        paddingTop: theme.spacing(0),
      },
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
    <>
      <Typography variant="h2" color="textPrimary" gutterBottom>
        The official link shortener for the Singapore government
      </Typography>
      <Grid container className={classes.cardGrid}>
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
    </>
  )
}

export default FeatureListSliver
