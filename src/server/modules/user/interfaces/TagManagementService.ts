import { UserTagsQueryConditions } from '../../../repositories/types'

interface TagManagementServiceInterface {
  getTagsWithConditions: (
    conditions: UserTagsQueryConditions,
  ) => Promise<string[]>
}

export default TagManagementServiceInterface
