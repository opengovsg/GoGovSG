async function createCsv(urlMappings) {
  const rowList = []
  rowList.push('Short URL,Original URL')
  urlMappings.forEach((urlMapping) =>
    rowList.push(`${urlMapping.shortUrl},${urlMapping.longUrl}`),
  )

  const data = rowList.join(`\r\n`)
  return data
}

module.exports.createCsv = createCsv
