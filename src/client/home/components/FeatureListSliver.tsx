import React from 'react'
import i18next from 'i18next'
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
import antiPhishingIcon from '@assets/components/home/feature-list-sliver/home-page-anti-phishing-icon.svg'
import customisedIcon from '@assets/components/home/feature-list-sliver/home-page-customised-icon.svg'
import analyticsIcon from '@assets/components/home/feature-list-sliver/home-page-analytics-icon.svg'
import fileSharingIcon from '@assets/components/home/feature-list-sliver/home-page-file-sharing-icon.svg'

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

const FeatureListSliver = () => {
  const classes = useStyles()
  const theme = useTheme()
  const isDesktopWidth = useMediaQuery(theme.breakpoints.up('lg'))
  const columns = [
    {
      id: 1,
      data: [
        {
          icon: antiPhishingIcon,
          title: 'Anti-phishing',
          description: i18next.t('homePage.features.antiPhishing.description'),
        },
        {
          icon: fileSharingIcon,
          title: 'File sharing',
          description: i18next.t('homePage.features.fileSharing.description'),
        },
      ],
    },
    {
      id: 2,
      data: [
        {
          icon: customisedIcon,
          title: 'Customised',
          description: i18next.t('homePage.features.customised.description'),
        },
        {
          icon: analyticsIcon,
          title: 'Analytics',
          description: i18next.t('homePage.features.analytics.description'),
        },
      ],
    },
  ]

  return (
    <>
      <Typography
        variant="h3"
        color="textPrimary"
        display="inline"
        gutterBottom
      >
        Created for {i18next.t('general.officerType')} officers{' '}
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
        (with an email from {i18next.t('general.emailDomain')})
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
            key={column.id}
            item
            container
            spacing={6}
            direction="column"
            className={classes.columnGrid}
          >
            {column.data.map((card) => (
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
