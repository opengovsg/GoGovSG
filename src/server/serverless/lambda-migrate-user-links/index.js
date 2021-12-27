const { Client } = require('pg')

async function handler(event) {
  const dbConfig = process.env.DATABASE_URL
  const pgClient = new Client(dbConfig)
  let statusMsg

  try {
    const { fromUserEmail } = event
    const { toUserEmail } = event

    await pgClient.connect().then(() => {
      console.log('Connected')
    })

    const sqlScript = `SELECT migrate_user_links($1, $2)`
    const values = [fromUserEmail, toUserEmail]

    const { rowCount } = await pgClient.query(sqlScript, values)

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
