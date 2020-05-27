import React from 'react'
import i18next from 'i18next'
import { Typography, createStyles, makeStyles, Button } from '@material-ui/core'

import analyticSoonGraphic from './assets/drawer-analytics-soon.svg'

const useStyles = makeStyles((theme) =>
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
      alignItems: 'center',
    },
    linkAnalyticsText: {
      marginTop: 20,
      marginBottom: 38,
      textAlign: 'center',
    },
    linkAnalysticsImage: {
      width: '50%',
    },
    feedbackButton: {
      height: 44,
      marginTop: 30,
      width: '100%',
      maxWidth: '100%',
      [theme.breakpoints.up('md')]: {
        maxWidth: 200,
      },
    },
  }),
)

export default function LinkAnalytics() {
  const classes = useStyles()

  return (
    <div className={classes.linkAnalyticsDiv}>
      <Typography variant="h3" color="primary">
        Link click history coming soon!
      </Typography>
      <Typography className={classes.linkAnalyticsText} variant="body1">
        Share your feedback about other enhancements you would like to see in
        Go.gov.sg.
      </Typography>
      <img
        className={classes.linkAnalysticsImage}
        src={analyticSoonGraphic}
        alt="Link analytics coming soon!"
        draggable={false}
      />
      <Button
        className={classes.feedbackButton}
        variant="contained"
        color="primary"
        size="large"
        href={i18next.t('general.links.contact')}
        target="_blank"
      >
        Share your feedback
      </Button>
    </div>
  )
}
