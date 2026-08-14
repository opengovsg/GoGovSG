import { inject, injectable } from 'inversify'
import { UserTagsQueryConditions } from '../../../repositories/types.js'
import { DependencyIds } from '../../../constants.js'
import { TagRepositoryInterface } from '../../../repositories/interfaces/TagRepositoryInterface.js'
import TagManagementServiceInterface from '../interfaces/TagManagementService.js'

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
