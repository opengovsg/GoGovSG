/* eslint-disable class-methods-use-this */

interface StoredEntry {
  value: string
  expiresAt: number | null
}

/**
 * A minimal Promise-based fake of the subset of the `redis` v6 client API
 * this repo actually calls (`get`/`set`/`setEx`/`del`/`flushAll`/`connect`/
 * `on`). Replaces `redis-mock`, which is callback-only and cannot stand in
 * for node-redis v4+'s Promise-returning commands.
 */
export class RedisClientMock {
  private store = new Map<string, StoredEntry>()

  async connect(): Promise<void> {}

  on(): this {
    return this
  }

  private isExpired(key: string): boolean {
    const entry = this.store.get(key)
    if (!entry) return true
    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      this.store.delete(key)
      return true
    }
    return false
  }

  async get(key: string): Promise<string | null> {
    if (this.isExpired(key)) return null
    return this.store.get(key)?.value ?? null
  }

  async set(key: string, value: string): Promise<string> {
    this.store.set(key, { value, expiresAt: null })
    return 'OK'
  }

  async setEx(key: string, seconds: number, value: string): Promise<string> {
    this.store.set(key, { value, expiresAt: Date.now() + seconds * 1000 })
    return 'OK'
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0
  }

  async flushAll(): Promise<string> {
    this.store.clear()
    return 'OK'
  }
}

export function createRedisClientMock(): RedisClientMock {
  return new RedisClientMock()
}
