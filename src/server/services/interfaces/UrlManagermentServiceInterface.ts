import { UpdateUrlOptions } from '../types'
import { GoUploadedFile } from '../../controllers/types'
import {
  StorableUrl,
  UrlsPaginated,
  UserUrlsQueryConditions,
} from '../../repositories/types'

export interface UrlManagementServiceInterface {
  /**
   * Creates a new url with the given input parameters.
   * @param  {number} userId The id of the user which the url belongs to.
   * @param  {string} shortUrl The short url.
   * @param  {string} longUrl? The long url to redirect to.
   * @param  {GoUploadedFile} file? The file to redirect to.
   * @returns Promise that resolves to the created url.
   */
  createUrl(
    userId: number,
    shortUrl: string,
    longUrl?: string,
    file?: GoUploadedFile,
  ): Promise<StorableUrl>

  /**
   * Updates a url that matches the input short url and belongs
   * to the user with the input user id, if it exists, with the
   * given parameters.
   * @param  {number} userId Id of the user which the url belongs to.
   * @param  {string} shortUrl The short url of the url to update.
   * @param  {UpdateUrlOptions} options The fields to update.
   * @returns Promise that resolves to the updated url.
   */
  updateUrl(
    userId: number,
    shortUrl: string,
    options: UpdateUrlOptions,
  ): Promise<StorableUrl>

  /**
   * Changes the owner of a url that matches the input short url and belongs
   * to the user with the input user id, if it exists, to the user that matches
   * the input email.
   * @param  {number} userId The id of the old owner.
   * @param  {string} shortUrl The short url to transfer.
   * @param  {string} newUserEmail The email of the new owner.
   * @returns Promise that resolves to the updated url.
   */
  changeOwnership(
    userId: number,
    shortUrl: string,
    newUserEmail: string,
  ): Promise<StorableUrl>

  /**
   * Retrieves urls with the input conditions.
   * @param  {UserUrlsQueryConditions} conditions Conditions that include the owner's id.
   * @returns Promise that resolves to the retrieved urls and the total number of matching urls.
   */
  getUrlsWithConditions(
    conditions: UserUrlsQueryConditions,
  ): Promise<UrlsPaginated>
}
