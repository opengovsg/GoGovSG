import React from 'react'
import { Trans } from 'react-i18next'
import {
  Card,
  CardContent,
  Grid,
  Hidden,
  Typography,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'
import antiPhisingIcon from '../../app/assets/icons/home-page-anti-phishing-icon.svg'
import customisedIcon from '../../app/assets/icons/home-page-customised-icon.svg'
import analyticsIcon from '../../app/assets/icons/home-page-analytics-icon.svg'
import fileSharingIcon from '../../app/assets/icons/home-page-file-sharing-icon.svg'

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
      icon: fileSharingIcon,
      title: 'File sharing',
      description: <Trans>homePage.features.fileSharing.description</Trans>,
    },
  ],
  [
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
  ],
]

const FeatureListSliver = () => {
  const classes = useStyles()
  const theme = useTheme()
  const isDesktopWidth = useMediaQuery(theme.breakpoints.up('lg'))
  return (
    <>
      <Typography
        variant="h3"
        color="textPrimary"
        display="inline"
        gutterBottom
      >
        Created for public officers{' '}
      </Typography>
      <Hidden smUp>
        <br />
      </Hidden>
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
              <Grid item key={card.title}>
                <Card className={classes.card}>
                  <img
                    className={classes.cardVectorIcon}
                    src={card.icon}
                    alt={card.title}
                  />
                  <CardContent className={classes.cardContent}>
                    <Typography color="primary" variant="h4" gutterBottom>
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
