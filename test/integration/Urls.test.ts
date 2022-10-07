import FormData from 'form-data'
import {
  API_USER_URL,
  IMAGE_FILE_PATH,
  LOCAL_BUCKET_URL,
  SMALL_TEXT_FILE_PATH,
} from './config'
import clearDb from './util/db'
import {
  DATETIME_REGEX,
  generateRandomString,
  getAuthCookie,
  readFile,
} from './util/helpers'
import {
  get,
  patch,
  patchFormData,
  postFormData,
  postJson,
} from './util/requests'

/**
 * Integration tests for URLs.
 */
describe('Url integration tests', () => {
  let authCookie: string
  let shortUrl1: string
  let shortUrl2: string
  let longUrl1: string

  beforeAll(async () => {
    await clearDb()
    authCookie = await getAuthCookie()
    shortUrl1 = await generateRandomString(6)
    shortUrl2 = await generateRandomString(6)
    longUrl1 = 'https://google.com'
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
    // Create short URL 1 (link)
    const res = await postJson(
      API_USER_URL,
      {
        shortUrl: shortUrl1,
        longUrl: longUrl1,
      },
      authCookie,
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      shortUrl: shortUrl1,
      longUrl: longUrl1,
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
    // Create short URL 2 (file)
    const formData = new FormData()
    const smallTextFile = readFile(SMALL_TEXT_FILE_PATH)
    formData.append('file', smallTextFile)
    formData.append('shortUrl', shortUrl2)

    const res = await postFormData(API_USER_URL, formData, authCookie)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({
      shortUrl: shortUrl2,
      longUrl: `${LOCAL_BUCKET_URL}/${shortUrl2}.txt`,
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
    longUrl1 = 'https://myspace.com'
    const res = await patch(
      API_USER_URL,
      {
        shortUrl: shortUrl1,
        longUrl: longUrl1,
        state: 'INACTIVE',
      },
      authCookie,
    )
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body).toEqual({
      shortUrl: shortUrl1,
      longUrl: longUrl1,
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
  })

  it('should be able to update file url', async () => {
    const formData = new FormData()
    const imageFile = readFile(IMAGE_FILE_PATH)
    formData.append('file', imageFile)
    formData.append('shortUrl', shortUrl2)

    const res = await patchFormData(API_USER_URL, formData, authCookie)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body).toEqual({
      shortUrl: shortUrl2,
      longUrl: `${LOCAL_BUCKET_URL}/${shortUrl2}.png`,
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

  it('should get the new updated links', async () => {
    const newRes = await get(API_USER_URL, authCookie)
    expect(newRes.status).toBe(200)
    const newBody = await newRes.json()
    expect(newBody).toEqual({
      urls: [
        {
          shortUrl: shortUrl2,
          longUrl: `${LOCAL_BUCKET_URL}/${shortUrl2}.png`,
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
        {
          shortUrl: shortUrl1,
          longUrl: longUrl1,
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
      count: 2,
    })
  })

  // it('should be able to transfer ownership', async () => {
  // })

  // it('should verify that transferred links no longer appear', async () => {
  // })
})
