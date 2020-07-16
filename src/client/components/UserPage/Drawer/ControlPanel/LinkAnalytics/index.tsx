import React from 'react'
import { Typography, createStyles, makeStyles, CircularProgress } from '@material-ui/core'

import { useDrawerState } from '../..'
import { useStatistics } from './util/statistics'
import DeviceStatistics from './DeviceStatistics'
import { LinkStatisticsInterface } from '../../../../../../shared/interfaces/link-statistics'

const useLinkAnalyticsStyles = makeStyles((theme) =>
  createStyles({
    dialogTitleDiv: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 116,
      marginBottom: 44,
    },
    copyLinkDiv: {
      display: 'flex',
    },
    copyIcon: {
      marginRight: 5,
    },
    linkAnalyticsDiv: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '141px',
    },
    linkAnalyticsText: {
      marginTop: 20,
      marginBottom: 20,
      textAlign: 'center',
    },
    titleText: {
      marginBottom: 10,
    },
    subtitleText: {
      marginBottom: 20,
    },
    feedbackButton: {
      height: 44,
      width: '100%',
      maxWidth: '100%',
      [theme.breakpoints.up('md')]: {
        maxWidth: 200,
      },
    },
  }),
)

export default function LinkAnalytics() {
  const classes = useLinkAnalyticsStyles()

  return (
    <div className={classes.linkAnalyticsDiv}>
      <Typography className={classes.titleText} variant="h3" color="primary">
        Click history
      </Typography>
      <Typography
        className={classes.subtitleText}
        variant="body1"
        color="primary"
      >
        View real-time analytics of your link, and sort by time period.
      </Typography>
      <LinkStatisticsGraphs />
    </div>
  )
}

const useLinkStatisticsGraphsStyles = makeStyles(() => ({
  root: {
    margin: 20,
  },
}))

function LinkStatisticsGraphs() {
  const classes = useLinkStatisticsGraphsStyles()
  const shortUrl = useDrawerState().relevantShortLink!
  const linkStatistics = useStatistics(shortUrl)

  // Still fetching link statistics.
  if (!Boolean(linkStatistics.status)) {
    return (
      <div className={classes.root}>
        <CircularProgress />
      </div>
    )
  }

  if (!Boolean(linkStatistics.contents)) {
    return <div className={classes.root}></div>
  }

  return <Graphs data={linkStatistics.contents!} />
}

const useStyles = makeStyles(() => ({
  root: {
    marginTop: 20,
    marginBottom: 20,
  },
}))

export type GraphsProps = {
  data: LinkStatisticsInterface
}

function Graphs(props: GraphsProps) {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <DeviceStatistics deviceClicks={props.data.deviceClicks} />
    </div>
  )
}
