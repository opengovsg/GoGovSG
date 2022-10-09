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
    await this.sqsClient.sendMessage(
      {
        MessageAttributes: {
          Mappings: {
            DataType: 'String',
            StringValue: JSON.stringify(mappings),
          },
        },
        MessageBody: 'This is a message',
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
