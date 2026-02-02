/* eslint-disable class-methods-use-this, lines-between-class-members, no-dupe-class-members */
import { injectable } from 'inversify'
import { TwoWayMapper } from '../../../mappers/TwoWayMapper'
import { WebRiskThreat } from '../../../repositories/types'

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
