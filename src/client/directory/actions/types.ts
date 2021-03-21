import { UrlTypePublic } from '../reducers/types'
import { HasPayload, ReduxAction } from '../../app/actions/types'

export const SET_DIRECTORY_RESULTS = 'SET_DIRECTORY_RESULTS'
export const SET_DIRECTORY_TABLE_CONFIG = 'SET_DIRECTORY_TABLE_CONFIG'
export const SET_INITIAL_STATE = 'SET_INITIAL_STATE'

export type SetDirectoryResultsAction = ReduxAction<
  typeof SET_DIRECTORY_RESULTS
> &
  HasPayload<{
    urls: Array<UrlTypePublic>
    count: number
    query: string
  }>

export type ResetDirectoryResultsAction = ReduxAction<typeof SET_INITIAL_STATE>

export type DirectoryActionType =
  | SetDirectoryResultsAction
  | ResetDirectoryResultsAction
