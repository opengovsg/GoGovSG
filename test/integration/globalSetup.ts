import net from 'net'
import { Sequelize } from 'sequelize'
import { DB_URI } from './config'
import setIntegrationServerEnv from './env'

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

const waitForPort = async (
  port: number,
  host = 'localhost',
  timeoutMs = 120_000,
): Promise<void> => {
  const deadline = Date.now() + timeoutMs

  /* eslint-disable no-await-in-loop */
  while (Date.now() < deadline) {
    try {
      await new Promise<void>((resolve, reject) => {
        const socket = net.connect(port, host, () => {
          socket.end()
          resolve()
        })
        socket.on('error', reject)
      })
      return
    } catch {
      await sleep(2_000)
    }
  }
  /* eslint-enable no-await-in-loop */

  throw new Error(`Timed out waiting for ${host}:${port}`)
}

const waitForPostgres = async (): Promise<void> => {
  const deadline = Date.now() + 120_000

  /* eslint-disable no-await-in-loop */
  while (Date.now() < deadline) {
    const sequelize = new Sequelize(DB_URI, {
      dialect: 'postgres',
      logging: false,
    })

    try {
      await sequelize.authenticate()
      await sequelize.close()
      return
    } catch {
      await sequelize.close().catch(() => undefined)
      await sleep(2_000)
    }
  }
  /* eslint-enable no-await-in-loop */

  throw new Error('Timed out waiting for Postgres')
}

const syncSchema = async (): Promise<void> => {
  setIntegrationServerEnv()
  const initDb = (await import('../../src/server/models')).default
  await initDb()
}

export default async (): Promise<void> => {
  await waitForPostgres()
  await syncSchema()
  await waitForPort(8080)
}
