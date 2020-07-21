import { SearchResultsSortOrder } from '../../shared/search'

export const sortOptions = [
  { key: SearchResultsSortOrder.Relevance, label: 'Most relevant' },
  { key: SearchResultsSortOrder.Popularity, label: 'Most popular' },
  { key: SearchResultsSortOrder.Recency, label: 'Most recent' },
]

export default { sortOptions }
