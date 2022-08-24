async function handler(event) {
  event.Records.forEach((e) => {
    console.log(e.Sns)
  })
}

module.exports.handler = handler
