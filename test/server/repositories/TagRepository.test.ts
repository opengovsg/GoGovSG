import { TagRepository } from '../../../src/server/repositories/TagRepository'
import { tagModelMock } from '../api/util'

const repository = new TagRepository()
describe('TagRepository', () => {
  const userId = 2
  const searchText = 'tag1'

  it('passes findTagsWithConditions through findAndCountAll', async () => {
    const conditions = { userId, searchText, limit: 5 }
    const findAndCountAll = jest.spyOn(tagModelMock, 'findAndCountAll')
    await expect(
      repository.findTagsWithConditions(conditions),
    ).resolves.toBeNull()
    expect(findAndCountAll).toHaveBeenCalledWith({ where: { searchText } })
  })
})
