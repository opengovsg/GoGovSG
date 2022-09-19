import React from 'react'
import moment from 'moment-timezone'

import { Chip, Typography, createStyles, makeStyles } from '@material-ui/core'
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
import { TAG_SEPARATOR } from '../../../../../../shared/constants'

const TAG_STRING_FIELD = 'tagStrings'

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
    chip: {
      backgroundColor: theme.palette.primary.light,
      color: '#FFFFFF',
      borderRadius: 5,
      marginRight: 2,
    },
  }),
)

const linkChangeKeyDictionary: { [key in LinkChangeKey]: string } = {
  description: 'Description',
  isFile: 'File',
  state: 'Link Status',
  userEmail: 'Link Owner',
  longUrl: 'Original Link',
  tagStrings: 'Link Tags',
}

const convertToDateString = (oldDateString: string): string => {
  const desiredDateFormat = 'MMMM D, YYYY h:mm A'
  return moment(oldDateString).tz('Singapore').format(desiredDateFormat)
}

type LinkHistoryItemProps = {
  changeSet: LinkChangeSet
  removeBottomConnector: boolean
}

function TagList({ tagStrings }: { tagStrings: string }) {
  const classes = useStyles()
  const tags = tagStrings.split(TAG_SEPARATOR)
  return (
    <>
      {tagStrings === ''
        ? 'no tag'
        : tags.map((tag) => <Chip label={tag} className={classes.chip} />)}
    </>
  )
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
        {currKey === TAG_STRING_FIELD ? (
          <TagList tagStrings={prevValue.toString()} />
        ) : (
          prevValue
        )}
        <span className={classes.regularText}> to </span>
        {currKey === TAG_STRING_FIELD ? (
          <TagList tagStrings={currValue.toString()} />
        ) : (
          currValue
        )}
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
