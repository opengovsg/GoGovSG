import _ from 'lodash'

const MAX_SIZE_BYTES = 2000

interface CookieData {
  [shortUrl: string]: number
}

interface EpochToShortUrlMapping {
  [epoch: number]: string
}

export default class LRUCache {
  data: CookieData

  lookupTable: EpochToShortUrlMapping = {}

  timestamps: number[] = []

  constructor(data: CookieData | null) {
    this.data = data || {}
  }

  // Getters/Setters

  getData() {
    return this.data
  }

  /**
   * Predicate that checks if the shortUrl exists in the cache.
   * @param {string} shortUrl The shortUrl to check.
   * @returns {Boolean}
   */
  isEntryInCache(shortUrl: string) {
    return !!this.data[shortUrl]
  }

  // Mutation methods

  /**
   * Updates an existing entry in the LRU cache.
   * @param {string} shortUrl The shortUrl whose epoch is
   * to be updated.
   */
  updateEntry(shortUrl: string) {
    this.data[shortUrl] = Math.floor(Date.now() / 1000)
  }

  /**
   * Appends the shortUrl to the list of visited links.
   * Will also trigger a pruning process if the cookie size
   * exceeds threshold.
   * @param {string} shortUrl The shortUrl to be added.
   */
  appendEntry(shortUrl: string) {
    this.updateEntry(shortUrl)
    while (this.computeSize() > MAX_SIZE_BYTES) {
      this.pruneOldestEntry()
    }
  }

  // Private methods

  private computeSize() {
    return JSON.stringify(this.data).length
  }

  private pruneOldestEntry() {
    if (_.isEmpty(this.lookupTable)) this.hydrateLookupTable()
    const oldestTimestamp = this.computeOldestTimestamp()
    const oldestShortUrl = this.lookupTable[oldestTimestamp]
    delete this.data[oldestShortUrl]
    delete this.lookupTable[oldestTimestamp]
    this.timestamps.splice(0, 1)
  }

  /**
   * Lazily hydrates the lookup table only when pruning is
   * necessary.
   */
  private hydrateLookupTable() {
    this.lookupTable = {}
    Object.keys(this.data).forEach((shortUrl) => {
      const timestamp = this.data[shortUrl]
      this.lookupTable[timestamp] = shortUrl
      this.timestamps.push(timestamp)
    })
  }

  private computeOldestTimestamp() {
    return this.timestamps.sort()[0]
  }
}
