const crossFetch = require('cross-fetch')

async function handler(event) {
  console.log(event)
  const { SubscribeUrl } = event
  console.log('subscribe url is', SubscribeUrl)
  if (SubscribeUrl) {
    await crossFetch(SubscribeUrl, {
      method: 'GET',
    })
  }
}

module.exports.handler = handler
