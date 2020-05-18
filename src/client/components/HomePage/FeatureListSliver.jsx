import React from 'react'
import { Trans } from 'react-i18next'
import {
  Card,
  CardContent,
  Grid,
  Typography,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'
import antiPhisingIcon from '~/assets/icons/anti-phishing-icon.svg'
import customisedIcon from '~/assets/icons/customised-icon.svg'
import analyticsIcon from '~/assets/icons/analytics-icon.svg'

const useStyles = makeStyles((theme) =>
  createStyles({
    grid: {
      marginTop: theme.spacing(2),
      [theme.breakpoints.up('lg')]: {
        marginTop: theme.spacing(4),
      },
      maxWidth: '1400px',
    },
    columnGrid: {
      maxWidth: 'min(600px, calc(100% + 48px))',
      [theme.breakpoints.up('lg')]: {
        maxWidth: '552px',
      },
      [theme.breakpoints.up('xl')]: {
        maxWidth: '624px',
      },
    },
    nestedGrid: {},
    card: {
      display: 'flex',
      boxShadow: 'none',
      height: '100%',
      backgroundColor: 'transparent',
      alignItems: 'flex-start',
      flexDirection: 'row',
    },
    cardVectorIcon: {
      minWidth: '50px',
      marginRight: theme.spacing(2),
      [theme.breakpoints.up('lg')]: {
        minWidth: 'auto',
        minHeight: '60px',
        marginRight: theme.spacing(4),
      },
    },
    cardContent: {
      paddingTop: theme.spacing(1),
      paddingLeft: theme.spacing(0),
      paddingRight: theme.spacing(0),
      '&:last-child': {
        paddingBottom: 0,
      },
    },
  }),
)

const columns = [
  [
    {
      icon: antiPhisingIcon,
      title: 'Anti-phishing',
      description: <Trans>homePage.features.antiPhishing.description</Trans>,
    },
    {
      icon: analyticsIcon,
      title: 'Analytics',
      description: <Trans>homePage.features.analytics.description</Trans>,
    },
  ],
  [
    {
      icon: customisedIcon,
      title: 'Customised',
      description: <Trans>homePage.features.customised.description</Trans>,
    },
  ],
]

const FeatureListSliver = () => {
  const classes = useStyles()
  const theme = useTheme()
  const isDesktopWidth = useMediaQuery(theme.breakpoints.up('lg'))
  return (
    <>
      <Typography
        variant="h2"
        color="textPrimary"
        display="inline"
        gutterBottom
      >
        Created for public officers{' '}
      </Typography>
      <Typography
        variant="body1"
        color="textPrimary"
        display="inline"
        gutterBottom
      >
        (with a gov.sg email)
      </Typography>
      <Grid
        container
        className={classes.grid}
        spacing={6}
        direction={!isDesktopWidth ? 'column' : 'row'}
        justify="space-between"
      >
        {columns.map((column) => (
          <Grid
            item
            container
            spacing={6}
            direction="column"
            className={classes.columnGrid}
          >
            {column.map((card) => (
              <Grid item key={card.title} className={classes.nestedGrid}>
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
                    <Typography color="textPrimary">
                      {card.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ))}
      </Grid>
    </>
  )
}

export default FeatureListSliver
