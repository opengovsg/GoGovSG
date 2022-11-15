const { SQS } = require('aws-sdk')

const sqsClient = new SQS({ apiVersion: '2012-11-05' })
const { SQS_END_QUEUE_URL } = process.env
if (!SQS_END_QUEUE_URL)
  throw Error('Environment variable for SQS_END_QUEUE_URL is missing')

async function sendSQSMessage(isSuccess, filePath, errorMessage) {
  const bodyParams = {
    filePath,
    status: isSuccess ? 'Success' : 'Failed',
    errorMessage,
  }
  const messageParams = {
    MessageBody: JSON.stringify(bodyParams),
    QueueUrl: SQS_END_QUEUE_URL,
  }
  await sqsClient.sendMessage(messageParams, (err, data) => {
    if (err) {
      throw Error(`Error sending message to sqs-end-queue: ${err}`)
    } else {
      console.log(
        'Successfully sent message from lambda to sqs-end',
        data.MessageId,
      )
    }
  })
}

module.exports.sendSQSMessage = sendSQSMessage
