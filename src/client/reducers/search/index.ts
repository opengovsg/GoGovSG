import { SearchState } from './types'
import {
  SET_SEARCH_RESULTS,
  SearchActionType,
} from '../../actions/search/types'

const initialState: SearchState = {
  results: [],
  resultsCount: 0,
  queryForResult: null,
}

const search: (state: SearchState, action: SearchActionType) => SearchState = (
  state = initialState,
  action,
) => {
  let nextState: Partial<SearchState> = {}
  switch (action.type) {
    case SET_SEARCH_RESULTS:
      nextState = {
        resultsCount: action.payload.count,
        results: action.payload.urls,
        queryForResult: action.payload.query,
      }
      break
    default:
      break
  }
  return { ...state, ...nextState }
}

export default search
