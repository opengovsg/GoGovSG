const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

const SQLSCRIPTFILENAME = 'migrate_url_to_user.sql'

async function handler(event) {
  const dbConfig = process.env.DATABASE_URL
  const pgClient = new Client(dbConfig)
  let statusMsg

  try {
    const { shortUrl } = event
    const { toUserEmail } = event
    const sqlScriptPath = path.join(__dirname, SQLSCRIPTFILENAME)

    await pgClient.connect().then(() => {
      console.log('Connected')
    })

    const sqlUDF = fs.readFileSync(sqlScriptPath)
    const sqlScript = `SELECT migrate_url_to_user($1, $2)`
    const values = [shortUrl, toUserEmail]

    const queryUDFResult = await pgClient.query(sqlUDF.toString())
    const { rowCount } = queryUDFResult
      ? await pgClient.query(sqlScript, values)
      : undefined

    pgClient.end().then(() => console.log('Disconnected'))

    statusMsg = `URL successfully migrated. ${JSON.stringify(
      rowCount,
    )} rows affected`
  } catch (err) {
    console.log(err)
    pgClient.end()

    statusMsg = `URL migration failed. ${err}`
  }

  return { Status: statusMsg }
}

module.exports.handler = handler
