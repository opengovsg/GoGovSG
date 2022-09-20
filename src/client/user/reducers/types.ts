export type UploadState = {
  urlUpload: boolean
  fileUpload: boolean
}

export enum UrlState {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

export type UrlTableFilterConfig = {
  isFile?: boolean
  state?: UrlState
}

export enum SortDirection {
  Descending = 'desc',
  Ascending = 'asc',
}

export type UrlTableConfig = {
  numberOfRows: number
  pageNumber: number
  sortDirection: SortDirection
  orderBy: string
  searchText: string
  filter: UrlTableFilterConfig
}

export type UrlType = {
  clicks: number
  createdAt: string
  editedLongUrl: string
  isFile: boolean
  longUrl: string
  shortUrl: string
  state: UrlState
  updatedAt: string
  userId: number
  description: string
  editedDescription: string
  contactEmail: string
  editedContactEmail: string
  email: string
  tags: string[]
  tagStrings: string
}

export type LinkChangeType = 'create' | 'update'

export type LinkChangeKey =
  | 'description'
  | 'isFile'
  | 'state'
  | 'userEmail'
  | 'longUrl'

export interface LinkChangeSet {
  type: LinkChangeType
  key: LinkChangeKey
  prevValue: string | boolean
  currValue: string | boolean
  updatedAt: string
}

export type UserState = {
  initialised: boolean
  isFetchingUrls: boolean
  urls: Array<UrlType>
  shortUrl: string
  longUrl: string
  createUrlModal: boolean
  tableConfig: UrlTableConfig
  isUploading: boolean
  urlCount: number
  createShortLinkError: string | null
  uploadFileError: string | null
  lastCreatedLink?: string
  message: string | null
  uploadState: UploadState
  announcement: {
    message: string | undefined
    title: string | undefined
    subtitle: string | undefined
    url: string | undefined
    image: string | undefined
  } | null
  linkHistory: Array<LinkChangeSet>
  linkHistoryCount: number
  tags: string[]
}
