import { StorableUrl } from '../../repositories/types.js'
import { UserController } from './UserController.js'

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
  contactEmail: string
  description: string
}

type ShortUrlOperationProperty = UserIdProperty & ShortUrlProperty

type OptionalTagsProperty = {
  tags?: string[]
}

type NewUserEmailProperty = {
  newUserEmail: string
}

type OptionalStateProperty = {
  state?: 'ACTIVE' | 'INACTIVE'
}

export type UrlCreationRequest = ShortUrlOperationProperty &
  OptionalLongUrlProperty &
  OptionalTagsProperty

export type OldUrlEditRequest = ShortUrlOperationProperty &
  OptionalLongUrlProperty

export type OwnershipTransferRequest = ShortUrlOperationProperty &
  NewUserEmailProperty

export type UrlEditRequest = ShortUrlOperationProperty &
  OptionalStateProperty &
  OptionalLongUrlProperty &
  Partial<LinkInformationProperties> &
  OptionalTagsProperty

export type GoUploadedFile = {
  data: Buffer
  mimetype: string
  name: string
}

export type UpdateUrlOptions = Partial<
  Pick<
    StorableUrl,
    'state' | 'longUrl' | 'description' | 'contactEmail' | 'tags'
  > & {
    file: GoUploadedFile
  }
>

export { UserController } from './UserController.js'

export default UserController
