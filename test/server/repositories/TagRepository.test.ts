import { Op } from 'sequelize'
import { tagModelMock } from '../api/util'
import { TagRepository } from '../../../src/server/repositories/TagRepository'
import { TagMapper } from '../../../src/server/mappers/TagMapper'
import { Url } from '../../../src/server/models/url'

jest.mock('../../../src/server/models/tag', () => ({
  Tag: tagModelMock,
}))

const repository = new TagRepository(new TagMapper())
describe('TagRepository', () => {
  const userId = 2
  const searchText = 'tag1'
  const scope = jest.spyOn(tagModelMock, 'scope')
  const findAll = jest.fn()

  beforeEach(() => {
    findAll.mockReset()
    scope.mockReset()
  })

  it('passes findTagsWithConditions through findAll', async () => {
    scope.mockImplementationOnce(() => ({ findAll }))
    const conditions = { userId, searchText, limit: 5 }
    findAll.mockResolvedValue([])
    await expect(
      repository.findTagsWithConditions(conditions),
    ).resolves.toEqual([])
    expect(scope).toHaveBeenCalledWith(['defaultScope'])
    expect(findAll).toHaveBeenCalledWith({
      where: {
        tagString: {
          [Op.like]: `${conditions.searchText}%`,
        },
      },
      limit: conditions.limit,
      include: [
        {
          model: Url,
          where: { userId: conditions.userId },
        },
      ],
    })
  })
})
