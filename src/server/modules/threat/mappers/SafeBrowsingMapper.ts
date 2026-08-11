/* eslint-disable class-methods-use-this, no-dupe-class-members */
import { injectable } from 'inversify'
import { TwoWayMapper } from '../../../mappers/TwoWayMapper.js'
import { WebRiskThreat } from '../../../repositories/types.js'

@injectable()
export class SafeBrowsingMapper implements TwoWayMapper<WebRiskThreat, string> {
  persistenceToDto(threat: string): WebRiskThreat
  persistenceToDto(threat: string | null): WebRiskThreat | null {
    if (!threat) {
      return null
    }
    return JSON.parse(threat)
  }

  dtoToPersistence(threat: WebRiskThreat): string
  dtoToPersistence(threat: WebRiskThreat | null): string | null {
    if (!threat) {
      return null
    }

    return JSON.stringify(threat)
  }
}

export default SafeBrowsingMapper
