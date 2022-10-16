import { inject, injectable } from 'inversify'
import { SQS } from 'aws-sdk'
import { DependencyIds } from '../constants'
import { sqsBulkQRCodeStartUrl } from '../config'
import { BulkUrlMapping } from '../repositories/types'

export interface SQSServiceInterface {
  sendMessage(filePath: string, mappings: BulkUrlMapping[]): Promise<void>
}

@injectable()
export class SQSService implements SQSServiceInterface {
  private sqsClient: SQS

  constructor(@inject(DependencyIds.sqsClient) sqsClient: SQS) {
    this.sqsClient = sqsClient
  }

  sendMessage: (filePath: string, mappings: BulkUrlMapping[]) => Promise<void> =
    async (filePath, mappings) => {
      await this.sqsClient.sendMessage(
        {
          MessageBody: JSON.stringify({ filePath, mappings }),
          QueueUrl: sqsBulkQRCodeStartUrl,
        },
        (err, data) => {
          if (err) {
            console.log(`SQS sendMessage error: ${err}`)
          } else {
            console.log(`SQS sendMessage success, messageId: ${data.MessageId}`)
          }
        },
      )
    }
}
