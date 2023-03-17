import FormData from 'form-data'
import {
  API_USER_URL,
  IMAGE_FILE_PATH,
  LOCAL_BUCKET_URL,
  SMALL_TEXT_FILE_PATH,
} from '../../config'
import {
  DATETIME_REGEX,
  createIntegrationTestUser,
  deleteIntegrationTestUser,
  generateRandomString,
  getAuthCookie,
  readFile,
} from '../../util/helpers'
import {
  get,
  patch,
  patchFormData,
  postFormData,
  postJson,
} from '../../util/requests'

async function createLinkUrl(
  shortUrl: string,
  longUrl: string,
  authCookie: string,
) {
  const res = await postJson(API_USER_URL, { shortUrl, longUrl }, authCookie)
  return res
}

async function createFileUrl(shortUrl: string, authCookie: string) {
  const formData = new FormData()
  const smallTextFile = readFile(SMALL_TEXT_FILE_PATH)
  formData.append('file', smallTextFile)
  formData.append('shortUrl', shortUrl)
  const res = await postFormData(API_USER_URL, formData, authCookie)
  return res
}

/**
 * Integration tests for URLs.
 */
describe('Url integration tests', () => {
  let email: string
  let authCookie: string
  const longUrl = 'https://example.com'

  beforeEach(async () => {
    ;({ email } = await createIntegrationTestUser())
    authCookie = await getAuthCookie(email)
  })

  afterEach(async () => {
    await deleteIntegrationTestUser(email)
  })

  it('should be able to get urls', async () => {
    const res = await get(API_USER_URL, authCookie)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toBeTruthy()
    expect(json).toEqual({
      urls: [],
      count: 0,
    })
  })

  it('should be able to create link url', async () => {
    // Create short URL (link)
    const shortUrl = await generateRandomString(6)
    const res = await createLinkUrl(shortUrl, longUrl, authCookie)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      shortUrl,
      longUrl,
      state: 'ACTIVE',
      clicks: 0,
      tags: [],
      isFile: false,
      description: '',
      contactEmail: null,
      source: 'CONSOLE',
      tagStrings: '',
      createdAt: expect.stringMatching(DATETIME_REGEX),
      updatedAt: expect.stringMatching(DATETIME_REGEX),
    })
  })

  it('should be able to create file url', async () => {
    // Create short URL (file)
    const shortUrl = await generateRandomString(6)
    const res = await createFileUrl(shortUrl, authCookie)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      shortUrl,
      longUrl: `${LOCAL_BUCKET_URL}/${shortUrl}.txt`,
      state: 'ACTIVE',
      clicks: 0,
      tags: [],
      isFile: true,
      description: '',
      contactEmail: null,
      source: 'CONSOLE',
      tagStrings: '',
      createdAt: expect.stringMatching(DATETIME_REGEX),
      updatedAt: expect.stringMatching(DATETIME_REGEX),
    })
  })

  // it('should be unable to create file that is too large', async () => {
  //   const shortUrl = await generateRandomString(6)
  //   const formData = new FormData()
  //   const largeTextFile = readFile(LARGE_TEXT_FILE_PATH)
  //   formData.append('file', largeTextFile)
  //   formData.append('shortUrl', shortUrl)

  //   const res = await postFormData(API_USER_URL, formData, authCookie)
  //   expect(res.status).toBe(400)
  // })

  it('should be able to update link url', async () => {
    const shortUrl = await generateRandomString(6)
    await createLinkUrl(shortUrl, longUrl, authCookie)

    const newLongUrl = 'https://myspace.com'
    const res = await patch(
      API_USER_URL,
      {
        shortUrl,
        longUrl: newLongUrl,
        state: 'INACTIVE',
      },
      authCookie,
    )
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body).toEqual({
      shortUrl,
      longUrl: newLongUrl,
      state: 'INACTIVE',
      clicks: 0,
      tags: [],
      isFile: false,
      description: '',
      contactEmail: null,
      source: 'CONSOLE',
      tagStrings: '',
      createdAt: expect.stringMatching(DATETIME_REGEX),
      updatedAt: expect.stringMatching(DATETIME_REGEX),
    })

    // Should be able to get updated link URL
    const newRes = await get(API_USER_URL, authCookie)
    expect(newRes.status).toBe(200)
    const newBody = await newRes.json()
    expect(newBody).toEqual({
      urls: [
        {
          shortUrl,
          longUrl: newLongUrl,
          state: 'INACTIVE',
          clicks: 0,
          tags: [],
          isFile: false,
          description: '',
          contactEmail: null,
          source: 'CONSOLE',
          tagStrings: '',
          createdAt: expect.stringMatching(DATETIME_REGEX),
          updatedAt: expect.stringMatching(DATETIME_REGEX),
        },
      ],
      count: 1,
    })
  })

  it('should be able to update file url', async () => {
    const shortUrl = await generateRandomString(6)
    await createFileUrl(shortUrl, authCookie)

    const formData = new FormData()
    const imageFile = readFile(IMAGE_FILE_PATH)
    formData.append('file', imageFile)
    formData.append('shortUrl', shortUrl)

    const res = await patchFormData(API_USER_URL, formData, authCookie)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body).toEqual({
      shortUrl,
      longUrl: `${LOCAL_BUCKET_URL}/${shortUrl}.png`,
      state: 'ACTIVE',
      clicks: 0,
      tags: [],
      isFile: true,
      description: '',
      contactEmail: null,
      source: 'CONSOLE',
      tagStrings: '',
      createdAt: expect.stringMatching(DATETIME_REGEX),
      updatedAt: expect.stringMatching(DATETIME_REGEX),
    })

    // Should be able to get updated file URL
    const newRes = await get(API_USER_URL, authCookie)
    expect(newRes.status).toBe(200)
    const newBody = await newRes.json()
    expect(newBody).toEqual({
      urls: [
        {
          shortUrl,
          longUrl: `${LOCAL_BUCKET_URL}/${shortUrl}.png`,
          state: 'ACTIVE',
          clicks: 0,
          tags: [],
          isFile: true,
          description: '',
          contactEmail: null,
          source: 'CONSOLE',
          tagStrings: '',
          createdAt: expect.stringMatching(DATETIME_REGEX),
          updatedAt: expect.stringMatching(DATETIME_REGEX),
        },
      ],
      count: 1,
    })
  })

  // it('should be able to transfer ownership', async () => {
  // })

  // it('should verify that transferred links no longer appear', async () => {
  // })
})
