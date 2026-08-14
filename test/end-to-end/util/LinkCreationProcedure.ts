import { fetch } from 'cross-fetch'
import { Page } from '@playwright/test'
import { apiLocation, dummyFilePath, shortUrl, smallFileSize } from './config'
import { createEmptyFileOfSize, deleteFile } from './fileHandle'
import { firstLinkHandle } from './FirstLinkHandle'
import {
  generateRandomString,
  generateUrlImage,
  longUrlTextField,
  openCreateLinkModal,
  shortUrlTextField,
} from './helpers'
import { seedFileLink, seedUrlLink } from './seed'
import { waitForRecordedClicks } from './waits'

/**
 * Fetch link multiple times to increase usage of link.
 * Hits the Express server directly and waits for all requests to finish
 * so directory popularity sort sees the updated click counts.
 */
const fetchLink = async (
  page: Page,
  shortUrlSlug: string,
  numberOfFetches: number,
): Promise<void> => {
  const url = `${apiLocation}/${shortUrlSlug}`
  const get = async (targetUrl: string): Promise<boolean> => {
    // Do not follow the outbound redirect; the click is recorded on the
    // first response from the short-link server.
    const res = await fetch(targetUrl, { redirect: 'manual' })
    return res.status >= 200 && res.status < 400
  }

  const fetchArray: Promise<boolean>[] = []
  for (let index = 0; index < numberOfFetches; index += 1) {
    fetchArray.push(get(url))
  }
  const values = await Promise.all(fetchArray)
  const recordedClicks = values.filter(Boolean).length
  console.log(`Url: ${url} was fetched ${recordedClicks} times`)
  // Server updates click stats without awaiting, so poll until the recorded
  // count catches up rather than sleeping past the write.
  await waitForRecordedClicks(page, shortUrlSlug, recordedClicks)
}

const seedLinkClicks = async (
  page: Page,
  generatedUrl: string,
  numberOfFetches: number,
): Promise<void> => {
  await fetchLink(page, generatedUrl, numberOfFetches)
}

const generateSearchKey = () => {
  // create key to searchBy
  const searchKey = generateRandomString(6)
  const searchKeyWithDash = `-${searchKey}`

  return { searchKey, searchKeyWithDash }
}

const clickCreateLinkButton = async (page: Page): Promise<void> => {
  await openCreateLinkModal(page)
  await generateUrlImage(page).click()
}

export const singleLinkCreationProcedure = async (page: Page) => {
  const { searchKey, searchKeyWithDash } = generateSearchKey()

  // Save url - active link + 3rd most recent link
  await clickCreateLinkButton(page)
  const generatedUrlActive = `${await shortUrlTextField(page).inputValue()}${searchKeyWithDash}`

  await shortUrlTextField(page).fill(generatedUrlActive)
  await longUrlTextField(page).fill(shortUrl)

  await firstLinkHandle(page)

  return { searchKey, generatedUrlActive }
}
/**
 * Creates the standard fixture set -- two clicked links, an active one, an
 * inactive one and a file -- in the test account, sharing one random search key
 * so a spec can isolate its own links from every other spec's.
 *
 * Seeded through the API rather than the modal: the specs that consume this
 * assert on directory and user-page filtering, sorting and redirects, none of
 * which is a statement about the create-link modal. UrlCreation.spec.ts owns
 * that, through the UI, deliberately.
 *
 * Creation order is the recency order the directory specs assert on, so these
 * are seeded in sequence rather than concurrently -- `createdAt` has millisecond
 * resolution and concurrent inserts would leave the order undefined.
 */
export const linkCreationProcedure = async (page: Page) => {
  // create key to searchBy
  const { searchKey, searchKeyWithDash } = generateSearchKey()
  const slug = () => `${generateRandomString(6)}${searchKeyWithDash}`

  // Save url - most popular link
  const generatedUrlMostPopular = slug()
  await seedUrlLink(page, {
    shortUrl: generatedUrlMostPopular,
    longUrl: shortUrl,
  })
  await seedLinkClicks(page, generatedUrlMostPopular, 10)

  // Save url - 2nd most popular link
  const generatedUrlSecondMostPopular = slug()
  await seedUrlLink(page, {
    shortUrl: generatedUrlSecondMostPopular,
    longUrl: shortUrl,
  })
  await seedLinkClicks(page, generatedUrlSecondMostPopular, 8)

  // Save url - active link + 3rd most recent link
  const generatedUrlActive = slug()
  await seedUrlLink(page, { shortUrl: generatedUrlActive, longUrl: shortUrl })

  // Save url - inactive link + 2nd most recent link. This is the "inactive"
  // fixture behind every downstream state filter, and the PATCH is awaited, so
  // no test can filter against a link that is still active.
  const generatedUrlInactive = slug()
  await seedUrlLink(page, {
    shortUrl: generatedUrlInactive,
    longUrl: shortUrl,
    active: false,
  })

  // Save url - file link + most recent link
  const generatedUrlFile = slug()
  await createEmptyFileOfSize(dummyFilePath, smallFileSize)
  await seedFileLink(page, {
    shortUrl: generatedUrlFile,
    filePath: dummyFilePath,
  })
  await deleteFile(dummyFilePath)

  return {
    searchKey,
    generatedUrlActive,
    generatedUrlInactive,
    generatedUrlFile,
    generatedUrlMostPopular,
    generatedUrlSecondMostPopular,
  }
}
