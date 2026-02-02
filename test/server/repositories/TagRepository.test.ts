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
  const findOneSpy = jest.spyOn(tagModelMock, 'findOne')
  const createSpy = jest.spyOn(tagModelMock, 'create')
  const findAll = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
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
        tagKey: {
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

  it('upsertTags calls `Tag.findOne` correctly 2 times and calls `Tag.create` for tags that cannot be found', async () => {
    // Arrange
    const findOneResults = [null, 'Tag 1']
    findOneResults.forEach((result) => {
      findOneSpy.mockResolvedValueOnce(result)
    })
    const tags = ['Tag1', 'Tag2']
    const mockTransaction = sequelizeMock.transaction

    // Act
    await repository.upsertTags(tags, mockTransaction)

    // Assert
    expect(findOneSpy).toHaveBeenCalledTimes(tags.length)
    // NOTE: Only called once as `findOne` only returns `null` once
    expect(createSpy).toHaveBeenCalledTimes(1)
  })

  it('upsertTags calls Tag.findOrCreate correctly 3 times and does not call `Tag.create` when all tags can be found', async () => {
    // Arrange
    const tags = ['Tag1', 'Tag2', 'Tag3']
    tags.forEach((tag) => findOneSpy.mockResolvedValueOnce(tag))

    const mockTransaction = sequelizeMock.transaction

    // Act
    await repository.upsertTags(tags, mockTransaction)

    // Assert
    expect(findOneSpy).toHaveBeenCalledTimes(tags.length)
    expect(createSpy).toHaveBeenCalledTimes(0)
  })
})
