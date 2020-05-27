export type UrlType = {
  shortUrl: string
  longUrl: string
}

export type UserState = {
  initialised: boolean
  isFetchingUrls: boolean
  urls: Array<UrlType>
  shortUrl: string
  longUrl: string
  createUrlModal: boolean
  tableConfig: UrlTableConfig
  urlCount: 0
}

export type UrlTableConfig = {
  numberOfRows: number
  pageNumber: number
  sortDirection: SortDirection
  orderBy: string
  searchText: string
  filter: {
    isFile?: boolean
    orderBy?: string
    state?: UrlState
  }
}

export type UrlState = 'ACTIVE' | 'INACTIVE'

export type SortDirection = 'desc' | 'asc'
