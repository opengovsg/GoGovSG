import { StorableUrl } from '../repositories/types'
import { GoUploadedFile } from '../controllers/types'

export enum RedirectType {
  Direct,
  TransitionPage,
}

export type RedirectResult = {
  visitedUrls: string[]
  longUrl: string
  redirectType: RedirectType
}

export type UpdateUrlOptions = Partial<
  Pick<StorableUrl, 'state' | 'longUrl' | 'description' | 'contactEmail'> & {
    file: GoUploadedFile
  }
>
