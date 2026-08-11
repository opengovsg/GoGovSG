import { SortDirection } from './reducers/types.js'

export const initialSortConfig = {
  orderBy: 'createdAt',
  sortDirection: SortDirection.Descending,
}

export const TEXT_FIELD_HEIGHT = 44

// Search timeout in ms
export const SEARCH_TIMEOUT = 500
