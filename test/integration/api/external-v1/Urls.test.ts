import fs from 'fs'
import os from 'os'
import path from 'path'
import FormData from 'form-data'
import {
  API_EXTERNAL_V1_URLS,
  LOCAL_BUCKET_URL,
  SMALL_TEXT_FILE_PATH,
} from '../../config'
import {
  DATETIME_REGEX,
  createIntegrationTestUser,
  deleteIntegrationTestUser,
  generateRandomString,
  readFile,
} from '../../util/helpers'
import {
  get,
  patch,
  patchFormData,
  postFormData,
  postJson,
} from '../../util/requests'

const MINIMAL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

async function createLinkUrl(
  link: {
    shortUrl?: string
    longUrl?: string
  },
  apiKey: string,
) {
  return postJson(API_EXTERNAL_V1_URLS, link, undefined, apiKey)
}

async function createFileUrl(
  apiKey: string,
  shortUrl?: string,
  filePath = SMALL_TEXT_FILE_PATH,
  fileName?: string,
) {
  const formData = new FormData()
  formData.append('file', readFile(filePath), {
    filename: fileName ?? path.basename(filePath),
  })
  if (shortUrl) {
    formData.append('shortUrl', shortUrl)
  }
  return postFormData(API_EXTERNAL_V1_URLS, formData, undefined, apiKey)
}

async function updateLinkUrl(
  link: { shortUrl: string; longUrl?: string; state?: string },
  apiKey: string,
) {
  const { shortUrl, longUrl, state } = link
  return patch(
    `${API_EXTERNAL_V1_URLS}/${shortUrl}`,
    {
      longUrl,
      state,
    },
    undefined,
    apiKey,
  )
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

  it('should not be able to create link url with neither longUrl nor file', async () => {
    const res = await createLinkUrl({}, apiKey)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.message).toMatch(/ValidationError/)
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

  it('should be able to create file url with shortUrl', async () => {
    const shortUrl = await generateRandomString(6)
    const res = await createFileUrl(apiKey, shortUrl)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      shortUrl,
      longUrl: `${LOCAL_BUCKET_URL}/${shortUrl}.txt`,
      clicks: 0,
      state: 'ACTIVE',
      createdAt: expect.stringMatching(DATETIME_REGEX),
      updatedAt: expect.stringMatching(DATETIME_REGEX),
    })
  })

  it('should be able to create file url without shortUrl', async () => {
    const res = await createFileUrl(apiKey)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      shortUrl: expect.stringMatching(/^[a-z0-9]{8}$/),
      longUrl: expect.stringMatching(
        new RegExp(`^${LOCAL_BUCKET_URL}/[a-z0-9]{8}\\.txt$`),
      ),
      clicks: 0,
      state: 'ACTIVE',
      createdAt: expect.stringMatching(DATETIME_REGEX),
      updatedAt: expect.stringMatching(DATETIME_REGEX),
    })
  })

  it('should not be able to create file url with disallowed type', async () => {
    const shortUrl = await generateRandomString(6)
    const disallowedFilePath = path.join(
      os.tmpdir(),
      `disallowed-${shortUrl}.exe`,
    )
    fs.writeFileSync(disallowedFilePath, 'not a real executable')
    try {
      const res = await createFileUrl(
        apiKey,
        shortUrl,
        disallowedFilePath,
        'malware.exe',
      )
      expect(res.status).toBe(415)
      const body = await res.json()
      expect(body).toEqual({
        message: 'File type disallowed.',
      })
    } finally {
      fs.unlinkSync(disallowedFilePath)
    }
  })

  it('should not be able to create file url over 20 MB', async () => {
    const shortUrl = await generateRandomString(6)
    const largeFilePath = path.join(os.tmpdir(), `large-${shortUrl}.txt`)
    fs.writeFileSync(largeFilePath, Buffer.alloc(21 * 1024 * 1024))
    try {
      const res = await createFileUrl(apiKey, shortUrl, largeFilePath)
      expect(res.status).toBe(413)
    } finally {
      fs.unlinkSync(largeFilePath)
    }
  })

  it('should not be able to create url with both longUrl and file', async () => {
    const shortUrl = await generateRandomString(6)
    const formData = new FormData()
    const smallTextFile = readFile(SMALL_TEXT_FILE_PATH)
    formData.append('file', smallTextFile)
    formData.append('shortUrl', shortUrl)
    formData.append('longUrl', longUrl)
    const res = await postFormData(
      API_EXTERNAL_V1_URLS,
      formData,
      undefined,
      apiKey,
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.message).toMatch(/ValidationError/)
  })

  it('should be able to replace file on file link', async () => {
    const shortUrl = await generateRandomString(6)
    await createFileUrl(apiKey, shortUrl)

    const formData = new FormData()
    formData.append('file', MINIMAL_PNG, { filename: 'image.png' })
    const res = await patchFormData(
      `${API_EXTERNAL_V1_URLS}/${shortUrl}`,
      formData,
      undefined,
      apiKey,
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      shortUrl,
      longUrl: `${LOCAL_BUCKET_URL}/${shortUrl}.png`,
      clicks: 0,
      state: 'ACTIVE',
      createdAt: expect.stringMatching(DATETIME_REGEX),
      updatedAt: expect.stringMatching(DATETIME_REGEX),
    })
  })

  it('should be able to update file link state via JSON', async () => {
    const shortUrl = await generateRandomString(6)
    await createFileUrl(apiKey, shortUrl)

    const res = await updateLinkUrl({ shortUrl, state: 'INACTIVE' }, apiKey)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      shortUrl,
      longUrl: `${LOCAL_BUCKET_URL}/${shortUrl}.txt`,
      clicks: 0,
      state: 'INACTIVE',
      createdAt: expect.stringMatching(DATETIME_REGEX),
      updatedAt: expect.stringMatching(DATETIME_REGEX),
    })
  })

  it('should not be able to update link url with file', async () => {
    const shortUrl = await generateRandomString(6)
    await createLinkUrl({ shortUrl, longUrl }, apiKey)

    const formData = new FormData()
    formData.append('file', readFile(SMALL_TEXT_FILE_PATH))
    const res = await patchFormData(
      `${API_EXTERNAL_V1_URLS}/${shortUrl}`,
      formData,
      undefined,
      apiKey,
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({
      message: 'Cannot update file for link.',
    })
  })

  it('should not be able to update file link with longUrl', async () => {
    const shortUrl = await generateRandomString(6)
    await createFileUrl(apiKey, shortUrl)

    const res = await updateLinkUrl(
      { shortUrl, longUrl: 'https://example.com' },
      apiKey,
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({
      message: 'Cannot update longUrl for file.',
    })
  })

  it('should include isFile in list response', async () => {
    const linkShortUrl = await generateRandomString(6)
    const fileShortUrl = await generateRandomString(6)
    await createLinkUrl({ shortUrl: linkShortUrl, longUrl }, apiKey)
    await createFileUrl(apiKey, fileShortUrl)

    const res = await get(API_EXTERNAL_V1_URLS, undefined, apiKey)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.count).toBe(2)
    expect(body.urls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          shortUrl: linkShortUrl,
          longUrl,
          isFile: false,
        }),
        expect.objectContaining({
          shortUrl: fileShortUrl,
          longUrl: `${LOCAL_BUCKET_URL}/${fileShortUrl}.txt`,
          isFile: true,
        }),
      ]),
    )
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
          isFile: false,
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
})
