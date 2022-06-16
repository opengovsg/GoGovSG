import React, { FunctionComponent } from 'react'
import { Typography, createStyles, makeStyles } from '@material-ui/core'
import emptyGraphic from '@assets/components/user/drawer/empty-link-analytics-graphic.svg'

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    emptyLinkAnalyticsGraphic: {
      marginTop: '24px',
      position: 'relative',
      zIndex: -1,
    },
    emptyLinkAnalyticsBodyText: {
      marginTop: '27px',
      textAlign: 'center',
      padding: '10px',
    },
  }),
)

/**
 * @component Default display component in place of search result.
 */
const NoLinkAnalyticsGraphic: FunctionComponent = () => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <div className={classes.emptyLinkAnalyticsGraphic}>
        <img src={emptyGraphic} alt="empty link analytics graphic" />
      </div>
      <Typography
        variant="body1"
        className={classes.emptyLinkAnalyticsBodyText}
      >
        Your link does not have any statistics yet
      </Typography>
    </div>
  )
}

export default NoLinkAnalyticsGraphic
