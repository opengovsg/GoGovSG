import { StorableUrl } from '../../../repositories/types'

export { AdminApiV1Controller } from './AdminApiV1Controller'

type LongUrlProperty = {
  longUrl: string
}
type UserIdProperty = {
  userId: number
}

type ShortUrlProperty = {
  shortUrl: string
}

type EmailProperty = {
  email: string
}

type ShortUrlOperationProperty = UserIdProperty & ShortUrlProperty

export type UrlCreationRequest = ShortUrlOperationProperty &
  LongUrlProperty &
  EmailProperty

export type UrlV1DTO = Pick<
  StorableUrl,
  'shortUrl' | 'longUrl' | 'state' | 'clicks' | 'createdAt' | 'updatedAt'
>
