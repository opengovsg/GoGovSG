/* eslint-disable global-require */
import SequelizeMock from 'sequelize-mock'
import { JobStatusEnum } from '../../../../../shared/util/jobs'

export const sequelizeMock = new SequelizeMock()

export const jobModelMock = {
  create: jest.fn(),
  scope: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
}

jest.mock('../../../../models/job', () => ({
  Job: jobModelMock,
}))

describe('JobRepository', () => {
  const userId = 2
  const { JobRepository } = require('../JobRepository')
  const repository = new JobRepository()

  const create = jest.spyOn(jobModelMock, 'create')
  const scope = jest.spyOn(jobModelMock, 'scope')
  const findByPk = jest.spyOn(jobModelMock, 'findByPk')
  const findOne = jest.spyOn(jobModelMock, 'findOne')

  beforeEach(() => {
    create.mockReset()
    scope.mockReset()
    findByPk.mockReset()
    findOne.mockReset()
  })

  describe('findById', () => {
    it('findById calls Job.findByPk and returns if it exists', async () => {
      findByPk.mockImplementationOnce(() => ({ id: 1 }))
      await expect(repository.findById(1)).resolves.toEqual({ id: 1 })
      expect(findByPk).toBeCalledWith(1)
    })
  })

  describe('create', () => {
    it('create calls Job.create and returns created job', async () => {
      create.mockImplementationOnce(() => ({ id: 1 }))
      await expect(repository.create(userId)).resolves.toEqual({ id: 1 })
    })
  })

  describe('update', () => {
    const mockJob = {
      id: 1,
      update: jest.fn(),
      userId: 3,
      status: JobStatusEnum.InProgress,
    }
    const mockChanges = {
      status: JobStatusEnum.Success,
    }
    const update = jest.spyOn(mockJob, 'update')
    const findOne = jest.fn()

    it('update uses default scope, passes to findOne, calls Job.update, and returns updated job', async () => {
      scope.mockImplementationOnce(() => ({ findOne }))
      findOne.mockResolvedValueOnce(mockJob)
      update.mockImplementationOnce(() => ({ ...mockJob, ...mockChanges }))

      await expect(
        repository.update(mockJob, mockChanges),
      ).resolves.toStrictEqual({ ...mockJob, ...mockChanges })
      expect(scope).toHaveBeenCalledWith(['defaultScope'])
      expect(findOne).toHaveBeenCalledWith({ where: { id: 1 } })
      expect(update).toHaveBeenCalledWith(mockChanges)
    })
  })

  describe('findLatestJobForUser', () => {
    const mockJob = {
      id: 1,
      update: jest.fn(),
      userId: 3,
      status: JobStatusEnum.InProgress,
    }

    it('findLatestJobForUser calls Job.findOne and returns output', async () => {
      findOne.mockImplementationOnce(() => mockJob)
      await expect(repository.findLatestJobForUser(userId)).resolves.toEqual(
        mockJob,
      )
      expect(findOne).toBeCalledWith({
        where: {
          userId,
        },
        order: [['createdAt', 'DESC']],
      })
    })
  })

  describe('findJobForUser', () => {
    const mockJob = {
      id: 1,
      update: jest.fn(),
      userId: 3,
      status: JobStatusEnum.InProgress,
    }

    it('findJobForUser calls Job.findOne and returns output', async () => {
      findOne.mockImplementationOnce(() => mockJob)
      await expect(repository.findJobForUser(userId, 1)).resolves.toEqual(
        mockJob,
      )
      expect(findOne).toBeCalledWith({
        where: {
          userId,
          id: 1,
        },
      })
    })
  })
})
