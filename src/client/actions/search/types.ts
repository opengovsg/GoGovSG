import { UrlTypePublic } from '../../reducers/search/types'

export const SET_SEARCH_RESULTS = 'SET_SEARCH_RESULTS'

export type SetSearchResultsAction = {
  type: typeof SET_SEARCH_RESULTS
  payload: {
    urls: Array<UrlTypePublic>
    count: number
    query: string
  }
}

export type SearchActionType = SetSearchResultsAction
