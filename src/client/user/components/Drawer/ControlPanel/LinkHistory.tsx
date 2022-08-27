import React from 'react'

import { createStyles, makeStyles } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { Timeline } from '@material-ui/lab/'
import { GoGovReduxState } from '../../../../app/reducers/types'
import { useDrawerState } from '..'

import userActions from '../../../actions'

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
  const dispatch = useDispatch()
  const shortUrl = useDrawerState().relevantShortLink || ''
  dispatch(userActions.getLinkHistoryForUser(shortUrl))
  const linkHistory = useSelector(
    (state: GoGovReduxState) => state.user.linkHistory,
  )

  const classes = useStyles()
  const changeSetLen = linkHistory.length
  return (
    <Timeline className={classes.rootTimeline}>
      {linkHistory &&
        linkHistory.map((currSet, idx) => {
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
