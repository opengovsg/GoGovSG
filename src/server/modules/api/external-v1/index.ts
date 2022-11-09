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

export type UrlCreationRequest = ShortUrlOperationProperty &
  OptionalLongUrlProperty

export type ApiUrl = Pick<
  StorableUrl,
  'shortUrl' | 'longUrl' | 'state' | 'clicks' | 'createdAt' | 'updatedAt'
>
