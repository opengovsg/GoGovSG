import { inject, injectable } from 'inversify'
import { SQS } from 'aws-sdk'
import { Consumer } from 'sqs-consumer'
import { DependencyIds } from '../../constants'
import { sqsBulkQRCodeStartUrl } from '../../config'
import { BulkService } from './interfaces'

@injectable()
export default class TestController {
  public constructor(
    @inject(DependencyIds.sqsClient)
    sqsClient: SQS,
    @inject(DependencyIds.bulkService)
    bulkService: BulkService,
  ) {
    console.log('TESTCONTROLLER')
    const consumer = Consumer.create({
      sqs: sqsClient,
      queueUrl: sqsBulkQRCodeStartUrl,
      batchSize: 1,
      visibilityTimeout: 5000,
      handleMessage: async (message: SQS.Message) => {
        try {
          if (message.Body) {
            const messageBody = JSON.parse(message.Body)
            console.log(
              `sqs-consumer is polling message from ${sqsBulkQRCodeStartUrl}: ${messageBody.transaction_id}`,
            )
            // validate messageBody

            // add service layer logic -> need to inject bulkservice
            bulkService.generateUrlMappings(['hello'])
            console.log('DONE')
          } else {
            console.log(`empty message body`)
          }
        } catch (e) {
          throw new Error(`Unable to parse message sqs message: ${message}`)
        }
      },
    })

    consumer.start()
  }
}
