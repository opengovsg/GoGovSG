import { Op } from 'sequelize'
import { TagRepository } from '../../../src/server/repositories/TagRepository'
import { tagModelMock } from '../api/util'
import { TagMapper } from '../../../src/server/mappers/TagMapper'

jest.mock('../../../src/server/models/tag', () => ({
  Tag: tagModelMock,
}))

const repository = new TagRepository(new TagMapper())
describe('TagRepository', () => {
  const userId = 2
  const searchText = 'tag1'

  it('passes findTagsWithConditions through findAndCountAll', async () => {
    const conditions = { userId, searchText, limit: 5 }
    const findAndCountAll = jest.spyOn(tagModelMock, 'findAll')
    await expect(
      repository.findTagsWithConditions(conditions),
    ).resolves.toBeNull()
    expect(findAndCountAll).toHaveBeenCalledWith({
      where: {
        tagString: {
          [Op.like]: `${conditions.searchText}%`,
        },
      },
    })
  })
})
