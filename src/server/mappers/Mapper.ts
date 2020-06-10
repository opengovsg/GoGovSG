export interface Mapper<Dto, Persistence> {
  persistenceToDto(persistence: Persistence): Dto
  persistenceToDto(persistence: Persistence | null): Dto | null
}
