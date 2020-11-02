import { ThunkAction } from 'redux-thunk'
import { Dispatch } from 'react'
import querystring from 'querystring'
import { History } from 'history'
import * as Sentry from '@sentry/browser'
import {
  DirectoryActionType,
  ResetDirectoryResultsAction,
  SET_DIRECTORY_RESULTS,
  SET_INITIAL_STATE,
  SetDirectoryResultsAction,
} from './types'
import { GoGovReduxState } from '../../reducers/types'
import { RootActionType, SetErrorMessageAction } from '../root/types'
import rootActions from '../root'
import { SearchResultsSortOrder } from '../../../shared/search'
import { get } from '../../util/requests'
import { DIRECTORY_PAGE } from '../../util/types'
import { UrlTypePublic } from '../../reducers/directory/types'
import { GAEvent } from '../ga'

function setDirectoryResults(payload: {
  count: number
  urls: Array<UrlTypePublic>
  query: string
}): SetDirectoryResultsAction {
  return {
    type: SET_DIRECTORY_RESULTS,
    payload,
  }
}

function resetDirectoryResults(): ResetDirectoryResultsAction {
  return {
    type: SET_INITIAL_STATE,
  }
}

const getDirectoryResults = (
  query: string,
  order: SearchResultsSortOrder,
  rowsPerPage: number,
  currentPage: number,
  state: string,
  isFile: string,
  isEmail: string,
): ThunkAction<
  void,
  GoGovReduxState,
  void,
  DirectoryActionType | RootActionType
> => async (
  dispatch: Dispatch<SetErrorMessageAction | SetDirectoryResultsAction>,
) => {
  if (!query.trim()) {
    return
  }
  const offset = currentPage * rowsPerPage
  const limit = rowsPerPage
  const paramsObj = {
    query,
    order,
    limit,
    offset,
    state,
    isFile,
    isEmail,
  }
  const params = querystring.stringify(paramsObj)
  const response = await get(`/api/directory/search?${params}`)
  const json = await response.json()
  if (!response.ok) {
    // Report error from endpoints
    GAEvent('directory page', query, 'unsuccessful')
    Sentry.captureMessage('directory search unsuccessful')
    dispatch(
      rootActions.setErrorMessage(
        json.message || 'Error fetching search results',
      ),
    )
    return
  }

  // replace @ with # because google analytics will stop events from recording potential email lookalike
  GAEvent('directory page', query.replace(/(@)/g, '#'), 'successful')
  dispatch(
    setDirectoryResults({
      count: json.count,
      urls: json.urls as Array<UrlTypePublic>,
      query,
    }),
  )
}

const redirectToDirectoryPage = (
  history: History,
  query: string,
): ThunkAction<
  void,
  GoGovReduxState,
  void,
  DirectoryActionType | RootActionType
> => () => {
  history.push({
    pathname: DIRECTORY_PAGE,
    search: querystring.stringify({ query }),
  })
}

export default {
  getDirectoryResults,
  setDirectoryResults,
  redirectToDirectoryPage,
  resetDirectoryResults,
}
