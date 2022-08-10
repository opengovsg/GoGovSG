const crossFetch = require('cross-fetch')

async function handler(event) {
  event.Records.map((e) => {
    console.log(e)
    console.log(e.sns)
    const { SubscribeUrl } = e
    if (SubscribeUrl) {
      return crossFetch(SubscribeUrl, {
        method: 'GET',
      })
    }
    return Promise.resolve()
  })
}

module.exports.handler = handler
