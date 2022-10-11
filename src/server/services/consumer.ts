import { SQS } from 'aws-sdk'
import { Consumer } from 'sqs-consumer'

export type ConsumerConfig = {
  sqs: SQS
  queueUrl: string
  batchSize?: number
  visibilityTimeout?: number
}

export function initSQSConsumer(config: ConsumerConfig) {
  const { sqs, queueUrl, batchSize, visibilityTimeout } = config
  const consumer = Consumer.create({
    sqs,
    queueUrl,
    batchSize: batchSize || 1,
    visibilityTimeout: visibilityTimeout || 15000,
    handleMessage: async (message: SQS.Message) => {
      try {
        if (message.Body) {
          const messageBody = JSON.parse(message.Body)
          console.log(
            `sqs-consumer is polling message from ${queueUrl}: ${messageBody.transaction_id}`,
          )
          // validate messageBody

          // add service layer logic -> need to inject bulkservice
        } else {
          console.log(`empty message body`)
        }
      } catch (e) {
        throw new Error(`Unable to parse message sqs message: ${message}`)
      }
    },
  })

  consumer.start()
  console.log(`sqs-consumer is initialised`)
  return consumer
}
