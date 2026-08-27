import FormData from 'form-data'
import { API_EXTERNAL_V1_URLS, SMALL_TEXT_FILE_PATH } from '../../config'
import {
  DATETIME_REGEX,
  createIntegrationTestUser,
  deleteIntegrationTestUser,
  generateRandomString,
  readFile,
} from '../../util/helpers'
import { get, patch, postFormData, postJson } from '../../util/requests'

const API_EXTERNAL_V1_URLS_BULK = `${API_EXTERNAL_V1_URLS}/bulk`

async function createLinkUrl(
  link: {
    shortUrl?: string
    longUrl?: string
  },
  apiKey: string,
) {
  const res = await postJson(API_EXTERNAL_V1_URLS, link, undefined, apiKey)
  return res
}

async function createFileUrl(shortUrl: string, apiKey: string) {
  const formData = new FormData()
  const smallTextFile = readFile(SMALL_TEXT_FILE_PATH)
  formData.append('file', smallTextFile)
  formData.append('shortUrl', shortUrl)
  const res = await postFormData(
    API_EXTERNAL_V1_URLS,
    formData,
    undefined,
    apiKey,
  )
  return res
}

async function updateLinkUrl(
  link: { shortUrl: string; longUrl?: string; state?: string },
  apiKey: string,
) {
  const { shortUrl, longUrl, state } = link
  const res = await patch(
    `${API_EXTERNAL_V1_URLS}/${shortUrl}`,
    {
      longUrl,
      state,
    },
    undefined,
    apiKey,
  )
  return res
}

/**
 * Integration tests for URLs.
 */
