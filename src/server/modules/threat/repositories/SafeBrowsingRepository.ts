/* eslint-disable class-methods-use-this */

import { inject, injectable } from 'inversify'
import { safeBrowsingClient } from '../../../redis.js'
import * as interfaces from '../interfaces/index.js'
import { TwoWayMapper } from '../../../mappers/TwoWayMapper.js'
import { DependencyIds } from '../../../constants.js'
import { NotFoundError } from '../../../util/error.js'
import { WebRiskThreat } from '../../../repositories/types.js'

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

  public set: (url: string, threat: WebRiskThreat) => Promise<void> = async (
    url,
    threat,
  ) => {
    if (!threat) {
      throw new NotFoundError(`No threat found for ${url}, should not persist`)
    }
    await safeBrowsingClient.setEx(
      url,
      DEFAULT_CACHE_DURATION_IN_S,
      this.safeBrowsingMapper.dtoToPersistence(threat),
    )
  }

  public get: (url: string) => Promise<WebRiskThreat | null> = async (url) => {
    const string = await safeBrowsingClient.get(url)
    if (!string) {
      return null
    }
    return this.safeBrowsingMapper.persistenceToDto(string)
  }
}

export default SafeBrowsingRepository
