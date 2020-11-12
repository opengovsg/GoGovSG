import { SearchResultsSortOrder } from '../../shared/search'

export const sortOptions = [
  { key: SearchResultsSortOrder.Popularity, label: 'Most popular' },
  { key: SearchResultsSortOrder.Recency, label: 'Most recent' },
]

export const defaultSortOption = SearchResultsSortOrder.Recency

export default { sortOptions, defaultSortOption }
