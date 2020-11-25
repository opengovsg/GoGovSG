import { StorableUrl } from '../repositories/types'
import { GoUploadedFile } from '../controllers/types'

export type UpdateUrlOptions = Partial<
  Pick<StorableUrl, 'state' | 'longUrl' | 'description' | 'contactEmail'> & {
    file: GoUploadedFile
  }
>
