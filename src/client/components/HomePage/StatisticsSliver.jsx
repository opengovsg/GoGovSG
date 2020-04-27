import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import {
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'

import homeActions from '~/actions/home'
import numberFormatter from '~/util/format'

const mapDispatchToProps = (dispatch) => ({
  loadStats: () => dispatch(homeActions.loadStats()),
})

const mapStateToProps = (state, ownProps) => ({
  onCreateUrl: ownProps.onCreateUrl,
  history: ownProps.history,
  statistics: state.home.statistics,
})

const useStyles = makeStyles((theme) =>
  createStyles({
    grid: {
      marginTop: theme.spacing(2),
      [theme.breakpoints.up('lg')]: {
        marginTop: theme.spacing(4),
      },
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
        width: '320px',
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
    getStartedButton: {
      marginTop: theme.spacing(6),
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        width: '150px',
      },
    },
  }),
)

const StatisticsSliver = (props) => {
  const classes = useStyles()
  const theme = useTheme()
  const isDesktopWidth = useMediaQuery(theme.breakpoints.up('lg'))
  const { statistics } = props
  const { userCount, linkCount, clickCount } = statistics

  useEffect(() => {
    const { loadStats } = props
    loadStats()
  })

  return (
    <>
      <Typography variant="h2" color="textPrimary" gutterBottom>
        Used by public officers
      </Typography>
      <Grid
        container
        className={classes.grid}
        spacing={!isDesktopWidth ? 6 : 8}
        direction={!isDesktopWidth ? 'column' : 'row'}
      >
        <Grid item>
          <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
              <Typography color="primary" variant="h3" gutterBottom>
                <strong>{numberFormatter.format(userCount)}</strong>
              </Typography>
              <Typography color="textPrimary">
                PUBLIC OFFICERS ONBOARD
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item>
          <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
              <Typography color="primary" variant="h3" gutterBottom>
                <strong>{numberFormatter.format(linkCount)}</strong>
              </Typography>
              <Typography color="textPrimary">SHORT LINKS CREATED</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item>
          <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
              <Typography color="primary" variant="h3" gutterBottom>
                <strong>{numberFormatter.format(clickCount)}</strong>
              </Typography>
              <Typography color="textPrimary">CLICKS</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Button
        className={classes.getStartedButton}
        href="/#/login"
        size="medium"
        color="primary"
        variant="contained"
      >
        Get started
      </Button>
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(StatisticsSliver)
