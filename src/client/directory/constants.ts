import { SearchResultsSortOrder } from '../../shared/search'

/**
 * The available sorting options for GoDirectory which includes popularity and recency.
 */
export const sortOptions = [
  { key: SearchResultsSortOrder.Popularity, label: 'Most popular' },
  { key: SearchResultsSortOrder.Recency, label: 'Most recent' },
]

export const defaultSortOption = SearchResultsSortOrder.Recency

export default { sortOptions, defaultSortOption }
