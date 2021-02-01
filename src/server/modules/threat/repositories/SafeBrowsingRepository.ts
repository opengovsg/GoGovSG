/* eslint-disable class-methods-use-this */

import { inject, injectable } from 'inversify'
import { safeBrowsingClient } from '../../../redis'
import { HasCacheDuration } from '../../../repositories/types'
import { TwoWayMapper } from '../../../mappers/TwoWayMapper'
import { DependencyIds } from '../../../constants'
import { NotFoundError } from '../../../util/error'

@injectable()
export class SafeBrowsingRepository {
  private safeBrowsingMapper: TwoWayMapper<HasCacheDuration[], string>

  public constructor(
    @inject(DependencyIds.safeBrowsingMapper)
    safeBrowsingMapper: TwoWayMapper<HasCacheDuration[], string>,
  ) {
    this.safeBrowsingMapper = safeBrowsingMapper
  }

  public set: (url: string, matches: HasCacheDuration[]) => Promise<void> = (
    url,
    matches,
  ) =>
    new Promise((resolve, reject) => {
      if (!matches.length || !matches[0]) {
        reject(
          new NotFoundError(`No matches found for ${url}, should not persist`),
        )
      }
      // Threat matches from Safe Browsing API specify a
      // cache duration in seconds, with an 's' suffix
      const [{ cacheDuration }] = matches
      const expiryInSeconds = Number(
        cacheDuration.substring(0, cacheDuration.length - 1),
      )
      safeBrowsingClient.set(
        url,
        this.safeBrowsingMapper.dtoToPersistence(matches),
        'EX',
        expiryInSeconds,
        (redisSetError) => {
          if (redisSetError) {
            reject(redisSetError)
            return
          }

          resolve()
        },
      )
    })

  public get: (url: string) => Promise<HasCacheDuration[] | null> = (url) =>
    new Promise((resolve, reject) => {
      safeBrowsingClient.get(url, (redisError, string) => {
        if (redisError) {
          reject(redisError)
          return
        }

        if (!string) {
          resolve(null)
        }

        resolve(this.safeBrowsingMapper.persistenceToDto(string))
      })
    })
}

export default SafeBrowsingRepository
