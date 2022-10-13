// {
//   "Records": [
//       {
//           "messageId": "059f36b4-87a3-44ab-83d2-661975830a7d",
//           "receiptHandle": "AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0a...",
//           "body": "Test message.",
//           "attributes": {
//               "ApproximateReceiveCount": "1",
//               "SentTimestamp": "1545082649183",
//               "SenderId": "AIDAIENQZJOLO23YVJ4VO",
//               "ApproximateFirstReceiveTimestamp": "1545082649185"
//           },
//           "messageAttributes": {},
//           "md5OfBody": "e4e68fb7bd0e697a0ae8f1bb342846b3",
//           "eventSource": "aws:sqs",
//           "eventSourceARN": "arn:aws:sqs:us-east-2:123456789012:my-queue",
//           "awsRegion": "us-east-2"
//       },
//   ]
// }

const { ImageFormat, createGoQrCode } = require('./qrCode')
const { createCsv } = require('./createCsv')
const { uploadToS3 } = require('./s3')

async function handler(event) {
  // const { body, messageId } = event.Records[0]
  const { body } = event.Records[0]

  const bodyJSON = JSON.parse(body)

  const { mappings, filePath } = bodyJSON

  const csvData = await createCsv(mappings)

  const pngZipData = await createGoQrCode(
    mappings.map((mapping) => mapping.shortUrl),
    ImageFormat.PNG,
  )

  const svgZipData = await createGoQrCode(
    mappings.map((mapping) => mapping.shortUrl),
    ImageFormat.SVG,
  )

  // fs.writeFile('qrCodePNG.zip', pngZipData, {}, () => console.log(`hi`))
  // fs.writeFile('qrCodeSVG.zip', svgZipData, {}, () => console.log(`hi`))
  // fs.writeFileSync('urlMappings.csv', csvData)
  uploadToS3(pngZipData, 'application/zip', `${filePath}/qrCodePNG.zip`)
  uploadToS3(svgZipData, 'application/zip', `${filePath}/qrCodeSVG.zip`)
  uploadToS3(csvData, 'text/csv', `${filePath}/urlMappings.csv`)

  return { Status: 'done' }
}

// handler({
//   Records: [
//     {
//       messageId: '059f36b4-87a3-44ab-83d2-661975830a7d',
//       body: JSON.stringify({
//         mappings: [
//           { longUrl: 'https://google.com', shortUrl: 'sada1' },
//           { longUrl: 'https://twitter.com', shortUrl: 'sada12' },
//           { longUrl: 'https://facebook.com', shortUrl: 'sada12' },
//         ],
//         filePath: 'uuid/1',
//       }),
//     },
//   ],
// })

module.exports.handler = handler
