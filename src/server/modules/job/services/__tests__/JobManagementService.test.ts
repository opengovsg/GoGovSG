import { JobItemStatusEnum } from '../../../../repositories/enums'
import { NotFoundError } from '../../../../util/error'
import JobManagementService from '../JobManagementService'
import { JobItemType } from '../../../../models/job'

const mockJobRepository = {
  findById: jest.fn(),
  create: jest.fn(),
}

const mockJobItemRepository = {
  findJobItemsByJobId: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
}

const mockUserRepository = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findOrCreateWithEmail: jest.fn(),
  findOneUrlForUser: jest.fn(),
  findUserByUrl: jest.fn(),
  findUrlsForUser: jest.fn(),
}

const service = new JobManagementService(
  mockJobRepository,
  mockJobItemRepository,
  mockUserRepository,
)

describe('JobManagementService tests', () => {
  describe('createJob', () => {
    it('should throw error if user creating job does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null)

      await expect(service.createJob(2)).rejects.toThrow(
        new NotFoundError('User not found'),
      )
      expect(mockJobRepository.create).not.toBeCalled()
    })

    it('should create job and return created job if success', async () => {
      const mockUserId = 1
      const mockUser = {
        userId: mockUserId,
      }
      const mockJob = {
        uuid: 'abc',
        userId: mockUserId,
      }
      mockUserRepository.findById.mockResolvedValue(mockUser)
      mockJobRepository.create.mockResolvedValue(mockJob)

      expect(await service.createJob(mockUserId)).toStrictEqual(mockJob)
      expect(mockJobRepository.create).toBeCalled()
    })
  })

  describe('createJobItem', () => {
    it('should throw error if job does not exist', async () => {
      const mockJobItemParams = {
        params: <JSON>(<unknown>{ testParams: 'hello world' }),
        jobId: 1,
      }
      mockJobRepository.findById.mockResolvedValue(null)
      await expect(service.createJobItem(mockJobItemParams)).rejects.toThrow(
        new NotFoundError('Job not found'),
      )
      expect(mockJobItemRepository.create).not.toBeCalled()
    })

    it('should create job item and return created job item if success', async () => {
      const mockUserId = 1
      const mockJob = {
        uuid: 'abc',
        userId: mockUserId,
      }
      const mockJobItemParams = {
        params: <JSON>(<unknown>{ testParams: 'hello world' }),
        jobId: 1,
      }
      const mockCreatedJobItem = {
        ...mockJobItemParams,
        status: JobItemStatusEnum.InProgress,
        message: '',
      }
      mockJobRepository.findById.mockResolvedValue(mockJob)
      mockJobItemRepository.create.mockResolvedValue(mockCreatedJobItem)

      expect(await service.createJobItem(mockJobItemParams)).toStrictEqual(
        mockCreatedJobItem,
      )
      expect(mockJobItemRepository.create).toBeCalled()
    })
  })

  describe('updateJobItem', () => {
    it('should throw error if job does not exist', async () => {
      const mockJobItem = {
        params: <JSON>(<unknown>{ testParams: 'hello world' }),
        jobId: 1,
        status: JobItemStatusEnum.InProgress,
        message: '',
        id: 1,
      } as unknown as JobItemType
      const updateJobItem = {
        status: JobItemStatusEnum.Failed,
        message: 'Unable to complete job',
      }
      mockJobRepository.findById.mockResolvedValue(null)
      await expect(
        service.updateJobItem(mockJobItem, updateJobItem),
      ).rejects.toThrow(new NotFoundError('Job not found'))
      expect(mockJobItemRepository.update).not.toBeCalled()
    })

    it('should throw error if job item does not exist', async () => {
      const mockUserId = 1
      const mockJob = {
        uuid: 'abc',
        userId: mockUserId,
      }
      const mockJobItem = {
        params: <JSON>(<unknown>{ testParams: 'hello world' }),
        jobId: 1,
        status: JobItemStatusEnum.InProgress,
        message: '',
        id: 25,
      } as unknown as JobItemType
      const updateJobItem = {
        status: JobItemStatusEnum.Failed,
        message: 'Unable to complete job',
      }
      mockJobRepository.findById.mockResolvedValue(mockJob)
      mockJobItemRepository.findById.mockResolvedValue(null)
      await expect(
        service.updateJobItem(mockJobItem, updateJobItem),
      ).rejects.toThrow(new NotFoundError('Job item not found'))
      expect(mockJobItemRepository.update).not.toBeCalled()
    })
  })

  describe('getJobStatus', () => {
    it('should throw error if job does not exist', async () => {
      mockJobRepository.findById.mockResolvedValue(null)
      await expect(service.getJobStatus(2)).rejects.toThrow(
        new NotFoundError('Job not found'),
      )
      expect(mockJobItemRepository.findJobItemsByJobId).not.toBeCalled()
    })

    it('should throw error if job has no job items', async () => {
      const mockUserId = 1
      const mockJob = {
        uuid: 'abc',
        userId: mockUserId,
        id: 2,
      }
      mockJobRepository.findById.mockResolvedValue(mockJob)
      mockJobItemRepository.findJobItemsByJobId.mockResolvedValue([])
      await expect(service.getJobStatus(2)).rejects.toThrow(
        new Error('Job does not have any job items'),
      )
    })

    it('should return JobStatus.Failed if any job item fails', async () => {
      const mockUserId = 1
      const mockJob = {
        uuid: 'abc',
        userId: mockUserId,
      }
      const mockJobItems = [
        {
          status: JobItemStatusEnum.Success,
          message: '',
          params: <JSON>(<unknown>{ testParams: 'hello' }),
          jobId: 1,
        },
        {
          status: JobItemStatusEnum.InProgress,
          message: '',
          params: <JSON>(<unknown>{ testParams: 'hello' }),
          jobId: 1,
        },
        {
          status: JobItemStatusEnum.Failed,
          message: '',
          params: <JSON>(<unknown>{ testParams: 'hello' }),
          jobId: 1,
        },
      ]
      mockJobRepository.findById.mockResolvedValue(mockJob)
      mockJobItemRepository.findJobItemsByJobId.mockResolvedValue(mockJobItems)

      expect(await service.getJobStatus(1)).toStrictEqual(
        JobItemStatusEnum.Failed,
      )
    })

    it('should return JobStatus.InProgress if no job item has failed and at least one job item is still in progress', async () => {
      const mockUserId = 1
      const mockJob = {
        uuid: 'abc',
        userId: mockUserId,
      }
      const mockJobItems = [
        {
          status: JobItemStatusEnum.InProgress,
          message: '',
          params: <JSON>(<unknown>{ testParams: 'hello' }),
          jobId: 1,
        },
        {
          status: JobItemStatusEnum.Success,
          message: '',
          params: <JSON>(<unknown>{ testParams: 'hello' }),
          jobId: 1,
        },
        {
          status: JobItemStatusEnum.Success,
          message: '',
          params: <JSON>(<unknown>{ testParams: 'hello' }),
          jobId: 1,
        },
      ]
      mockJobRepository.findById.mockResolvedValue(mockJob)
      mockJobItemRepository.findJobItemsByJobId.mockResolvedValue(mockJobItems)

      expect(await service.getJobStatus(1)).toStrictEqual(
        JobItemStatusEnum.InProgress,
      )
    })

    it('should return JobStatus.Success only if all job items are successful', async () => {
      const mockUserId = 1
      const mockJob = {
        uuid: 'abc',
        userId: mockUserId,
      }
      const mockJobItems = [
        {
          status: JobItemStatusEnum.Success,
          message: '',
          params: <JSON>(<unknown>{ testParams: 'hello' }),
          jobId: 1,
        },
        {
          status: JobItemStatusEnum.Success,
          message: '',
          params: <JSON>(<unknown>{ testParams: 'hello' }),
          jobId: 1,
        },
        {
          status: JobItemStatusEnum.Success,
          message: '',
          params: <JSON>(<unknown>{ testParams: 'hello' }),
          jobId: 1,
        },
      ]
      mockJobRepository.findById.mockResolvedValue(mockJob)
      mockJobItemRepository.findJobItemsByJobId.mockResolvedValue(mockJobItems)

      expect(await service.getJobStatus(1)).toStrictEqual(
        JobItemStatusEnum.Success,
      )
    })
  })
})
