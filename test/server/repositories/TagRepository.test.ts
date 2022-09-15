import { Op } from 'sequelize'
import { sequelizeMock, tagModelMock } from '../api/util'
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
  const findOrCreate = jest.spyOn(tagModelMock, 'findOrCreate')
  const findAll = jest.fn()

  beforeEach(() => {
    findAll.mockReset()
    scope.mockReset()
    findOrCreate.mockReset()
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

  it('upsertTags calls Tag.findOrCreate correctly 2 times', async () => {
    findOrCreate.mockResolvedValue([])
    const tags = ['Tag1', 'Tag2']
    const mockTransaction = sequelizeMock.transaction
    await repository.upsertTags(tags, mockTransaction)
    expect(findOrCreate).toHaveBeenCalledTimes(tags.length)
  })

  it('upsertTags calls Tag.findOrCreate correctly 3 times', async () => {
    findOrCreate.mockResolvedValue([])
    const tags = ['Tag1', 'Tag2', 'Tag3']
    const mockTransaction = sequelizeMock.transaction
    await repository.upsertTags(tags, mockTransaction)
    expect(findOrCreate).toHaveBeenCalledTimes(tags.length)
  })
})
