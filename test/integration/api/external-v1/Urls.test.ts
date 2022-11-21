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
      message: 'ValidationError: Long url must start with https://',
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
      message: 'ValidationError: Short url format is invalid.',
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
      message: 'ValidationError: Long url must start with https://',
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
})
