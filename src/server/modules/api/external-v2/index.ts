import { StorableUrl } from '../../../repositories/types'

export { ApiV2Controller } from './ApiV2Controller'

type OptionalLongUrlProperty = {
  longUrl?: string
}
type UserIdProperty = {
  userId: number
}

type ShortUrlProperty = {
  shortUrl: string
}

type OptionalEmailProperty = {
  email?: string
}

type ShortUrlOperationProperty = UserIdProperty & ShortUrlProperty

export type UrlCreationRequest = ShortUrlOperationProperty &
  OptionalLongUrlProperty &
  OptionalEmailProperty

export type UrlV2DTO = Pick<
  StorableUrl,
  'shortUrl' | 'longUrl' | 'state' | 'clicks' | 'createdAt' | 'updatedAt'
>
