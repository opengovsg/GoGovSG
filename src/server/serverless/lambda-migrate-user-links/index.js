const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

const SQLSCRIPT = 'migrate_user_links.sql'

async function handler(event) {
  const dbConfig = process.env.DATABASE_URL
  const pgClient = new Client(dbConfig)
  let statusMsg

  try {
    const { fromUserEmail } = event
    const { toUserEmail } = event
    const sqlScriptPath = path.join(__dirname, SQLSCRIPT)

    await pgClient.connect().then(() => {
      console.log('Connected')
    })

    const sqlUDF = fs.readFileSync(sqlScriptPath)
    const sqlScript = `SELECT migrate_user_links($1, $2)`
    const values = [fromUserEmail, toUserEmail]

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

    statusMsg = `User links migration failed. ${err}`
  }

  return { Status: statusMsg }
}

module.exports.handler = handler
