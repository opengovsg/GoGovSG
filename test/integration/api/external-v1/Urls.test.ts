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

const defaultLinkFields = {
  tags: [],
  description: '',
  contactEmail: null,
}

async function createLinkUrl(
  link: {
    shortUrl?: string
    longUrl?: string
    tags?: string[]
    description?: string
    contactEmail?: string | null
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
  link: {
    shortUrl: string
    longUrl?: string
    state?: string
    tags?: string[]
    description?: string
    contactEmail?: string | null
  },
  apiKey: string,
) {
  const { shortUrl, longUrl, state, tags, description, contactEmail } = link
  const res = await patch(
    `${API_EXTERNAL_V1_URLS}/${shortUrl}`,
    {
      longUrl,
      state,
      tags,
      description,
      contactEmail,
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
      ...defaultLinkFields,
    })
  })

  it('should be able to create link url with tags, description, and contactEmail', async () => {
    const shortUrl = await generateRandomString(6)
    const tags = ['campaign-a', '2026']
    const description = 'Landing page for campaign A'
    const contactEmail = 'person@open.gov.sg'
    const res = await createLinkUrl(
      { shortUrl, longUrl, tags, description, contactEmail },
      apiKey,
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      shortUrl,
      longUrl,
      clicks: 0,
      state: 'ACTIVE',
      createdAt: expect.stringMatching(DATETIME_REGEX),
      updatedAt: expect.stringMatching(DATETIME_REGEX),
      tags,
      description,
      contactEmail,
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
      ...defaultLinkFields,
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

  it('should not be able to create link url with invalid tag', async () => {
    const shortUrl = await generateRandomString(6)
    const res = await createLinkUrl(
      { shortUrl, longUrl, tags: ['tag-a', 'tag-a'] },
      apiKey,
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({
      message: 'ValidationError: "tags[1]" contains a duplicate value',
    })
  })

  it('should not be able to create link url with invalid contactEmail', async () => {
    const shortUrl = await generateRandomString(6)
    const res = await createLinkUrl(
      { shortUrl, longUrl, contactEmail: 'not-a-gov-email@example.com' },
      apiKey,
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({
      message: 'ValidationError: Not a valid gov email or null',
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
      ...defaultLinkFields,
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
          ...defaultLinkFields,
        },
      ],
      count: 1,
    })
  })

  it('should be able to update link url with tags, description, and contactEmail', async () => {
    const shortUrl = await generateRandomString(6)
    await createLinkUrl({ shortUrl, longUrl }, apiKey)

    const tags = ['campaign-a']
    const description = 'Updated description'
    const contactEmail = 'person@open.gov.sg'
    const res = await updateLinkUrl(
      { shortUrl, tags, description, contactEmail },
      apiKey,
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      shortUrl,
      longUrl,
      clicks: 0,
      state: 'ACTIVE',
      createdAt: expect.stringMatching(DATETIME_REGEX),
      updatedAt: expect.stringMatching(DATETIME_REGEX),
      tags,
      description,
      contactEmail,
    })
  })

  it('should fully replace tags on update', async () => {
    const shortUrl = await generateRandomString(6)
    await createLinkUrl({ shortUrl, longUrl, tags: ['tag-a', 'tag-b'] }, apiKey)

    const tags = ['tag-c']
    const res = await updateLinkUrl({ shortUrl, tags }, apiKey)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.tags).toEqual(tags)

    const getRes = await get(API_EXTERNAL_V1_URLS, undefined, apiKey)
    const getBody = await getRes.json()
    expect(getBody.urls[0].tags).toEqual(tags)
  })

  it('should leave tags unchanged when omitted on update', async () => {
    const shortUrl = await generateRandomString(6)
    const originalTags = ['tag-a', 'tag-b']
    await createLinkUrl({ shortUrl, longUrl, tags: originalTags }, apiKey)

    const res = await updateLinkUrl(
      { shortUrl, description: 'only description changed' },
      apiKey,
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.tags).toEqual(originalTags)
  })

  it('should clear description and contactEmail on update', async () => {
    const shortUrl = await generateRandomString(6)
    await createLinkUrl(
      {
        shortUrl,
        longUrl,
        description: 'to be cleared',
        contactEmail: 'person@open.gov.sg',
      },
      apiKey,
    )

    const res = await updateLinkUrl(
      { shortUrl, description: '', contactEmail: null },
      apiKey,
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.description).toBe('')
    expect(body.contactEmail).toBeNull()
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
      ...defaultLinkFields,
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
      ...defaultLinkFields,
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
})
