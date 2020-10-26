import { UrlTypePublic } from '../../reducers/directory/types'

export const SET_DIRECTORY_RESULTS = 'SET_DIRECTORY_RESULTS'
export const SET_DIRECTORY_TABLE_CONFIG = 'SET_DIRECTORY_TABLE_CONFIG'

export type SetDirectoryResultsAction = {
  type: typeof SET_DIRECTORY_RESULTS
  payload: {
    urls: Array<UrlTypePublic>
    count: number
    query: string
  }
}

export type DirectoryActionType = SetDirectoryResultsAction
