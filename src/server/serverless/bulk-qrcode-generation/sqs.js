const { SQS } = require('aws-sdk')

const sqsClient = new SQS({ apiVersion: '2012-11-05' })
const sqsEndQueueUrl = process.env.SQS_END_QUEUE_URL
if (!sqsEndQueueUrl)
  throw Error('Environment variable for sqsEndQueueUrl is missing')

async function sendSQSMessage(isSuccess, filePath, errorMessage) {
  const bodyParams = {
    filePath,
    status: isSuccess ? 'Success' : 'Failed',
    errorMessage,
  }
  const messageParams = {
    MessageBody: JSON.stringify(bodyParams),
    QueueUrl: sqsEndQueueUrl,
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
