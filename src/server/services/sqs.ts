import { inject, injectable } from 'inversify'
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import { DependencyIds } from '../constants.js'
import { logger, sqsBulkQRCodeStartUrl } from '../config.js'

export interface SQSServiceInterface {
  sendMessage(message: any): Promise<void>
}

@injectable()
export class SQSService implements SQSServiceInterface {
  private sqsClient: SQSClient

  constructor(@inject(DependencyIds.sqsClient) sqsClient: SQSClient) {
    this.sqsClient = sqsClient
  }

  sendMessage: (message: any) => Promise<void> = async (message) => {
    logger.info(`sending message ${message} to SQS`)
    try {
      const resp = await this.sqsClient.send(
        new SendMessageCommand({
          MessageBody: JSON.stringify(message),
          QueueUrl: sqsBulkQRCodeStartUrl,
        }),
      )
      logger.info(`SQS sendMessage success, messageId: ${resp.MessageId}`)
    } catch (err) {
      logger.error(`Failed to send SQS message ${message}`)
      throw err
    }
  }
}
