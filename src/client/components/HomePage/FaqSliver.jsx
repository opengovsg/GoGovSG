import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import {
  Button,
  Card,
  CardContent,
  Hidden,
  Typography,
  createStyles,
  makeStyles,
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
    cardGroup: {
      display: 'flex',
      flexDirection: 'column',
      [theme.breakpoints.up('sm')]: {
        flexDirection: 'row',
      },
    },
    cardContent: {
      paddingTop: theme.spacing(4),
      paddingLeft: theme.spacing(0),
      paddingRight: theme.spacing(0),
      [theme.breakpoints.up('sm')]: {
        paddingRight: theme.spacing(8),
      },
      '&:last-child': {
        paddingBottom: 0,
      },
    },
    card: {
      boxShadow: 'none',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'transparent',
      alignItems: 'flex-start',
    },
    getStartedButton: {
      marginTop: theme.spacing(6),
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        visibility: 'hidden',
      },
    },
  }),
)

const FaqSliver = (props) => {
  const classes = useStyles()
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
      <section className={classes.cardGroup}>
        <Card className={classes.card}>
          <CardContent className={classes.cardContent}>
            <Typography color="primary" variant="h3" gutterBottom>
              <strong>{numberFormatter.format(userCount)}</strong>
            </Typography>
            <Typography color="textPrimary">PUBLIC OFFICERS ONBOARD</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card}>
          <CardContent className={classes.cardContent}>
            <Typography color="primary" variant="h3" gutterBottom>
              <strong>{numberFormatter.format(linkCount)}</strong>
            </Typography>
            <Typography color="textPrimary">SHORT LINKS CREATED</Typography>
          </CardContent>
        </Card>
        <Card className={classes.card}>
          <CardContent className={classes.cardContent}>
            <Typography color="primary" variant="h3" gutterBottom>
              <strong>{numberFormatter.format(clickCount)}</strong>
            </Typography>
            <Typography color="textPrimary">CLICKS</Typography>
          </CardContent>
        </Card>
      </section>
      <Hidden smUp>
        <Button
          className={classes.getStartedButton}
          size="medium"
          color="primary"
          variant="contained"
        >
          Get started
        </Button>
      </Hidden>
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(FaqSliver)
