/* eslint-disable class-methods-use-this, lines-between-class-members, no-dupe-class-members */
import { injectable } from 'inversify'
import { TwoWayMapper } from '../../../mappers/TwoWayMapper'
import { HasCacheDuration } from '../../../repositories/types'

@injectable()
export class SafeBrowsingMapper
  implements TwoWayMapper<HasCacheDuration[], string> {
  persistenceToDto(matches: string): HasCacheDuration[]
  persistenceToDto(matches: string | null): HasCacheDuration[] | null {
    if (!matches) {
      return null
    }
    return JSON.parse(matches)
  }

  dtoToPersistence(matches: HasCacheDuration[]): string
  dtoToPersistence(matches: HasCacheDuration[] | null): string | null {
    if (!matches) {
      return null
    }

    return JSON.stringify(matches)
  }
}

export default SafeBrowsingMapper
