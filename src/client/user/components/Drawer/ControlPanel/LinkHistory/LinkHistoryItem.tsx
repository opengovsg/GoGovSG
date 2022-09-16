import React from 'react'
import moment from 'moment-timezone'

import { Typography, createStyles, makeStyles } from '@material-ui/core'
import {
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from '@material-ui/lab/'

import { LinkChangeKey, LinkChangeSet } from '../../../../reducers/types'
import { useDrawerState } from '../..'

const useStyles = makeStyles((theme) =>
  createStyles({
    content: {
      paddingTop: 2,
      paddingBottom: 48,
    },
    dateText: {
      fontWeight: 400,
      color: '#767676',
    },
    oppContent: {
      maxWidth: 0,
      paddingLeft: 0,
      paddingRight: 0,
    },
    regularText: {
      fontWeight: 400,
    },
    timelineDot: {
      backgroundColor: theme.palette.primary.light,
    },
    timelineConnector: {
      backgroundColor: theme.palette.primary.light,
    },
  }),
)

const linkChangeKeyDictionary: { [key in LinkChangeKey]: string } = {
  description: 'Description',
  isFile: 'File',
  state: 'Link Status',
  userEmail: 'Link Owner',
  longUrl: 'Original Link',
}

const convertToDateString = (oldDateString: string): string => {
  const desiredDateFormat = 'MMMM D, YYYY h:mm A'
  return moment(oldDateString).tz('Singapore').format(desiredDateFormat)
}

type LinkHistoryItemProps = {
  changeSet: LinkChangeSet
  removeBottomConnector: boolean
}

export default function LinkHistoryItem({
  changeSet,
  removeBottomConnector,
}: LinkHistoryItemProps) {
  const classes = useStyles()
  const shortUrl = useDrawerState().relevantShortLink || ''
  const fullURL = `${document.location.protocol}//${document.location.host}/${shortUrl}`

  const createStatusText = (currValue: string | boolean) => {
    return (
      <Typography variant="h6">
        {fullURL}
        <span className={classes.regularText}> created for </span>
        {currValue}
      </Typography>
    )
  }

  const updateStatusText = (
    currKey: LinkChangeKey,
    prevValue: string | boolean,
    currValue: string | boolean,
  ) => {
    return (
      <Typography variant="h6">
        {linkChangeKeyDictionary[currKey]}
        <span className={classes.regularText}> was updated from </span>
        {prevValue}
        <span className={classes.regularText}> to </span>
        {currValue}
      </Typography>
    )
  }

  return (
    <TimelineItem>
      <TimelineOppositeContent className={classes.oppContent} />
      <TimelineSeparator>
        <TimelineDot className={classes.timelineDot} />
        {/* Remove bottom connector for the bottom item */}
        {!removeBottomConnector && (
          <TimelineConnector className={classes.timelineConnector} />
        )}
      </TimelineSeparator>
      <TimelineContent className={classes.content}>
        <Typography className={classes.dateText} variant="body2">
          {convertToDateString(changeSet.updatedAt)}
        </Typography>
        {changeSet.type === 'create'
          ? createStatusText(changeSet.currValue)
          : updateStatusText(
              changeSet.key,
              changeSet.prevValue,
              changeSet.currValue,
            )}
      </TimelineContent>
    </TimelineItem>
  )
}
