import { Mapper } from './Mapper.js'

export interface TwoWayMapper<Dto, Persistence> extends Mapper<
  Dto,
  Persistence
> {
  dtoToPersistence(persistence: Dto): Persistence
  dtoToPersistence(persistence: Dto | null): Persistence | null
}
