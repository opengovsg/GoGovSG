import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { Trans } from 'react-i18next'
import { Typography, createStyles, makeStyles } from '@material-ui/core'

import homeActions from '~/actions/home'
import numberFormatter from '~/util/format'

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      backgroundColor: theme.palette.secondary.dark,
      width: '100%',
      padding: theme.spacing(8, 4),
    },
  }),
)

const mapDispatchToProps = (dispatch) => ({
  loadStats: () => dispatch(homeActions.loadStats()),
})

const mapStateToProps = (state, ownProps) => ({
  onCreateUrl: ownProps.onCreateUrl,
  history: ownProps.history,
  statistics: state.home.statistics,
})

const FaqSliver = (props) => {
  const classes = useStyles()
  const generateStatsString = ({
    statistics: { userCount, linkCount, clickCount },
  }) => {
    let statsStringBuilder = ''
    if (userCount !== null && clickCount !== null && linkCount !== null) {
      statsStringBuilder = `, with ${numberFormatter.format(userCount)} users`
      statsStringBuilder += `, ${numberFormatter.format(linkCount)} links`
      statsStringBuilder += `, and ${numberFormatter.format(
        clickCount,
      )} total clicks`
    }
    return statsStringBuilder
  }

  useEffect(() => {
    const { loadStats } = props
    loadStats()
  })

  return (
    <main className={classes.container}>
      <Typography
        className={classes.trustedByText}
        variant="h2"
        color="textPrimary"
        gutterBottom
      >
        Used by public officers
      </Typography>
      <Typography variant="body2" color="textPrimary" paragraph>
        <Trans>general.appDescription.stats</Trans>
        {generateStatsString(props)}.
      </Typography>
    </main>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(FaqSliver)
