/* eslint-disable global-require */
import httpMocks from 'node-mocks-http'
import _ from 'lodash'
import express from 'express'

import { JobItemStatusEnum } from '../../../repositories/enums'
import { NotFoundError } from '../../../util/error'

const jobManagementService = {
  createJob: jest.fn(),
  createJobItem: jest.fn(),
  updateJobItemStatus: jest.fn(),
  computeJobStatus: jest.fn(),
  updateJobStatus: jest.fn(),
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

      jobManagementService.createJob.mockResolvedValue(mockJob)
      jobManagementService.createJobItem.mockResolvedValue({})
      sqsService.sendMessage.mockResolvedValue({})

      await controller.createAndStartJob(req)

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

      jobManagementService.createJob.mockResolvedValue(mockJob)
      jobManagementService.createJobItem.mockResolvedValue({})
      sqsService.sendMessage.mockResolvedValue({})

      await controller.createAndStartJob(req)

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
      const { JobController } = require('..')

      const controller = new JobController(jobManagementService, sqsService)

      const req = httpMocks.createRequest({
        body: { userId, jobParamsList: [] },
      })

      await controller.createAndStartJob(req)

      expect(jobManagementService.createJob).not.toHaveBeenCalled()
      expect(jobManagementService.createJobItem).not.toHaveBeenCalled()
      expect(sqsService.sendMessage).not.toHaveBeenCalled()
    })

    it('createAndStartJob does not start job if no jobParamsList', async () => {
      const { JobController } = require('..')

      const controller = new JobController(jobManagementService, sqsService)

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
      const { JobController } = require('..')

      const controller = new JobController(jobManagementService, sqsService)

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
      expect(req.body.jobId).toStrictEqual(mockUpdatedJobItem.jobId)
      expect(res.ok).toHaveBeenCalled()
      expect(res.badRequest).not.toHaveBeenCalled()
    })

    it('updateJobItem does not add jobItem to req body if update is not successful', async () => {
      const { JobController } = require('..')

      const controller = new JobController(jobManagementService, sqsService)

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
      expect(req.body).not.toHaveProperty('jobId')
      expect(res.ok).not.toHaveBeenCalled()
      expect(responseSpy).toBeCalledWith(404)
    })
  })
})
