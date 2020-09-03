type OptionalLongUrlProperty = {
  longUrl?: string
}

type UserIdProperty = {
  userId: number
}

type ShortUrlProperty = {
  shortUrl: string
}

type LinkInformationProperties = {
  isSearchable: boolean
  contactEmail: string
  description: string
}

type ShortUrlOperationProperty = UserIdProperty & ShortUrlProperty

type NewUserEmailProperty = {
  newUserEmail: string
}

type OptionalStateProperty = {
  state?: 'ACTIVE' | 'INACTIVE'
}

export type UrlCreationRequest = ShortUrlOperationProperty &
  OptionalLongUrlProperty

export type OldUrlEditRequest = ShortUrlOperationProperty &
  OptionalLongUrlProperty

export type OwnershipTransferRequest = ShortUrlOperationProperty &
  NewUserEmailProperty

export type UrlEditRequest = ShortUrlOperationProperty &
  OptionalStateProperty &
  OptionalLongUrlProperty &
  Partial<LinkInformationProperties>
