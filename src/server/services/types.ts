import { StorableUrl } from '../repositories/types'
import { GoUploadedFile } from '../controllers/types'

export enum RedirectType {
  Direct,
  TransitionPage,
}

export type RedirectResult = {
  visitedUrls: string[]
  longUrl: string
  description: string | null
  redirectType: RedirectType
}

export type UpdateUrlOptions = Partial<
  Pick<
    StorableUrl,
    'state' | 'longUrl' | 'isSearchable' | 'description' | 'contactEmail'
  > & {
    file: GoUploadedFile
  }
>
