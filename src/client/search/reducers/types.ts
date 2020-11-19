import { UrlType } from '../../user/reducers/types'

export type UrlTypePublic = Omit<UrlType, 'clicks'>

export type SearchState = {
  results: Array<UrlTypePublic>
  resultsCount: number
  queryForResult: string | null
}
