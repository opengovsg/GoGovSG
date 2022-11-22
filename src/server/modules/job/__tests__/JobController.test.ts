/* eslint-disable global-require */
import httpMocks from 'node-mocks-http'
import _ from 'lodash'
import express from 'express'

import { JobItemStatusEnum, JobStatusEnum } from '../../../repositories/enums'
import { NotFoundError } from '../../../util/error'
import { JobInformation } from '../interfaces'

const jobManagementService = {
  createJob: jest.fn(),
  createJobItem: jest.fn(),
  updateJobItemStatus: jest.fn(),
  computeJobStatus: jest.fn(),
  updateJobStatus: jest.fn(),
  getLatestJobForUser: jest.fn(),
  pollJobStatusUpdate: jest.fn(),
}

const sqsService = {
  sendMessage: jest.fn(),
}

const getMockMessageParams = (
  jobUuid: string,
  idx: number,
  params: { shortUrl: string; longUrl: string }[],
) => {
  return {
    jobItemId: `${jobUuid}/${idx}`,
    mappings: params,
  }
}

const { JobController } = require('..')

const controller = new JobController(jobManagementService, sqsService)

describe('JobController unit test', () => {
  afterAll(jest.resetModules)

  describe('createAndStartJob tests', () => {
    const userId = 1
    const longUrl = 'https://google.com'
    const jobParamsList = [
      {
        shortUrl: 'n2io3n110',
        longUrl,
      },
      {
        shortUrl: 'n2io3n121',
        longUrl,
      },
      {
        shortUrl: 'n2io3n122',
        longUrl,
      },
    ]

    beforeEach(() => {
      jobManagementService.createJob.mockReset()
      jobManagementService.createJobItem.mockReset()
      sqsService.sendMessage.mockReset()
    })

    it('createAndStartJob works with 1 batch', async () => {
      jest.resetModules()
      jest.mock('../../../config', () => ({
        qrCodeJobBatchSize: 5,
        logger: {
          error: jest.fn(),
        },
      }))

      const { JobController } = require('..')

      const controller = new JobController(jobManagementService, sqsService)

      const mockJob = {
        id: userId,
        uuid: 'abc',
      }
      const expectedMockMessageParams = getMockMessageParams(
        mockJob.uuid,
        0,
        jobParamsList,
      )

      const req = httpMocks.createRequest({
        body: { userId, jobParamsList },
      })
      const res = httpMocks.createResponse()

      jobManagementService.createJob.mockResolvedValue(mockJob)
      jobManagementService.createJobItem.mockResolvedValue({})
      sqsService.sendMessage.mockResolvedValue({})

      await controller.createAndStartJob(req, res)

      expect(jobManagementService.createJob).toHaveBeenCalledWith(userId)
      expect(jobManagementService.createJobItem).toHaveBeenCalledWith({
        jobItemId: `${mockJob.uuid}/0`,
        params: <JSON>(<unknown>expectedMockMessageParams),
        jobId: mockJob.id,
      })
      expect(sqsService.sendMessage).toHaveBeenCalledWith(
        expectedMockMessageParams,
      )
    })

    it('createAndStartJob works with multiple batch', async () => {
      const qrCodeJobBatchSize = 1
      jest.resetModules()
      jest.mock('../../../config', () => ({
        qrCodeJobBatchSize,
        logger: {
          error: jest.fn(),
        },
      }))

      const { JobController } = require('..')

      const controller = new JobController(jobManagementService, sqsService)

      const mockJob = {
        id: userId,
        uuid: 'abc',
      }

      const jobBatches = _.chunk(jobParamsList, qrCodeJobBatchSize)

      const expectedCreateJobItemArgs = jobBatches.map((jobBatch, idx) => {
        return {
          params: <JSON>(
            (<unknown>getMockMessageParams(mockJob.uuid, idx, jobBatch))
          ),
          jobId: mockJob.id,
          jobItemId: `${mockJob.uuid}/${idx}`,
        }
      })

      const expectedSendMessageArgs = jobBatches.map((jobBatch, idx) =>
        getMockMessageParams(mockJob.uuid, idx, jobBatch),
      )

      const req = httpMocks.createRequest({
        body: { userId, jobParamsList },
      })
      const res = httpMocks.createResponse()

      jobManagementService.createJob.mockResolvedValue(mockJob)
      jobManagementService.createJobItem.mockResolvedValue({})
      sqsService.sendMessage.mockResolvedValue({})

      await controller.createAndStartJob(req, res)

      expect(jobManagementService.createJob).toHaveBeenCalledWith(userId)
      expect(jobManagementService.createJobItem).toHaveBeenCalledTimes(
        jobBatches.length,
      )
      expectedCreateJobItemArgs.forEach((arg, index) =>
        expect(jobManagementService.createJobItem).toHaveBeenNthCalledWith(
          index + 1,
          arg,
        ),
      ) // toHaveBeenNthCalledWith is 1 indexed
      expect(sqsService.sendMessage).toHaveBeenCalledTimes(jobBatches.length)
      expectedSendMessageArgs.forEach((arg, index) =>
        expect(sqsService.sendMessage).toHaveBeenNthCalledWith(index + 1, arg),
      ) // toHaveBeenNthCalledWith is 1 indexed
    })

    it('createAndStartJob does not start job if jobParamsList is empty', async () => {
      const req = httpMocks.createRequest({
        body: { userId, jobParamsList: [] },
      })

      await controller.createAndStartJob(req)

      expect(jobManagementService.createJob).not.toHaveBeenCalled()
      expect(jobManagementService.createJobItem).not.toHaveBeenCalled()
      expect(sqsService.sendMessage).not.toHaveBeenCalled()
    })

    it('createAndStartJob does not start job if no jobParamsList', async () => {
      const req = httpMocks.createRequest({
        body: { userId },
      })

      await controller.createAndStartJob(req)

      expect(jobManagementService.createJob).not.toHaveBeenCalled()
      expect(jobManagementService.createJobItem).not.toHaveBeenCalled()
      expect(sqsService.sendMessage).not.toHaveBeenCalled()
    })
  })

  describe('updateJobItem', () => {
    const badRequest = jest.fn()
    const ok = jest.fn()

    beforeEach(() => {
      badRequest.mockClear()
      ok.mockClear()
    })

    it('updateJobItem adds jobItem to req body if update is successful', async () => {
      const req = httpMocks.createRequest({
        body: { jobItemId: 1, status: { isSuccess: true, errorMessage: ' ' } },
      })
      const res = httpMocks.createResponse() as any
      const next = jest.fn() as unknown as express.NextFunction
      res.badRequest = badRequest
      res.ok = ok

      const mockUpdatedJobItem = {
        status: JobItemStatusEnum.Success,
        message: '',
        params: <JSON>(<unknown>{ testParams: 'hello' }),
        jobId: 2,
        jobItemId: 'abc/0',
        id: 0,
      }

      jobManagementService.updateJobItemStatus.mockReturnValue(
        mockUpdatedJobItem,
      )

      await controller.updateJobItem(req, res, next)

      expect(jobManagementService.updateJobItemStatus).toHaveBeenCalled()
      expect(req.body.jobItem).toStrictEqual(mockUpdatedJobItem)
      expect(res.ok).toHaveBeenCalled()
      expect(res.badRequest).not.toHaveBeenCalled()
    })

    it('updateJobItem does not add jobItem to req body if update is not successful', async () => {
      const req = httpMocks.createRequest({
        body: { jobItemId: 24, status: { isSuccess: true, errorMessage: ' ' } },
      })
      const res = httpMocks.createResponse() as any
      const next = jest.fn() as unknown as express.NextFunction
      res.badRequest = badRequest
      res.ok = ok
      const responseSpy = jest.spyOn(res, 'status')

      jobManagementService.updateJobItemStatus.mockRejectedValue(
        new NotFoundError('Job item not found'),
      )

      await controller.updateJobItem(req, res, next)

      expect(jobManagementService.updateJobItemStatus).toHaveBeenCalled()
      expect(req.body).not.toHaveProperty('jobItem')
      expect(res.ok).not.toHaveBeenCalled()
      expect(responseSpy).toBeCalledWith(404)
    })
  })

  describe('updateJob', () => {
    it('should succeed if jobManagementService.updateJobStatus succeeds', async () => {
      const req = httpMocks.createRequest({
        body: { jobItem: { jobId: 1 } },
      })
      const updatedJob = {
        id: 1,
        uuid: 'abc',
        status: JobStatusEnum.Success,
        userId: 1,
      }
      jobManagementService.updateJobStatus.mockResolvedValue(updatedJob)

      await controller.updateJob(req)

      expect(jobManagementService.updateJobStatus).toHaveBeenCalledWith(1)
    })

    it('should fail and log error if jobManagementService.updateJobStatus fails', async () => {
      const req = httpMocks.createRequest({
        body: { jobItem: { jobId: 1 } },
      })
      jobManagementService.updateJobStatus.mockRejectedValue(
        new NotFoundError('Job not found'),
      )

      await controller.updateJob(req)

      expect(jobManagementService.updateJobStatus).toHaveBeenCalledWith(1)
    })

    describe('getLatestJob', () => {
      const ok = jest.fn()
      const badRequest = jest.fn()

      beforeEach(() => {
        ok.mockClear()
        badRequest.mockClear()
      })

      it('should succeed and respond with jobInformation if jobManagementService.getLatestJob returns information', async () => {
        const userId = 2
        const req = httpMocks.createRequest({
          body: { userId },
        })
        const res = httpMocks.createResponse() as any
        res.ok = ok
        res.badRequest = badRequest

        const mockJobInformation = {
          job: {
            id: 1,
            uuid: 'abc',
            status: JobStatusEnum.Success,
            userId: 2,
          },
          jobItemIds: ['abc/0', 'abc/1'],
        } as unknown as JobInformation
        jobManagementService.getLatestJobForUser.mockResolvedValue(
          mockJobInformation,
        )

        await controller.getLatestJob(req, res)
        expect(jobManagementService.getLatestJobForUser).toBeCalledWith(userId)
        expect(res.ok).toBeCalledWith(mockJobInformation)
        expect(res.badRequest).not.toBeCalled()
      })

      it('should respond with res.ok if jobManagementService.getLatestJob is unable to find a job for user', async () => {
        const userId = 2
        const req = httpMocks.createRequest({
          body: { userId },
        })
        const res = httpMocks.createResponse() as any
        res.ok = ok
        res.badRequest = badRequest

        jobManagementService.getLatestJobForUser.mockRejectedValue(
          new NotFoundError('No jobs found'),
        )

        await controller.getLatestJob(req, res)
        expect(jobManagementService.getLatestJobForUser).toBeCalledWith(userId)
        expect(res.ok).toBeCalled()
        expect(res.badRequest).not.toBeCalled()
      })

      it('should respond with badRequest if jobManagementService.getLatestJob fails', async () => {
        const controller = new JobController(jobManagementService, sqsService)
        const userId = 2
        const req = httpMocks.createRequest({
          body: { userId },
        })
        const res = httpMocks.createResponse() as any
        res.ok = ok
        res.badRequest = badRequest

        jobManagementService.getLatestJobForUser.mockRejectedValue(new Error())

        await controller.getLatestJob(req, res)
        expect(jobManagementService.getLatestJobForUser).toBeCalledWith(userId)
        expect(res.ok).not.toBeCalled()
        expect(res.badRequest).toBeCalled()
      })
    })

    describe('pollJobStatusUpdate', () => {
      const ok = jest.fn()
      const notFound = jest.fn()

      beforeEach(() => {
        ok.mockClear()
        notFound.mockClear()
      })

      it('should respond with jobInformation if jobManagementService.pollJobStatusUpdate succeeds', async () => {
        const userId = 2
        const jobId = 4
        const req = httpMocks.createRequest({
          body: { userId, jobId },
        })
        const res = httpMocks.createResponse() as any
        res.ok = ok
        res.notFound = notFound

        const mockJobInformation = {
          job: {
            id: 1,
            uuid: 'abc',
            status: JobStatusEnum.Success,
            userId: 2,
          },
          jobItemIds: ['abc/0', 'abc/1'],
        } as unknown as JobInformation

        jobManagementService.pollJobStatusUpdate.mockResolvedValue(
          mockJobInformation,
        )

        await controller.pollJobStatusUpdate(req, res)
        expect(jobManagementService.pollJobStatusUpdate).toBeCalledWith(
          userId,
          jobId,
        )
        expect(res.ok).toBeCalledWith(mockJobInformation)
        expect(res.notFound).not.toBeCalled()
      })

      it('should respond with notFound if jobManagementService.pollJobStatusUpdate is unable to find job', async () => {
        const userId = 2
        const jobId = 4
        const req = httpMocks.createRequest({
          body: { userId, jobId },
        })
        const res = httpMocks.createResponse() as any
        res.ok = ok
        res.notFound = notFound

        jobManagementService.pollJobStatusUpdate.mockRejectedValue(
          new NotFoundError(''),
        )

        await controller.pollJobStatusUpdate(req, res)
        expect(res.notFound).toBeCalled()
        expect(res.ok).not.toBeCalled()
      })

      it('should throw 408 if jobManagementService.pollJobStatusUpdate exceeds long polling timeout', async () => {
        const userId = 2
        const jobId = 4
        const req = httpMocks.createRequest({
          body: { userId, jobId },
        })
        const res = httpMocks.createResponse() as any
        res.ok = ok
        res.send = jest.fn()
        res.status = jest.fn(() => res)
        res.notFound = notFound

        jobManagementService.pollJobStatusUpdate.mockRejectedValue(
          new Error('Exceeded max attempts'),
        )

        await controller.pollJobStatusUpdate(req, res)
        expect(jobManagementService.pollJobStatusUpdate).toBeCalledWith(
          userId,
          jobId,
        )
        expect(res.status).toBeCalledWith(408)
        expect(res.ok).not.toBeCalled()
        expect(res.notFound).not.toBeCalled()
      })
    })
  })
})
