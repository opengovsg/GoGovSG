const { Client } = require('pg')

async function handler(event) {
  const dbConfig = process.env.DATABASE_URL
  const pgClient = new Client(dbConfig)
  let statusMsg

  try {
    const { shortUrl } = event
    const { toUserEmail } = event

    await pgClient.connect().then(() => {
      console.log('Connected')
    })

    const sqlScript = `SELECT migrate_url_to_user($1, $2)`
    const values = [shortUrl, toUserEmail]

    const { rowCount } = await pgClient.query(sqlScript, values)

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