describe('Url integration tests', () => {
  let email: string
  let apiKey: string
  const longUrl = 'https://example.com'

  beforeEach(async () => {
    ;({ email, apiKey } = await createIntegrationTestUser())
  })

  afterEach(async () => {
    await deleteIntegrationTestUser(email)
  })

  it('should be able to get urls', async () => {
    const res = await get(API_EXTERNAL_V1_URLS, undefined, apiKey)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toBeTruthy()
    expect(json).toEqual({
      urls: [],
      count: 0,
    })
  })

  it('should not be able to get urls without API key header', async () => {
    const res = await get(API_EXTERNAL_V1_URLS)
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json).toBeTruthy()
    expect(json).toEqual({
      message: 'Authorization header is missing',
    })
  })

  it('should not be able to get urls with invalid API key', async () => {
    const res = await get(
      API_EXTERNAL_V1_URLS,
      undefined,
      'this-is-an-invalid-api-key',
    )
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json).toBeTruthy()
    expect(json).toEqual({
      message: 'Invalid API Key',
    })
  })

  it('should be able to create link url with shortUrl and longUrl', async () => {
    const shortUrl = await generateRandomString(6)
    const res = await createLinkUrl({ shortUrl, longUrl }, apiKey)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      shortUrl,
      longUrl,
      clicks: 0,
      state: 'ACTIVE',
      createdAt: expect.stringMatching(DATETIME_REGEX),
      updatedAt: expect.stringMatching(DATETIME_REGEX),
    })
  })

  it('should be able to create link url with longUrl but not shortUrl', async () => {
    const res = await createLinkUrl({ longUrl }, apiKey)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      shortUrl: expect.stringMatching(/^[a-z0-9]{8}$/),
      longUrl,
      clicks: 0,
      state: 'ACTIVE',
      createdAt: expect.stringMatching(DATETIME_REGEX),
      updatedAt: expect.stringMatching(DATETIME_REGEX),
    })
  })

  it('should not be able to create link url with neither longUrl nor shortUrl', async () => {
    const res = await createLinkUrl({}, apiKey)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({
      message: 'ValidationError: "longUrl" is required',
    })
  })

  it('should not be able to create link url with invalid longUrl', async () => {
    const invalidLongUrl = 'this-is-an-invalid-url'
    const res = await createLinkUrl({ longUrl: invalidLongUrl }, apiKey)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({
      message: 'ValidationError: Only HTTPS URLs are allowed.',
    })
  })

  it('should not be able to create link url with invalid shortUrl', async () => {
    const invalidShortUrl = 'foo%bar'
    const res = await createLinkUrl(
      { shortUrl: invalidShortUrl, longUrl },
      apiKey,
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({
      message: 'ValidationError: Short URL format is invalid.',
    })
  })

  it('should not be able to create file url', async () => {
    const shortUrl = await generateRandomString(6)
    const res = await createFileUrl(shortUrl, apiKey)
    expect(res.status).toBe(400)
  })

  it('should be able to update link url with new longUrl and state', async () => {
    const shortUrl = await generateRandomString(6)
    await createLinkUrl({ shortUrl, longUrl }, apiKey)

    const newLongUrl = 'https://myspace.com'
    const newState = 'INACTIVE'
    const res = await updateLinkUrl(
      { shortUrl, longUrl: newLongUrl, state: newState },
      apiKey,
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      shortUrl,
      longUrl: newLongUrl,
      clicks: 0,
      state: newState,
      createdAt: expect.stringMatching(DATETIME_REGEX),
      updatedAt: expect.stringMatching(DATETIME_REGEX),
    })

    // Should be able to get updated link URL
    const newRes = await get(API_EXTERNAL_V1_URLS, undefined, apiKey)
    expect(newRes.status).toBe(200)
    const newBody = await newRes.json()
    expect(newBody).toEqual({
      urls: [
        {
          shortUrl,
          longUrl: newLongUrl,
          state: newState,
          clicks: 0,
          createdAt: expect.stringMatching(DATETIME_REGEX),
          updatedAt: expect.stringMatching(DATETIME_REGEX),
        },
      ],
      count: 1,
    })
  })

  it('should be able to update link url with new longUrl', async () => {
    const shortUrl = await generateRandomString(6)
    await createLinkUrl({ shortUrl, longUrl }, apiKey)

    const newLongUrl = 'https://myspace.com'
    const res = await updateLinkUrl({ shortUrl, longUrl: newLongUrl }, apiKey)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      shortUrl,
      longUrl: newLongUrl,
      clicks: 0,
      state: 'ACTIVE',
      createdAt: expect.stringMatching(DATETIME_REGEX),
      updatedAt: expect.stringMatching(DATETIME_REGEX),
    })
  })

  it('should be able to update link url with new state', async () => {
    const shortUrl = await generateRandomString(6)
    await createLinkUrl({ shortUrl, longUrl }, apiKey)

    const newState = 'INACTIVE'
    const res = await updateLinkUrl({ shortUrl, state: newState }, apiKey)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      shortUrl,
      longUrl,
      clicks: 0,
      state: newState,
      createdAt: expect.stringMatching(DATETIME_REGEX),
      updatedAt: expect.stringMatching(DATETIME_REGEX),
    })
  })

  it('should not be able to update link url with invalid new longUrl', async () => {
    const shortUrl = await generateRandomString(6)
    await createLinkUrl({ shortUrl, longUrl }, apiKey)

    const newLongUrl = 'this-is-an-invalid-url'
    const res = await updateLinkUrl({ shortUrl, longUrl: newLongUrl }, apiKey)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({
      message: 'ValidationError: Only HTTPS URLs are allowed.',
    })
  })

  it('should not be able to update link url with invalid new state', async () => {
    const shortUrl = await generateRandomString(6)
    await createLinkUrl({ shortUrl, longUrl }, apiKey)

    const newState = 'inACTIVE'
    const res = await updateLinkUrl({ shortUrl, state: newState }, apiKey)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({
      message: 'ValidationError: "state" must be one of [ACTIVE, INACTIVE]',
    })
  })

  it('should not be able to bulk create urls without API key header', async () => {
    const res = await postJson(API_EXTERNAL_V1_URLS_BULK, {
      urls: [{ longUrl }],
    })
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({
      message: 'Authorization header is missing',
    })
  })

  it('should not be able to bulk create urls with empty urls array', async () => {
    const res = await postJson(
      API_EXTERNAL_V1_URLS_BULK,
      { urls: [] },
      undefined,
      apiKey,
    )
    expect(res.status).toBe(400)
    expect((await res.json()).message).toMatch(
      /"urls" must contain at least 1 items/,
    )
  })

  it('should not be able to bulk create urls without urls field', async () => {
    const res = await postJson(API_EXTERNAL_V1_URLS_BULK, {}, undefined, apiKey)
    expect(res.status).toBe(400)
    expect((await res.json()).message).toMatch(/"urls" is required/)
  })

  it('should create all valid rows in bulk', async () => {
    const shortUrl = await generateRandomString(6)
    const res = await postJson(
      API_EXTERNAL_V1_URLS_BULK,
      {
        urls: [{ shortUrl, longUrl }, { longUrl: 'https://example.org' }],
      },
      undefined,
      apiKey,
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.errors).toEqual([])
    expect(body.created).toHaveLength(2)
    expect(body.created[0]).toEqual({
      shortUrl,
      longUrl,
      clicks: 0,
      state: 'ACTIVE',
      createdAt: expect.stringMatching(DATETIME_REGEX),
      updatedAt: expect.stringMatching(DATETIME_REGEX),
    })
    expect(body.created[1].shortUrl).toMatch(/^[a-z0-9]{8}$/)
  })

  it('should return partial success for mixed valid and invalid bulk rows', async () => {
    const shortUrl = await generateRandomString(6)
    const res = await postJson(
      API_EXTERNAL_V1_URLS_BULK,
      {
        urls: [{ shortUrl, longUrl }, { longUrl: 'this-is-an-invalid-url' }],
      },
      undefined,
      apiKey,
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.created).toHaveLength(1)
    expect(body.created[0].shortUrl).toBe(shortUrl)
    expect(body.errors).toEqual([
      {
        index: 1,
        message: 'Only HTTPS URLs are allowed.',
        type: 'LongUrlError',
      },
    ])
  })

  it('should return 400 when every bulk row fails validation', async () => {
    const res = await postJson(
      API_EXTERNAL_V1_URLS_BULK,
      { urls: [{ longUrl: 'this-is-an-invalid-url' }] },
      undefined,
      apiKey,
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.created).toEqual([])
    expect(body.errors).toEqual([
      {
        index: 0,
        message: 'Only HTTPS URLs are allowed.',
        type: 'LongUrlError',
      },
    ])
  })

  it('should error on duplicate shortUrl within the same bulk request', async () => {
    const shortUrl = await generateRandomString(6)
    const res = await postJson(
      API_EXTERNAL_V1_URLS_BULK,
      {
        urls: [
          { shortUrl, longUrl },
          { shortUrl, longUrl: 'https://example.org' },
        ],
      },
      undefined,
      apiKey,
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.created).toHaveLength(1)
    expect(body.errors).toEqual([
      {
        index: 1,
        message: `Short link "${shortUrl}" is already used.`,
        type: 'ShortUrlError',
      },
    ])
  })

  it('should allow duplicate longUrl values in the same bulk request', async () => {
    const res = await postJson(
      API_EXTERNAL_V1_URLS_BULK,
      { urls: [{ longUrl }, { longUrl }] },
      undefined,
      apiKey,
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.errors).toEqual([])
    expect(body.created).toHaveLength(2)
    expect(body.created[0].shortUrl).not.toBe(body.created[1].shortUrl)
  })

  it('should error when bulk shortUrl is already used in the database', async () => {
    const shortUrl = await generateRandomString(6)
    await createLinkUrl({ shortUrl, longUrl }, apiKey)

    const res = await postJson(
      API_EXTERNAL_V1_URLS_BULK,
      { urls: [{ shortUrl, longUrl: 'https://example.org' }] },
      undefined,
      apiKey,
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.created).toEqual([])
    expect(body.errors).toEqual([
      {
        index: 0,
        message: `Short link "${shortUrl}" is already used.`,
        type: 'ShortUrlError',
      },
    ])
  })
})
