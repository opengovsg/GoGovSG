import { Mapper } from './Mapper'

export interface TwoWayMapper<Dto, Persistence>
  extends Mapper<Dto, Persistence> {
  dtoToPersistence(persistence: Dto): Persistence
  dtoToPersistence(persistence: Dto | null): Persistence | null
}
