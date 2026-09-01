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

type OptionalTagsProperty = {
  tags?: string[]
}

type LinkInformationProperties = {
  contactEmail: string | null
  description: string
}

export type UrlCreationRequest = ShortUrlOperationProperty &
  OptionalLongUrlProperty &
  OptionalTagsProperty &
  Partial<LinkInformationProperties>

export type UrlEditRequest = ShortUrlOperationProperty &
  OptionalStateProperty &
  OptionalLongUrlProperty &
  Partial<LinkInformationProperties> &
  OptionalTagsProperty

export type UrlV1DTO = Pick<
  StorableUrl,
  | 'shortUrl'
  | 'longUrl'
  | 'state'
  | 'clicks'
  | 'createdAt'
  | 'updatedAt'
  | 'tags'
  | 'description'
  | 'contactEmail'
>
