/* eslint-disable global-require */
import SequelizeMock from 'sequelize-mock'
import { JobItemStatusEnum } from '../../../../../shared/util/jobs'

export const sequelizeMock = new SequelizeMock()

export const jobItemModelMock = {
  create: jest.fn(),
  scope: jest.fn(),
}

jest.mock('../../../../models/job', () => ({
  JobItem: jobItemModelMock,
}))

describe('JobItemRepository', () => {
  const { JobItemRepository } = require('../JobItemRepository')
  const repository = new JobItemRepository()

  const create = jest.spyOn(jobItemModelMock, 'create')
  const scope = jest.spyOn(jobItemModelMock, 'scope')

  beforeEach(() => {
    create.mockReset()
    scope.mockReset()
  })

  describe('findByJobItemId', () => {
    const mockJobItem = {
      id: 1,
      jobId: 3,
      params: 'hi',
      status: JobItemStatusEnum.InProgress,
      jobItemId: '123/0',
    }
    const findOne = jest.fn()

    it('findByJobItemId uses default scope, passes to findOne, and returns if it exists', async () => {
      scope.mockImplementationOnce(() => ({ findOne }))
      findOne.mockResolvedValueOnce(mockJobItem)
      await expect(repository.findByJobItemId(1)).resolves.toEqual(mockJobItem)
      expect(scope).toBeCalledWith(['defaultScope'])
    })
  })

  describe('findJobItemsByJobId', () => {
    const mockJobItems = [
      {
        id: 1,
        jobId: 3,
        params: 'hi',
        status: JobItemStatusEnum.InProgress,
        jobItemId: '123/0',
      },
      {
        id: 1,
        jobId: 3,
        params: 'hi',
        status: JobItemStatusEnum.Success,
        jobItemId: '123/0',
      },
    ]
    const findAll = jest.fn()
    const jobId = 3

    it('findJobItemsByJobId uses default scope, passes to findAll and returns list of jobItems if any', async () => {
      scope.mockImplementationOnce(() => ({ findAll }))
      findAll.mockResolvedValueOnce(mockJobItems)
      await expect(repository.findJobItemsByJobId(jobId)).resolves.toEqual(
        mockJobItems,
      )
    })
  })

  describe('create', () => {
    const jobItemProperties = {
      jobId: 3,
      params: 'hi',
      status: JobItemStatusEnum.InProgress,
      jobItemId: '123/0',
    }
    const expectedJobItem = {
      ...jobItemProperties,
      id: 2,
    }
    it('create calls JobItem.create and returns created jobItem', async () => {
      create.mockImplementationOnce(() => ({ ...jobItemProperties, id: 2 }))
      await expect(repository.create(jobItemProperties)).resolves.toEqual(
        expectedJobItem,
      )
    })
  })

  describe('update', () => {
    const mockJobItem = {
      id: 1,
      jobId: 3,
      params: 'hi',
      status: JobItemStatusEnum.InProgress,
      jobItemId: '123/0',
      update: jest.fn(),
    }
    const mockChanges = {
      status: JobItemStatusEnum.Success,
    }
    const update = jest.spyOn(mockJobItem, 'update')
    const findOne = jest.fn()

    it('update uses default scope, passes to findOne, calls JobItem.update, and returns updated job', async () => {
      scope.mockImplementationOnce(() => ({ findOne }))
      findOne.mockResolvedValueOnce(mockJobItem)
      update.mockImplementationOnce(() => ({ ...mockJobItem, ...mockChanges }))

      await expect(
        repository.update(mockJobItem, mockChanges),
      ).resolves.toStrictEqual({ ...mockJobItem, ...mockChanges })
      expect(scope).toHaveBeenCalledWith(['defaultScope'])
      expect(findOne).toHaveBeenCalledWith({ where: { id: 1 } })
      expect(update).toHaveBeenCalledWith(mockChanges)
    })
  })
})
