const fetch = require('cross-fetch')

const { EB_CALLBACK_ENDPOINT, EB_CALLBACK_SECRET } = process.env
if (!EB_CALLBACK_ENDPOINT)
  throw Error('Environment variable for EB_CALLBACK_ENDPOINT is missing')
if (!EB_CALLBACK_SECRET)
  throw Error('Environment variable for EB_CALLBACK_SECRET is missing')

async function sendHttpMessage(isSuccess, jobItemId, errorMessage) {
  const params = {
    jobItemId,
    status: {
      isSuccess,
      errorMessage,
    },
  }

  const response = await fetch(EB_CALLBACK_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${EB_CALLBACK_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })
  if (!response.ok) {
    throw new Error(
      `Failed to send message ${jobItemId} to ${EB_CALLBACK_ENDPOINT}`,
    )
  }
  console.log(
    `Successfully sent message ${jobItemId} to ${EB_CALLBACK_ENDPOINT}`,
  )
}

module.exports.sendHttpMessage = sendHttpMessage
