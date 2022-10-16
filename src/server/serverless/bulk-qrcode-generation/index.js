async function handler(event) {
  event.Records.forEach((record) => {
    console.log(record.body, record.messageId)
  })
}

module.exports.handler = handler
