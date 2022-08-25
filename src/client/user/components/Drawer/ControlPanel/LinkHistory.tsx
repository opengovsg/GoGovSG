import React from 'react'

import { createStyles, makeStyles } from '@material-ui/core'

import { Timeline } from '@material-ui/lab/'
import { changeSets } from './LinkHistoryDummyData'
import LinkHistoryItem from './LinkHistoryItem'

const useStyles = makeStyles(() =>
  createStyles({
    rootTimeline: {
      marginLeft: 15,
      marginRight: 15,
    },
  }),
)

export default function LinkHistory() {
  const classes = useStyles()
  const changeSetLen = changeSets.length
  return (
    <Timeline className={classes.rootTimeline}>
      {changeSets &&
        changeSets.map((currSet, idx) => {
          return (
            <LinkHistoryItem
              changeSet={currSet}
              // Remove bottom connector for the bottom item
              removeBottomConnector={idx === changeSetLen - 1}
            />
          )
        })}
    </Timeline>
  )
}
