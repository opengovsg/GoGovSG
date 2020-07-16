import { ThunkAction } from 'redux-thunk'
import { Dispatch } from 'react'
import querystring from 'querystring'
import { History } from 'history'
import {
  SET_SEARCH_RESULTS,
  SearchActionType,
  SetSearchResultsAction,
} from './types'
import { GoGovReduxState } from '../../reducers/types'
import { RootActionType, SetErrorMessageAction } from '../root/types'
import rootActions from '../root'
import { SearchResultsSortOrder } from '../../../shared/search'
import { UrlTypePublic } from '../../reducers/search/types'
import { get } from '../../util/requests'
import { SEARCH_PAGE } from '../../util/types'

function setSearchResults(payload: {
  count: number
  urls: Array<UrlTypePublic>
  query: string
}): SetSearchResultsAction {
  return {
    type: SET_SEARCH_RESULTS,
    payload,
  }
}

const getSearchResults = (
  query: string,
  order: SearchResultsSortOrder,
  rowsPerPage: number,
  currentPage: number,
): ThunkAction<
  void,
  GoGovReduxState,
  void,
  SearchActionType | RootActionType
> => async (
  dispatch: Dispatch<SetErrorMessageAction | SetSearchResultsAction>,
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
  }
  const params = querystring.stringify(paramsObj)
  const response = await get(`/api/search/urls?${params}`)
  const json = await response.json()
  if (!response.ok) {
    dispatch(
      rootActions.setErrorMessage(
        json.message || 'Error fetching search results',
      ),
    )
    return
  }

  dispatch(
    setSearchResults({
      count: json.count,
      urls: json.urls as Array<UrlTypePublic>,
      query,
    }),
  )
}

const redirectToSearchPage = (
  history: History,
  query: string,
): ThunkAction<
  void,
  GoGovReduxState,
  void,
  SearchActionType | RootActionType
> => () => {
  history.push({
    pathname: SEARCH_PAGE,
    search: querystring.stringify({ query }),
  })
}

export default {
  getSearchResults,
  setSearchResults,
  redirectToSearchPage,
}
