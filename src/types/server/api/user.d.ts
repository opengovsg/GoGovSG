type OptionalLongUrlProperty = {
  longUrl?: string
}

type UserIdProperty = {
  userId: number
}

type ShortUrlProperty = {
  shortUrl: string
}

type ShortUrlOperationProperty = UserIdProperty & ShortUrlProperty

type NewUserEmailProperty = {
  newUserEmail: string
}

type StateProperty = {
  state: 'ACTIVE' | 'INACTIVE'
}

export type UrlCreationRequest = ShortUrlOperationProperty &
  OptionalLongUrlProperty

export type UrlEditRequest = ShortUrlOperationProperty & OptionalLongUrlProperty

export type OwnershipTransferRequest = ShortUrlOperationProperty &
  NewUserEmailProperty

export type ShorturlStateEditRequest = ShortUrlOperationProperty & StateProperty
