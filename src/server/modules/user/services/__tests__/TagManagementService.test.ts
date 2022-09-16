import TagManagementService from '../TagManagementService'
import TagRepositoryMock from '../../../../../../test/server/mocks/repositories/TagRepository'

const tagRepository = new TagRepositoryMock()

const service = new TagManagementService(tagRepository)

describe('tag repository', () => {
  it('passes through getTagsWithConditions to TagRepository', async () => {
    const conditions = {
      limit: 5,
      searchText: 'tag1',
      userId: 1,
    }
    service.getTagsWithConditions(conditions)
    expect(tagRepository.findTagsWithConditions).toHaveBeenCalledWith(
      conditions,
    )
  })
})
