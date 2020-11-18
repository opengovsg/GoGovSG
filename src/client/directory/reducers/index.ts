import { DirectoryState } from './types'
import {
  DirectoryActionType,
  SET_DIRECTORY_RESULTS,
  SET_INITIAL_STATE,
} from '../actions/types'

export const initialState: DirectoryState = {
  results: [],
  resultsCount: 0,
  queryForResult: null,
}

const directory: (
  state: DirectoryState,
  action: DirectoryActionType,
) => DirectoryState = (state = initialState, action) => {
  let nextState: Partial<DirectoryState> = {}
  switch (action.type) {
    case SET_DIRECTORY_RESULTS:
      nextState = {
        resultsCount: action.payload.count,
        results: action.payload.urls,
        queryForResult: action.payload.query,
      }
      break
    case SET_INITIAL_STATE:
      nextState = initialState
      break
    default:
      break
  }
  return { ...state, ...nextState }
}

export default directory
