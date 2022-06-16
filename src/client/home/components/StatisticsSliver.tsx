import React, { FunctionComponent, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import i18next from 'i18next'
import {
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'

import homeActions from '../actions'
import numberFormatter from '../../app/util/format'
import StatisticsGraphic from './StatisticsGraphic'
import { GoGovReduxState } from '../../app/reducers/types'

const useStyles = makeStyles((theme) =>
  createStyles({
    grid: {
      marginTop: theme.spacing(5),
    },
    card: {
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 'none',
      height: '100%',
      backgroundColor: 'transparent',
      alignItems: 'flex-start',
      maxWidth: '400px',
      [theme.breakpoints.up('md')]: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        width: '600px',
      },
      [theme.breakpoints.up('lg')]: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        width: '350px',
      },
    },
    cardContent: {
      paddingTop: theme.spacing(0),
      paddingLeft: theme.spacing(0),
      paddingRight: theme.spacing(0),
      '&:last-child': {
        paddingBottom: 0,
      },
      [theme.breakpoints.up('md')]: {
        paddingTop: theme.spacing(0),
      },
    },
    statsLabel: {
      marginTop: theme.spacing(2),
    },
    getStartedButton: {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        width: '150px',
      },
    },
    stats: {
      flexGrow: 0.8,
      width: '384px',
      maxWidth: '800px',
    },
  }),
)

const StatisticsSliver: FunctionComponent = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const loadStats = () => dispatch(homeActions.loadStats())
  const statistics = useSelector(
    (state: GoGovReduxState) => state.home.statistics,
  )
  const { userCount, linkCount, clickCount } = statistics
  // ensure number will never be null
  const statisticsToShow = [
    {
      label: `${i18next.t('general.officerType').toUpperCase()} ONBOARD`,
      number: userCount,
    },
    { label: 'SHORT LINKS CREATED', number: linkCount },
    { label: 'CLICKS', number: clickCount },
  ]

  // Call once
  useEffect(() => {
    loadStats()
  }, [])

  return (
    <>
      <Typography variant="h3" color="textPrimary">
        The official link shortener for {i18next.t('general.linkAdmins')}
      </Typography>
      <Grid container className={classes.grid} spacing={2}>
        <Grid
          container
          item
          spacing={6}
          direction="column"
          className={classes.stats}
        >
          {statisticsToShow.map((stat) => (
            <Grid item key={stat.label}>
              <Card className={classes.card}>
                <CardContent className={classes.cardContent}>
                  <Typography color="primary" variant="h4">
                    <strong>{numberFormatter.format(stat.number)}</strong>
                  </Typography>
                  <Typography
                    className={classes.statsLabel}
                    variant="body2"
                    color="textPrimary"
                  >
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item>
            <Button
              className={classes.getStartedButton}
              href="/#/login"
              size="medium"
              color="primary"
              variant="contained"
            >
              Get started
            </Button>
          </Grid>
        </Grid>
        <Grid item>
          <StatisticsGraphic />
        </Grid>
      </Grid>
    </>
  )
}

export default StatisticsSliver
