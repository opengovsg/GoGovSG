import { StorableUrl } from '../../../repositories/types'

export { ApiV1Controller } from './ApiV1Controller'

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

type OptionalStateProperty = {
  state?: 'ACTIVE' | 'INACTIVE'
}

export type UrlCreationRequest = ShortUrlOperationProperty &
  OptionalLongUrlProperty

export type UrlEditRequest = ShortUrlOperationProperty &
  OptionalStateProperty &
  OptionalLongUrlProperty

export type UrlV1DTO = Pick<
  StorableUrl,
  'shortUrl' | 'longUrl' | 'state' | 'clicks' | 'createdAt' | 'updatedAt'
>
