const { SNS } = require('aws-sdk')

const { SNS_TOPIC_ARN } = process.env
if (!SNS_TOPIC_ARN)
  throw Error('Environment variable for SNS_TOPIC_ARN is missing')

const snsClient = new SNS({ apiVersion: '2010-03-31' })

async function sendSNSMessage(isSuccess, filePath, errorMessage) {
  const bodyParams = {
    filePath,
    status: isSuccess ? 'Success' : 'Failed',
    errorMessage,
  }
  const messageParams = {
    Message: JSON.stringify(bodyParams),
    TopicArn: SNS_TOPIC_ARN,
  }
  try {
    const data = await snsClient.publish(messageParams).promise()
    console.log(`Successfully sent message ${data.MessageId} to SNS`)
  } catch (err) {
    console.log(`Error sending message to SNS: ${err}`)
  }
}

module.exports.sendSNSMessage = sendSNSMessage
