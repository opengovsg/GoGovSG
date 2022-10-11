import { inject, injectable } from 'inversify'
import { SQS } from 'aws-sdk'
import { DependencyIds } from '../constants'
import { sqsBulkQRCodeStartUrl } from '../config'
import { BulkUrlMapping } from '../repositories/types'

export interface SQSInterface {
  sendMessage(mappings: BulkUrlMapping[]): Promise<void>
}

@injectable()
export class SQSService implements SQSInterface {
  private sqsClient: SQS

  constructor(@inject(DependencyIds.sqsClient) sqsClient: SQS) {
    this.sqsClient = sqsClient
  }

  sendMessage: (mappings: BulkUrlMapping[]) => Promise<void> = async (
    mappings,
  ) => {
    console.log(`sqs-url: ${sqsBulkQRCodeStartUrl}`)
    await this.sqsClient.sendMessage(
      {
        MessageBody: JSON.stringify(mappings),
        QueueUrl: sqsBulkQRCodeStartUrl,
      },
      (err, data) => {
        if (err) {
          console.log(`SQS sendMessage error: ${err}`)
        } else {
          console.log(`success ${data.MessageId}, mappings: ${data}`)
        }
      },
    )
  }
}
