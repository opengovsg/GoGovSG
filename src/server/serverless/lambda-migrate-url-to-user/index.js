import { Client } from 'pg'

// Lambda invokes the named export from index.handler, not the default export.
// eslint-disable-next-line import/prefer-default-export
export async function handler(event) {
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

    await pgClient.query(sqlScript, values)

    pgClient.end().then(() => console.log('Disconnected'))

    statusMsg = 'URL successfully migrated.'
  } catch (err) {
    console.log(err)
    pgClient.end()
    throw Error(`URL migration failed. ${err}`)
  }

  return { Status: statusMsg }
}
