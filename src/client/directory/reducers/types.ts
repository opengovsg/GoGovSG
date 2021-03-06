import { UrlType } from '../../user/reducers/types'

export type UrlTypePublic = Omit<UrlType, 'clicks'>

export enum UrlState {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

export type DirectoryState = {
  results: Array<UrlTypePublic>
  resultsCount: number
  queryForResult: string | null
}
