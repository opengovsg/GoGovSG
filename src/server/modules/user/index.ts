import { StorableUrl } from '../../repositories/types'
import { UserController } from './UserController'

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

export type GoUploadedFile = {
  data: Buffer
  mimetype: string
  name: string
}

export type UpdateUrlOptions = Partial<
  Pick<StorableUrl, 'state' | 'longUrl' | 'description' | 'contactEmail'> & {
    file: GoUploadedFile
  }
>

export { UserController } from './UserController'

export default UserController
