export type UrlType = {
  shortUrl: string
  longUrl: string
  updatedAt: string
  createdAt: string
  editedLongUrl: string
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

export enum UrlState {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

export enum SortDirection {
  Descending = 'desc',
  Ascending = 'asc',
}
