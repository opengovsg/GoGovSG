import { UpdateUrlOptions } from '../types'
import { GoUploadedFile } from '../../controllers/types'
import { StorableUrl } from '../../repositories/types'

export interface UserUrlServiceInterface {
  createUrl(
    userId: number,
    shortUrl: string,
    longUrl: string,
    file?: GoUploadedFile,
  ): Promise<StorableUrl>

  updateUrl(
    userId: number,
    shortUrl: string,
    options: UpdateUrlOptions,
  ): Promise<StorableUrl>

  changeOwnership(
    userId: number,
    shortUrl: string,
    newUserEmail: string,
  ): Promise<StorableUrl>
}
