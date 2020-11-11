import { UrlTypePublic } from '../reducers/types'

export const SET_DIRECTORY_RESULTS = 'SET_DIRECTORY_RESULTS'
export const SET_DIRECTORY_TABLE_CONFIG = 'SET_DIRECTORY_TABLE_CONFIG'
export const SET_INITIAL_STATE = 'SET_INITIAL_STATE'

export type SetDirectoryResultsAction = {
  type: typeof SET_DIRECTORY_RESULTS
  payload: {
    urls: Array<UrlTypePublic>
    count: number
    query: string
  }
}

export type ResetDirectoryResultsAction = {
  type: typeof SET_INITIAL_STATE
}

export type DirectoryActionType =
  | SetDirectoryResultsAction
  | ResetDirectoryResultsAction
