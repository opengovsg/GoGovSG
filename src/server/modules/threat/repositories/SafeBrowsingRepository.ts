/* eslint-disable class-methods-use-this */

import { inject, injectable } from 'inversify'
import { safeBrowsingClient } from '../../../redis'
import * as interfaces from '../interfaces'
import { TwoWayMapper } from '../../../mappers/TwoWayMapper'
import { DependencyIds } from '../../../constants'
import { NotFoundError } from '../../../util/error'
import { WebRiskThreat } from '../../../repositories/types'

// set default threat cache
const DEFAULT_CACHE_DURATION_IN_S = 300

@injectable()
export class SafeBrowsingRepository
  implements interfaces.SafeBrowsingRepository
{
  private safeBrowsingMapper: TwoWayMapper<WebRiskThreat, string>

  public constructor(
    @inject(DependencyIds.safeBrowsingMapper)
    safeBrowsingMapper: TwoWayMapper<WebRiskThreat, string>,
  ) {
    this.safeBrowsingMapper = safeBrowsingMapper
  }

  public set: (url: string, threat: WebRiskThreat) => Promise<void> = (
    url,
    threat,
  ) => {
    return new Promise((resolve, reject) => {
      if (!threat) {
        reject(
          new NotFoundError(`No threat found for ${url}, should not persist`),
        )
      }
      safeBrowsingClient.set(
        url,
        this.safeBrowsingMapper.dtoToPersistence(threat),
        'EX',
        DEFAULT_CACHE_DURATION_IN_S,
        (redisSetError) => {
          if (redisSetError) {
            reject(redisSetError)
            return
          }

          resolve()
        },
      )
    })
  }

  public get: (url: string) => Promise<WebRiskThreat | null> = (url) => {
    return new Promise((resolve, reject) => {
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
}

export default SafeBrowsingRepository
