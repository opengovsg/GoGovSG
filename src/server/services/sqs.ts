import { inject, injectable } from 'inversify'
import { SQS } from 'aws-sdk'
import { DependencyIds } from '../constants'
import { sqsBulkQRCodeStartUrl } from '../config'

export interface SQSServiceInterface {
  sendMessage(message: any): Promise<void>
}

@injectable()
export class SQSService implements SQSServiceInterface {
  private sqsClient: SQS

  constructor(@inject(DependencyIds.sqsClient) sqsClient: SQS) {
    this.sqsClient = sqsClient
  }

  sendMessage: (message: any) => Promise<void> = async (message) => {
    const resp = await this.sqsClient
      .sendMessage({
        MessageBody: JSON.stringify(message),
        QueueUrl: sqsBulkQRCodeStartUrl,
      })
      .promise()
    console.log(`SQS sendMessage success, messageId: ${resp.MessageId}`)
  }
}
