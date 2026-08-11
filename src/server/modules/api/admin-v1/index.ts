import { StorableUrl } from '../../../repositories/types.js'

export { AdminApiV1Controller } from './AdminApiV1Controller.js'

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
