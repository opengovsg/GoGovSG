import { API_EXTERNAL_V2_URLS } from '../../config'
import {
  DATETIME_REGEX,
  createIntegrationTestAdminUser,
  createIntegrationTestUser,
  deleteIntegrationTestUser,
  generateRandomString,
} from '../../util/helpers'
import { postJson } from '../../util/requests'

async function createLinkUrl(
  link: {
    shortUrl?: string
    longUrl?: string
    email?: string
  },
  apiKey: string,
) {
  const res = await postJson(API_EXTERNAL_V2_URLS, link, undefined, apiKey)
  return res
}

/**
 * Integration tests for URLs.
 */
describe('Url integration tests', () => {
  let email: string
  let apiKey: string
  const longUrl = 'https://example.com'
  const targetEmail = 'integration-test-user@domain.com'

  beforeEach(async () => {
    ;({ email, apiKey } = await createIntegrationTestAdminUser())
  })

  afterEach(async () => {
    await deleteIntegrationTestUser(email)
  })

  it('should not be able to create urls without API key header', async () => {
    const res = await postJson(
      API_EXTERNAL_V2_URLS,
      { longUrl },
      undefined,
      undefined,
    )
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json).toBeTruthy()
    expect(json).toEqual({
      message: 'Authorization header is missing',
    })
  })

  it('should not be able to create urls with invalid API key', async () => {
    const res = await postJson(
      API_EXTERNAL_V2_URLS,
      { longUrl },
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

  it('should not be able to create urls with unauthorized API key', async () => {
    const testUser = await createIntegrationTestUser()
    const res = await postJson(
      API_EXTERNAL_V2_URLS,
      { longUrl },
      undefined,
      testUser.apiKey,
    )
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json).toBeTruthy()
    expect(json).toEqual({
      message: 'User is unauthorized',
    })
    await deleteIntegrationTestUser(testUser.email)
  })

  it('should be able to create link url with longUrl, shortUrl, and targetEmail', async () => {
    const shortUrl = await generateRandomString(8)
    const res = await createLinkUrl(
      { shortUrl, longUrl, email: targetEmail },
      apiKey,
    )
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
    await deleteIntegrationTestUser(targetEmail)
  })

  it('should be able to create link url with longUrl and shortUrl, without targetEmail', async () => {
    const shortUrl = await generateRandomString(8)
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

  it('should be able to create link url with longUrl and targetEmail, without shortUrl', async () => {
    const res = await createLinkUrl({ longUrl, email: targetEmail }, apiKey)
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

  it('should be able to create link url with longUrl, without shortUrl and targetEmail', async () => {
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

  it('should not be able to create link url with invalid email', async () => {
    const res = await createLinkUrl(
      { longUrl, email: 'invalid-email-value' },
      apiKey,
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({
      message: 'Error creating new user.',
    })
  })

  it('should not be able to create link url without longUrl, shortUrl, and email', async () => {
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
})
