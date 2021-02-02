import { SearchResultsSortOrder } from '../../../shared/search'

/**
 * A type that represents query parameters required for search.
 */
export type DirectoryQueryConditions = {
  query: string
  order: SearchResultsSortOrder
  limit: number
  offset: number
  state: string | undefined
  isFile: boolean | undefined
  isEmail: boolean
}

export { DirectoryController } from './DirectoryController'
