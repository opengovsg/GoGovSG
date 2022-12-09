/* eslint-disable global-require */
import {
  JobItemStatusEnum,
  JobStatusEnum,
} from '../../../../../shared/util/jobs'
import { NotFoundError } from '../../../../util/error'
import { JobManagementService } from '..'
import { JobInformation, JobItemCallbackStatus } from '../../interfaces'
import { JobItemType, JobType } from '../../../../models/job'

const mockJobRepository = {
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findLatestJobForUser: jest.fn(),
  findJobForUser: jest.fn(),
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
  saveApiKeyHash: jest.fn(),
  findUserByApiKey: jest.fn(),
  hasApiKey: jest.fn(),
}

const mockMailer = {
  initMailer: jest.fn(),
  mailOTP: jest.fn(),
  mailJobFailure: jest.fn(),
  mailJobSuccess: jest.fn(),
}

const service = new JobManagementService(
  mockJobRepository,
  mockJobItemRepository,
  mockUserRepository,
  mockMailer,
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
        id: 2,
        status: JobStatusEnum.InProgress,
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
        id: 1,
        status: JobStatusEnum.InProgress,
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

  describe('updateJobItemStatus', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should throw error if job item does not exist', async () => {
      const jobItemId = 'abc/0'
      const updateJobItemStatus = {
        isSuccess: false,
        errorMessage: 'Unable to complete job',
      } as JobItemCallbackStatus
      mockJobItemRepository.findByJobItemId.mockResolvedValue(null)

      await expect(
        service.updateJobItemStatus(jobItemId, updateJobItemStatus),
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
        status: JobItemStatusEnum.Failure,
        message: 'Unable to complete job',
      }
      const updatedJobItem = {
        ...currJobItem,
        ...updateChanges,
      }

      mockJobItemRepository.findByJobItemId.mockResolvedValue(currJobItem)
      mockJobItemRepository.update.mockResolvedValue(updatedJobItem)

      await expect(
        service.updateJobItemStatus(jobItemId, updateStatus),
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
        service.updateJobItemStatus(jobItemId, updateStatus),
      ).resolves.toEqual(updatedJobItem)
      expect(mockJobItemRepository.findByJobItemId).toBeCalledWith(jobItemId)
      expect(mockJobItemRepository.update).toBeCalledWith(
        currJobItem,
        updateChanges,
      )
    })
  })

  describe('computeJobStatus', () => {
    it('should return JobStatusEnum.Failure if any job item fails', async () => {
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
          status: JobItemStatusEnum.Failure,
          message: '',
          params: <JSON>(<unknown>{ testParams: 'hello' }),
          jobId: 1,
          jobItemId: 'abc/2',
          id: 2,
        },
      ] as JobItemType[]

      expect(service.computeJobStatus(mockJobItems)).toStrictEqual(
        JobStatusEnum.Failure,
      )
    })

    it('should return JobStatus.InProgress if no job item has failed and at least one job item is still in progress', async () => {
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

      expect(service.computeJobStatus(mockJobItems)).toStrictEqual(
        JobItemStatusEnum.InProgress,
      )
    })

    it('should return JobStatus.Success only if all job items are successful', async () => {
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

      expect(service.computeJobStatus(mockJobItems)).toStrictEqual(
        JobItemStatusEnum.Success,
      )
    })
  })

  describe('updateJobStatus', () => {
    const spy = jest.spyOn(service, 'computeJobStatus')

    beforeAll(() => {
      mockJobItemRepository.findByJobItemId.mockClear()
      mockJobRepository.findById.mockClear()
      spy.mockClear()
    })

    it('should throw error if job does not exist', async () => {
      mockJobRepository.findById.mockResolvedValue(null)

      await expect(service.updateJobStatus(2)).rejects.toThrow(
        new NotFoundError('Job not found'),
      )
      expect(mockJobItemRepository.findJobItemsByJobId).not.toBeCalled()
      expect(spy).not.toBeCalled()
    })

    it('should throw error if job has no job items', async () => {
      const mockUserId = 1
      const mockJob = {
        uuid: 'abc',
        userId: mockUserId,
        id: 2,
        status: JobStatusEnum.InProgress,
      }
      mockJobRepository.findById.mockResolvedValue(mockJob)
      mockJobItemRepository.findJobItemsByJobId.mockResolvedValue([])

      await expect(service.updateJobStatus(2)).rejects.toThrow(
        new Error('Job does not have any job items'),
      )
      expect(spy).not.toBeCalled()
    })

    it('should call computeJobStatus and update job status if job status has changed', async () => {
      const mockUserId = 1
      const mockJob = {
        uuid: 'abc',
        userId: mockUserId,
        id: 2,
        status: JobStatusEnum.InProgress,
      }
      const mockJobItems = [
        {
          status: JobItemStatusEnum.Success,
          message: '',
          params: <JSON>(<unknown>{ testParams: 'hello' }),
          jobId: 2,
          jobItemId: 'abc/0',
          id: 0,
        },
      ] as JobItemType[]
      const updatedMockJob = {
        uuid: 'abc',
        userId: mockUserId,
        id: 2,
        status: JobStatusEnum.Success,
      }
      mockJobRepository.findById.mockResolvedValue(mockJob)
      mockJobItemRepository.findJobItemsByJobId.mockResolvedValue(mockJobItems)
      mockJobRepository.update.mockResolvedValue(updatedMockJob)

      await expect(service.updateJobStatus(2)).resolves.toStrictEqual(
        updatedMockJob,
      )

      expect(spy).toBeCalledTimes(1)
      expect(mockJobRepository.update).toBeCalledWith(mockJob, {
        status: JobStatusEnum.Success,
      })
    })
  })

  describe('getJobInformation', () => {
    beforeEach(() => {
      mockJobItemRepository.findJobItemsByJobId.mockClear()
      mockJobRepository.findById.mockClear()
    })

    it('should throw error if job does not exist', async () => {
      mockJobRepository.findById.mockResolvedValue(null)
      await expect(service.getJobInformation(2)).rejects.toThrow(
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
      await expect(service.getJobInformation(2)).rejects.toThrow(
        new Error('Job does not have any job items'),
      )
    })

    it('should return job and jobItemUrls if successfully retrieved', async () => {
      jest.resetModules()
      jest.mock('../../../../config', () => ({
        qrCodeBucketUrl: 'https://bucket.com',
      }))

      const { JobManagementService } = require('..')

      const service = new JobManagementService(
        mockJobRepository,
        mockJobItemRepository,
        mockUserRepository,
      )

      const mockUserId = 1
      const mockJob = {
        uuid: 'abc',
        userId: mockUserId,
        id: 2,
        status: JobStatusEnum.Success,
      }
      const mockJobItems = [
        {
          status: JobItemStatusEnum.Success,
          message: '',
          params: <JSON>(<unknown>{ testParams: 'hello' }),
          jobId: 2,
          jobItemId: 'abc/0',
          id: 1,
        },
      ]
      mockJobRepository.findById.mockResolvedValue(mockJob)
      mockJobItemRepository.findJobItemsByJobId.mockResolvedValue(mockJobItems)
      await expect(service.getJobInformation(2)).resolves.toStrictEqual({
        job: mockJob,
        jobItemUrls: ['https://bucket.com/abc/0'],
      })
    })
  })

  describe('getLatestJobForUser', () => {
    const spy = jest.spyOn(service, 'getJobInformation')

    beforeEach(() => {
      spy.mockClear()
    })

    it('should throw error if user has no jobs', async () => {
      mockJobRepository.findLatestJobForUser.mockResolvedValue(null)

      await expect(service.getLatestJobForUser(2)).rejects.toThrow(
        new NotFoundError('No jobs found'),
      )
      expect(spy).not.toBeCalled()
    })

    it('should retrieve job information and return successfully', async () => {
      const mockJob = {
        uuid: 'abc',
        userId: 2,
        id: 4,
        status: JobStatusEnum.Success,
      } as unknown as JobType
      const mockJobInformation = {
        job: mockJob,
        jobItemUrls: ['https://bucket.com/abc/0'],
      } as JobInformation
      mockJobRepository.findLatestJobForUser.mockResolvedValue(mockJob)
      spy.mockImplementation(() => Promise.resolve(mockJobInformation))

      await expect(service.getLatestJobForUser(2)).resolves.toStrictEqual(
        mockJobInformation,
      )
      expect(spy).toBeCalledWith(4)
    })
  })

  describe('pollJobStatusUpdate', () => {
    it('should throw error if user has no jobs', async () => {
      mockJobRepository.findJobForUser.mockResolvedValue(null)

      await expect(service.pollJobStatusUpdate(2, 5)).rejects.toThrow(
        new NotFoundError('Job not found'),
      )
    })

    it('should throw an error if the max attempts are exceeded', async () => {
      jest.resetModules()
      jest.mock('../../../../config', () => ({
        jobPollAttempts: 2,
        jobPollInterval: 1,
      }))
      const { JobManagementService } = require('..')
      const service = new JobManagementService(
        mockJobRepository,
        mockJobItemRepository,
        mockUserRepository,
        mockMailer,
      )

      mockJobRepository.findJobForUser.mockReturnValueOnce({})
      const getJobInformationSpy = jest
        .spyOn(service, 'getJobInformation')
        .mockImplementation(() => ({
          job: { status: JobStatusEnum.InProgress },
          jobItemUrls: ['a', 'b'],
        }))

      await expect(service.pollJobStatusUpdate(1, 1)).rejects.toThrowError(
        'Exceeded max attempts',
      )
      expect(getJobInformationSpy).toHaveBeenCalledTimes(2)
    })

    it('should resolve with the updated job information if the job status has changed', async () => {
      jest.resetModules()
      jest.mock('../../../../config', () => ({
        jobPollAttempts: 2,
        jobPollInterval: 1,
      }))
      const { JobManagementService } = require('..')
      const service = new JobManagementService(
        mockJobRepository,
        mockJobItemRepository,
        mockUserRepository,
        mockMailer,
      )

      mockJobRepository.findJobForUser.mockReturnValueOnce({})
      const getJobInformationSpy = jest
        .spyOn(service, 'getJobInformation')
        .mockImplementation(() => ({
          job: { status: JobStatusEnum.Success },
          jobItemUrls: ['a', 'b'],
        }))

      await expect(service.pollJobStatusUpdate(1, 1)).resolves.toEqual({
        job: { status: JobStatusEnum.Success },
        jobItemUrls: ['a', 'b'],
      })
      expect(getJobInformationSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('sendJobCompletionEmail', () => {
    it('should throw a NotFoundError if the user is not found', async () => {
      jest.spyOn(service, 'getJobInformation').mockImplementation(
        async () =>
          ({
            job: { status: JobStatusEnum.Success },
            jobItemUrls: ['a', 'b'],
          } as JobInformation),
      )
      mockUserRepository.findById.mockReturnValueOnce(null)

      await expect(service.sendJobCompletionEmail(1)).rejects.toThrowError(
        `user not found for jobId 1`,
      )
    })

    it('should throw an error if there is an error mailing the job completion email', async () => {
      jest.spyOn(service, 'getJobInformation').mockImplementation(
        async () =>
          ({
            job: { status: JobStatusEnum.Success },
            jobItemUrls: ['a', 'b'],
          } as JobInformation),
      )
      mockUserRepository.findById.mockReturnValueOnce({
        email: 'test@email.com',
      })
      mockMailer.mailJobSuccess.mockImplementationOnce(() => {
        throw new Error('Test error')
      })

      await expect(service.sendJobCompletionEmail(1)).rejects.toThrowError(
        'Error mailing job completion email',
      )
    })

    it('should mail the job success email if the job status is Success', async () => {
      jest.spyOn(service, 'getJobInformation').mockImplementation(
        async () =>
          ({
            job: { status: JobStatusEnum.Success },
            jobItemUrls: ['a', 'b'],
          } as JobInformation),
      )
      mockUserRepository.findById.mockReturnValueOnce({
        email: 'test@email.com',
      })

      await expect(service.sendJobCompletionEmail(1)).resolves.toBeUndefined()
      expect(mockMailer.mailJobSuccess).toHaveBeenCalledWith('test@email.com', [
        'a',
        'b',
      ])
    })

    it('should mail the job failure email if the job status is Failure', async () => {
      jest.spyOn(service, 'getJobInformation').mockImplementation(
        async () =>
          ({
            job: { status: JobStatusEnum.Failure },
            jobItemUrls: ['a', 'b'],
          } as JobInformation),
      )
      mockUserRepository.findById.mockReturnValueOnce({
        email: 'test@email.com',
      })

      await expect(service.sendJobCompletionEmail(1)).resolves.toBeUndefined()
      expect(mockMailer.mailJobFailure).toHaveBeenCalledWith('test@email.com')
    })
  })
})
