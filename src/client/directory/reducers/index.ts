import { DirectoryState } from './types.js'
import {
  DirectoryActionType,
  SET_DIRECTORY_RESULTS,
  SET_INITIAL_STATE,
} from '../actions/types.js'

export const initialState: DirectoryState = {
  results: [],
  resultsCount: 0,
  queryForResult: null,
}

const directory: (
  state: DirectoryState | undefined,
  action: DirectoryActionType,
) => DirectoryState = (state, action) => {
  const currentState = state ?? initialState
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
      return currentState
  }
  return { ...currentState, ...nextState }
}

export default directory
