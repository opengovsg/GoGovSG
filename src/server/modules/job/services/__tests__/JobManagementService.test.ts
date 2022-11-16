import { JobItemStatusEnum } from '../../../../repositories/enums'
import { NotFoundError } from '../../../../util/error'
import JobManagementService from '../JobManagementService'
import { JobItemCallbackStatus } from '../../interfaces'
import { JobItemType } from '../../../../models/job'

const mockJobRepository = {
  findById: jest.fn(),
  create: jest.fn(),
  findLatestJobForUser: jest.fn(),
}

const mockJobItemRepository = {
  findJobItemsByJobId: jest.fn(),
  findByJobItemId: jest.fn(),
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
        jobItemId: 'abc/0',
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
        jobItemId: 'abc/0',
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
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should throw error if job item does not exist', async () => {
      const jobItemId = 'abc/0'
      const updateJobItem = {
        isSuccess: false,
        errorMessage: 'Unable to complete job',
      } as JobItemCallbackStatus
      mockJobItemRepository.findByJobItemId.mockResolvedValue(null)

      await expect(
        service.updateJobItem(jobItemId, updateJobItem),
      ).rejects.toThrow(new NotFoundError('Job item not found'))

      expect(mockJobItemRepository.findByJobItemId).toBeCalledWith(jobItemId)
      expect(mockJobItemRepository.update).not.toBeCalled()
    })

    it('if jobItem exists and job item failed, update job item and return updated job item', async () => {
      const jobItemId = 'abc/0'
      const currJobItem = {
        status: JobItemStatusEnum.InProgress,
        message: '',
        params: <JSON>(<unknown>{ testParams: 'hello world' }),
        jobId: 1,
        jobItemId,
      }
      const updateStatus = {
        isSuccess: false,
        errorMessage: 'Unable to complete job',
      } as JobItemCallbackStatus

      const updateChanges = {
        status: JobItemStatusEnum.Failed,
        message: 'Unable to complete job',
      }
      const updatedJobItem = {
        ...currJobItem,
        ...updateChanges,
      }

      mockJobItemRepository.findByJobItemId.mockResolvedValue(currJobItem)
      mockJobItemRepository.update.mockResolvedValue(updatedJobItem)

      await expect(
        service.updateJobItem(jobItemId, updateStatus),
      ).resolves.toEqual(updatedJobItem)
      expect(mockJobItemRepository.findByJobItemId).toBeCalledWith(jobItemId)
      expect(mockJobItemRepository.update).toBeCalledWith(
        currJobItem,
        updateChanges,
      )
    })

    it('if jobItem exists and job item succeeded, update job item and return updated job item', async () => {
      const jobItemId = 'abc/0'
      const currJobItem = {
        status: JobItemStatusEnum.InProgress,
        message: '',
        params: <JSON>(<unknown>{ testParams: 'hello world' }),
        jobId: 1,
        jobItemId,
      }
      const updateStatus = {
        isSuccess: true,
      } as JobItemCallbackStatus

      const updateChanges = {
        status: JobItemStatusEnum.Success,
        message: '',
      }
      const updatedJobItem = {
        ...currJobItem,
        ...updateChanges,
      }

      mockJobItemRepository.findByJobItemId.mockResolvedValue(currJobItem)
      mockJobItemRepository.update.mockResolvedValue(updatedJobItem)

      await expect(
        service.updateJobItem(jobItemId, updateStatus),
      ).resolves.toEqual(updatedJobItem)
      expect(mockJobItemRepository.findByJobItemId).toBeCalledWith(jobItemId)
      expect(mockJobItemRepository.update).toBeCalledWith(
        currJobItem,
        updateChanges,
      )
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
          jobItemId: `abc/0`,
          id: 0,
        },
        {
          status: JobItemStatusEnum.InProgress,
          message: '',
          params: <JSON>(<unknown>{ testParams: 'hello' }),
          jobId: 1,
          jobItemId: `abc/1`,
          id: 1,
        },
        {
          status: JobItemStatusEnum.Failed,
          message: '',
          params: <JSON>(<unknown>{ testParams: 'hello' }),
          jobId: 1,
          jobItemId: 'abc/2',
          id: 2,
        },
      ] as JobItemType[]
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
          jobItemId: 'abc/0',
          id: 0,
        },
        {
          status: JobItemStatusEnum.Success,
          message: '',
          params: <JSON>(<unknown>{ testParams: 'hello' }),
          jobId: 1,
          jobItemId: 'abc/1',
          id: 1,
        },
        {
          status: JobItemStatusEnum.Success,
          message: '',
          params: <JSON>(<unknown>{ testParams: 'hello' }),
          jobId: 1,
          jobItemId: 'abc/2',
          id: 2,
        },
      ] as JobItemType[]
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
          jobItemId: 'abc/0',
          id: 0,
        },
        {
          status: JobItemStatusEnum.Success,
          message: '',
          params: <JSON>(<unknown>{ testParams: 'hello' }),
          jobId: 1,
          jobItemId: 'abc/1',
          id: 1,
        },
        {
          status: JobItemStatusEnum.Success,
          message: '',
          params: <JSON>(<unknown>{ testParams: 'hello' }),
          jobId: 1,
          jobItemId: 'abc/2',
          id: 2,
        },
      ] as JobItemType[]
      mockJobRepository.findById.mockResolvedValue(mockJob)
      mockJobItemRepository.findJobItemsByJobId.mockResolvedValue(mockJobItems)

      expect(await service.getJobStatus(1)).toStrictEqual(
        JobItemStatusEnum.Success,
      )
    })
  })
})
