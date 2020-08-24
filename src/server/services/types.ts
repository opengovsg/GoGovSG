import { StorableUrl } from '../repositories/types'
import { GoUploadedFile } from '../controllers/types'

export type RedirectResult = {
  visitedUrls: string[]
  longUrl: string
  redirectType: RedirectType
}

export enum RedirectType {
  Direct,
  TransitionPage,
}

export type UpdateUrlOptions = Partial<
  Pick<
    StorableUrl,
    'state' | 'longUrl' | 'isSearchable' | 'description' | 'contactEmail'
  > & {
    file: GoUploadedFile
  }
>
