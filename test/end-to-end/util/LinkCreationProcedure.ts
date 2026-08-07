import { fetch } from 'cross-fetch'
import { expect, Page } from '@playwright/test'
import { apiLocation, dummyFilePath, shortUrl, smallFileSize } from './config'
import { createEmptyFileOfSize, deleteFile } from './fileHandle'
import { firstLinkHandle } from './FirstLinkHandle'
import {
  activeSwitch,
  closeDrawerButton,
  fileTab,
  generateRandomString,
  generateUrlImage,
  linkRowByShortUrl,
  longUrl,
  longUrlTextField,
  openCreateLinkModal,
  shortUrlTextField,
  uploadFile,
} from './helpers'

/**
 * Fetch link multiple times to increase usage of link.
 * Hits the Express server directly and waits for all requests to finish
 * so directory popularity sort sees the updated click counts.
 */
const fetchLink = async (
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
  console.log(`Url: ${url} was fetched ${values.filter(Boolean).length} times`)
  // Server updates click stats without awaiting; give writes a moment to land.
  await new Promise((resolve) => {
    setTimeout(resolve, 1500)
  })
}

const seedLinkClicks = async (
  generatedUrl: string,
  numberOfFetches: number,
): Promise<void> => {
  await fetchLink(generatedUrl, numberOfFetches)
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
 * Process of creating various types of links into test account.
 */
export const linkCreationProcedure = async (page: Page) => {
  // create key to searchBy
  const { searchKey, searchKeyWithDash } = generateSearchKey()

  // Save url - most popular link
  await openCreateLinkModal(page)
  await generateUrlImage(page).click()
  const generatedUrlMostPopular = `${await shortUrlTextField(page).inputValue()}${searchKeyWithDash}`

  await shortUrlTextField(page).fill(generatedUrlMostPopular)
  await longUrlTextField(page).fill(shortUrl)

  await firstLinkHandle(page)

  await seedLinkClicks(generatedUrlMostPopular, 10)

  // Save url - 2nd most popular link
  await openCreateLinkModal(page)
  await generateUrlImage(page).click()
  const generatedUrlSecondMostPopular = `${await shortUrlTextField(page).inputValue()}${searchKeyWithDash}`

  await shortUrlTextField(page).fill(generatedUrlSecondMostPopular)
  await longUrlTextField(page).fill(shortUrl)
  await firstLinkHandle(page)

  await seedLinkClicks(generatedUrlSecondMostPopular, 8)

  // Save url - active link + 3rd most recent link
  await openCreateLinkModal(page)
  await generateUrlImage(page).click()
  const generatedUrlActive = `${await shortUrlTextField(page).inputValue()}${searchKeyWithDash}`

  await shortUrlTextField(page).fill(generatedUrlActive)
  await longUrlTextField(page).fill(shortUrl)
  await firstLinkHandle(page)

  // Save url - inactive link + 2nd most recent link
  await openCreateLinkModal(page)
  await generateUrlImage(page).click()

  const generatedUrlInactive = `${await shortUrlTextField(page).inputValue()}${searchKeyWithDash}`

  const linkRowInactive = linkRowByShortUrl(page, generatedUrlInactive)

  await shortUrlTextField(page).fill(generatedUrlInactive)
  await longUrlTextField(page).fill(shortUrl)
  await firstLinkHandle(page)
  await linkRowInactive.click()
  await expect(longUrl(page)).toHaveValue(shortUrl)

  await activeSwitch(page).click()
  // Wait for the PATCH to land before closing the drawer. This link is the
  // "inactive" fixture for every directory and user-page filter assertion
  // downstream, so letting the drawer close early leaves those tests filtering
  // against a link that is still active.
  await expect(activeSwitch(page)).not.toBeChecked()
  await closeDrawerButton(page).click()

  // Save url - file link + most recent link
  await openCreateLinkModal(page)
  await generateUrlImage(page).click()

  const generatedUrlFile = `${await shortUrlTextField(page).inputValue()}${searchKeyWithDash}`

  await createEmptyFileOfSize(dummyFilePath, smallFileSize)

  await shortUrlTextField(page).fill(generatedUrlFile)
  await fileTab(page).click()
  await uploadFile(page).setInputFiles(dummyFilePath)
  await firstLinkHandle(page)

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
