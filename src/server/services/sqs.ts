import { inject, injectable } from 'inversify'
import { SQS } from 'aws-sdk'
import { DependencyIds } from '../constants'
import { logger } from '../config'

export interface SQSServiceInterface {
  sendMessage(message: any): Promise<void>
}

@injectable()
export class SQSService implements SQSServiceInterface {
  private sqsClient: SQS

  private sqsQueueUrl: string

  constructor(
    @inject(DependencyIds.sqsClient) sqsClient: SQS,
    @inject(DependencyIds.sqsQueueUrl) sqsQueueUrl: string,
  ) {
    this.sqsClient = sqsClient
    this.sqsQueueUrl = sqsQueueUrl
  }

  sendMessage: (message: any) => Promise<void> = async (message) => {
    logger.info(`sending message ${message} to SQS`)
    try {
      const resp = await this.sqsClient
        .sendMessage({
          MessageBody: JSON.stringify(message),
          QueueUrl: this.sqsQueueUrl,
        })
        .promise()
      logger.info(`SQS sendMessage success, messageId: ${resp.MessageId}`)
    } catch (err) {
      logger.error(`Failed to send SQS message ${message}`)
      throw err
    }
  }
}
