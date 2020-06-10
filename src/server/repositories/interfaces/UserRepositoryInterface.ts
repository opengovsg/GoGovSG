import {
  StorableUrl,
  StorableUser,
  UrlsPaginated,
  UserUrlsQueryConditions,
} from '../types'

/**
 * A url repository that handles access to the data store of Users.
 */
export interface UserRepositoryInterface {
  /**
   * Find and returns the user whose unique id matches the input id.
   * @param  {number} userId The unique id of the user to find.
   * @returns Promise that resolves to the user, if any, or null.
   */
  findById(userId: number): Promise<StorableUser | null>

  /**
   * Find and returns the user whose email matches the input email.
   * @param  {string} email The email of the user to find.
   * @returns Promise that resolves to the user, if any, or null.
   */
  findByEmail(email: string): Promise<StorableUser | null>

  /**
   * Find and returns the user whose email matches the input email.
   * If there isn't one, then a new user is created with the input email
   * and is returned.
   * @param  {string} email The email of the user to find.
   * @returns Promise that resolves to the user.
   */
  findOrCreateWithEmail(email: string): Promise<StorableUser>

  /**
   * Find one url that matches input short link and belongs to the user
   * with the input user id.
   * @param  {number} userId The unique id of the user.
   * @param  {string} shortUrl The shortUrl of the Url to find.
   * @returns Promise that resolves to the url, if any, or null.
   */
  findOneUrlForUser(
    userId: number,
    shortUrl: string,
  ): Promise<StorableUrl | null>

  /**
   * Find the urls belonging to a user which matches the given query conditions.
   * The total count of rows matching the query (both in and outside the limit) is also returned.
   * @param  {UserUrlsQueryConditions} conditions Query conditions.
   * @returns Promise that resolves to an object containing the urls and total count.
   */
  findUrlsForUser(conditions: UserUrlsQueryConditions): Promise<UrlsPaginated>

  /**
   * Fetches the total number of users in the data store.
   * @returns Promise which resolves to the number.
   */
  getNumUsers(): Promise<number>
}
