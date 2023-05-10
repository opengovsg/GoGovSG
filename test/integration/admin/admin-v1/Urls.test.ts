import { MessageType } from '../../../../src/shared/util/messages'
import { ADMIN_API_V1_URLS } from '../../config'
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
  const res = await postJson(ADMIN_API_V1_URLS, link, undefined, apiKey)
  return res
}

/**
 * Integration tests for URLs.
 */
describe('Url integration tests', () => {
  let email: string
  let apiKey: string
  const longUrl = 'https://example.com'
  const validEmail = 'integration-test-user@test.gov.sg'

  beforeAll(async () => {
    ;({ email, apiKey } = await createIntegrationTestAdminUser())
  })

  afterAll(async () => {
    await deleteIntegrationTestUser(email)
  })

  it('should not be able to create urls without API key header', async () => {
    const res = await postJson(
      ADMIN_API_V1_URLS,
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
      ADMIN_API_V1_URLS,
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
      ADMIN_API_V1_URLS,
      { longUrl },
      undefined,
      testUser.apiKey,
    )
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json).toBeTruthy()
    expect(json).toEqual({
      message: `Email ${testUser.email} is not white listed`,
      type: MessageType.ShortUrlError,
    })
    await deleteIntegrationTestUser(testUser.email)
  })

  it('should be able to create link url with longUrl, shortUrl, and validEmail', async () => {
    const shortUrl = await generateRandomString(8)
    const res = await createLinkUrl(
      { shortUrl, longUrl, email: validEmail },
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
  })

  it('should not be able to create link url with longUrl and shortUrl, without validEmail', async () => {
    const shortUrl = await generateRandomString(8)
    const res = await createLinkUrl({ shortUrl, longUrl }, apiKey)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toBeTruthy()
    expect(json).toEqual({
      message: 'ValidationError: "email" is required',
    })
  })

  it('should not be able to create link url with longUrl and shortUrl, with invalid email', async () => {
    const shortUrl = await generateRandomString(8)
    const invalidEmail = 'integration-test-user@nongov.sg'
    const res = await createLinkUrl(
      { shortUrl, longUrl, email: invalidEmail },
      apiKey,
    )
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toBeTruthy()
    expect(json).toEqual({
      message: 'Validation error: Email domain is not white-listed.',
    })
  })

  it('should be able to create link url with longUrl and validEmail, without shortUrl', async () => {
    const res = await createLinkUrl({ longUrl, email: validEmail }, apiKey)
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

  it('should not be able to create link url with longUrl, without shortUrl and validEmail', async () => {
    const res = await createLinkUrl({ longUrl }, apiKey)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json).toBeTruthy()
    expect(json).toEqual({
      message: 'ValidationError: "email" is required',
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
      message: 'ValidationError: "email" must be a valid email',
    })
  })

  it('should not be able to create link url without longUrl, shortUrl, and email', async () => {
    const res = await createLinkUrl({}, apiKey)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({
      message: 'ValidationError: "longUrl" is required. "email" is required',
    })
  })

  it('should not be able to create link url with invalid longUrl', async () => {
    const invalidLongUrl = 'this-is-an-invalid-url'
    const res = await createLinkUrl(
      { longUrl: invalidLongUrl, email: validEmail },
      apiKey,
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({
      message: 'ValidationError: Only HTTPS URLs are allowed.',
    })
  })

  it('should not be able to create link url with invalid shortUrl', async () => {
    const invalidShortUrl = 'foo%bar'
    const res = await createLinkUrl(
      { shortUrl: invalidShortUrl, longUrl, email: validEmail },
      apiKey,
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({
      message: 'ValidationError: Short URL format is invalid.',
    })
  })

  it('should be able to create link url with longUrl, shortUrl, and same email as admin', async () => {
    const shortUrl = await generateRandomString(8)
    const res = await createLinkUrl({ shortUrl, longUrl, email }, apiKey)
    expect(res.status).toBe(200)
  })
})
