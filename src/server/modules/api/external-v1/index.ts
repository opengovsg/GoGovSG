import { StorableUrl } from '../../../repositories/types'
import { MessageType } from '../../../../shared/util/messages'

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

export type UrlBulkRow = {
  longUrl?: string
  shortUrl?: string
}

export type UrlBulkCreationRequest = UserIdProperty & {
  urls: UrlBulkRow[]
}

export type UrlBulkError = {
  index: number
  message: string
  type?: MessageType
}

export type UrlBulkCreationResponse = {
  created: UrlV1DTO[]
  errors: UrlBulkError[]
}
