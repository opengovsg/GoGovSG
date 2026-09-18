import { UserTagsQueryConditions } from '../../../repositories/types.js'

interface TagManagementServiceInterface {
  getTagsWithConditions: (
    conditions: UserTagsQueryConditions,
  ) => Promise<string[]>
}

export default TagManagementServiceInterface
