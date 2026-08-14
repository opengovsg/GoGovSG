import React, { useEffect } from 'react'

import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import { useSelector } from 'react-redux'
import useAppDispatch from '../../../../../app/hooks'
import { Timeline } from '@mui/lab/'
import { GoGovReduxState } from '../../../../../app/reducers/types'
import { useDrawerState } from '../..'

import userActions from '../../../../actions'

import LinkHistoryPagination from './LinkHistoryPagination'
import LinkHistoryItem from './LinkHistoryItem'

const useStyles = makeStyles(() =>
  createStyles({
    rootTimeline: {
      marginLeft: 0,
      marginRight: 15,
      paddingLeft: 0,
    },
  }),
)

export default function LinkHistory() {
  const classes = useStyles()
  const ITEMS_PER_PAGE = 10
  const [currentPage, setCurrentPage] = React.useState(0)

  // Handles redux state for link history
  const dispatch = useAppDispatch()
  const shortUrl = useDrawerState().relevantShortLink || ''
  const { linkHistory, linkHistoryCount } = useSelector(
    (state: GoGovReduxState) => state.user,
  )
  const changeSetLen = linkHistory.length

  const getLinkHistoryForUser = () => {
    const offset = currentPage * ITEMS_PER_PAGE
    dispatch(
      userActions.getLinkHistoryForUser(shortUrl, offset, ITEMS_PER_PAGE),
    )
  }

  useEffect(() => {
    getLinkHistoryForUser()
  }, [currentPage])

  return (
    <>
      <Timeline className={classes.rootTimeline}>
        {linkHistory &&
          linkHistory.map((currSet, idx) => {
            return (
              <LinkHistoryItem
                key={`LinkHistoryItem-${currSet.updatedAt}`}
                changeSet={currSet}
                // Remove bottom connector for the bottom item
                removeBottomConnector={idx === changeSetLen - 1}
              />
            )
          })}
      </Timeline>
      <LinkHistoryPagination
        page={currentPage}
        pageCount={Math.ceil(linkHistoryCount / ITEMS_PER_PAGE)}
        onChangePage={setCurrentPage}
      />
    </>
  )
}
