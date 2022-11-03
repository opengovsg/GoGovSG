import { inject, injectable } from 'inversify'
import { UserTagsQueryConditions } from '../../../repositories/types'
import { DependencyIds } from '../../../constants'
import { TagRepositoryInterface } from '../../../repositories/interfaces/TagRepositoryInterface'
import TagManagementServiceInterface from '../interfaces/TagManagementService'

@injectable()
class TagManagementService implements TagManagementServiceInterface {
  private tagRepository: TagRepositoryInterface

  constructor(
    @inject(DependencyIds.tagRepository)
    tagRepository: TagRepositoryInterface,
  ) {
    this.tagRepository = tagRepository
  }

  getTagsWithConditions: (
    conditions: UserTagsQueryConditions,
  ) => Promise<string[]> = (conditions) => {
    return this.tagRepository.findTagsWithConditions(conditions)
  }
}

export default TagManagementService
