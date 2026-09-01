import { createRedisClientMock } from '../RedisClient'

describe('RedisClientMock', () => {
  it('returns null for a key that was never set', async () => {
    const client = createRedisClientMock()
    await expect(client.get('missing')).resolves.toBeNull()
  })

  it('returns the value that was set', async () => {
    const client = createRedisClientMock()
    await client.set('key', 'value')
    await expect(client.get('key')).resolves.toBe('value')
  })

  it('returns the value that was set with setEx before it expires', async () => {
    const client = createRedisClientMock()
    await client.setEx('key', 60, 'value')
    await expect(client.get('key')).resolves.toBe('value')
  })

  it('returns null once a setEx key has expired', async () => {
    const client = createRedisClientMock()
    await client.setEx('key', -1, 'value')
    await expect(client.get('key')).resolves.toBeNull()
  })

  it('deletes a key and reports 1 key removed', async () => {
    const client = createRedisClientMock()
    await client.set('key', 'value')
    await expect(client.del('key')).resolves.toBe(1)
    await expect(client.get('key')).resolves.toBeNull()
  })

  it('reports 0 keys removed when deleting a missing key', async () => {
    const client = createRedisClientMock()
    await expect(client.del('missing')).resolves.toBe(0)
  })

  it('clears every key on flushAll', async () => {
    const client = createRedisClientMock()
    await client.set('a', '1')
    await client.set('b', '2')
    await client.flushAll()
    await expect(client.get('a')).resolves.toBeNull()
    await expect(client.get('b')).resolves.toBeNull()
  })

  it('resolves connect() and supports chaining .on()', async () => {
    const client = createRedisClientMock()
    await expect(client.connect()).resolves.toBeUndefined()
    expect(client.on('error', () => {})).toBe(client)
  })
})
