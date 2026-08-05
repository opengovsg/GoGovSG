import { Selector } from 'testcafe'
import { fetch } from 'cross-fetch'
import {
  apiLocation,
  dummyFilePath,
  dummyRelativePath,
  shortUrl,
  smallFileSize,
} from './config'
import { createEmptyFileOfSize, deleteFile } from './fileHandle'
import firstLinkHandle from './FirstLinkHandle'
import {
  activeSwitch,
  closeDrawerButton,
  createLinkButton,
  fileTab,
  generateRandomString,
  generateUrlImage,
  longUrl,
  longUrlTextField,
  mobileCreateLinkButton,
  shortUrlTextField,
  uploadFile,
} from './helpers'

/**
 * Fetch link multiple times to increase usage of link.
 * Hits the Express server directly and waits for all requests to finish
 * so directory popularity sort sees the updated click counts.
 */
const fetchLink = async (shortUrlSlug, numberOfFetches) => {
  const url = `${apiLocation}/${shortUrlSlug}`
  const get = async (targetUrl) => {
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

const seedLinkClicks = async (generatedUrl, numberOfFetches) => {
  await fetchLink(generatedUrl, numberOfFetches)
}

const generateSearchKey = () => {
  // create key to searchBy
  const searchKey = generateRandomString(6)
  const searchKeyWithDash = `-${searchKey}`

  return { searchKey, searchKeyWithDash }
}

const clickCreateLinkButton = async (t) => {
  if (await createLinkButton.nth(0).exists) {
    await t.click(createLinkButton.nth(0))
  } else {
    await t.click(mobileCreateLinkButton)
  }
  await t.click(generateUrlImage)
}

export const singleLinkCreationProcedure = async (t) => {
  const { searchKey, searchKeyWithDash } = generateSearchKey()

  // Save url - active link + 3rd most recent link
  await clickCreateLinkButton(t)
  const generatedUrlActive = `${await shortUrlTextField.value}${searchKeyWithDash}`

  await t
    .typeText(shortUrlTextField, searchKeyWithDash)
    .typeText(longUrlTextField, `${shortUrl}`)

  await firstLinkHandle(t)

  return { searchKey, generatedUrlActive }
}
/**
 * Process of creating various types of links into test account.
 */
export const linkCreationProcedure = async (t) => {
  // create key to searchBy
  const { searchKey, searchKeyWithDash } = generateSearchKey()

  // Save url - most popularlink
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)
  const generatedUrlMostPopular = `${await shortUrlTextField.value}${searchKeyWithDash}`

  await t
    .typeText(shortUrlTextField, searchKeyWithDash)
    .typeText(longUrlTextField, `${shortUrl}`)

  await firstLinkHandle(t)

  await seedLinkClicks(generatedUrlMostPopular, 10)

  // Save url - 2nd most popular link
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)
  const generatedUrlSecondMostPopular = `${await shortUrlTextField.value}${searchKeyWithDash}`

  await t
    .typeText(shortUrlTextField, searchKeyWithDash)
    .typeText(longUrlTextField, `${shortUrl}`)
    .click(createLinkButton.nth(2))

  await seedLinkClicks(generatedUrlSecondMostPopular, 8)

  // Save url - active link + 3rd most recent link
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)
  const generatedUrlActive = `${await shortUrlTextField.value}${searchKeyWithDash}`

  await t
    .typeText(shortUrlTextField, searchKeyWithDash)
    .typeText(longUrlTextField, `${shortUrl}`)
    .click(createLinkButton.nth(2))

  // Save url - inactive link + 2nd most recent link
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  const generatedUrlInactive = `${await shortUrlTextField.value}${searchKeyWithDash}`

  const linkRowInactive = Selector(`h6[title="${generatedUrlInactive}"]`)

  await t
    .typeText(shortUrlTextField, searchKeyWithDash) // concat generated searchKey
    .typeText(longUrlTextField, `${shortUrl}`)
    .click(createLinkButton.nth(2))
    .click(linkRowInactive)
    .expect(longUrl.value)
    .eql(`${shortUrl}`)

  await t.click(activeSwitch).click(closeDrawerButton)

  // Save url - file link + most recent link
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  const generatedUrlFile = `${await shortUrlTextField.value}${searchKeyWithDash}`

  await createEmptyFileOfSize(dummyFilePath, smallFileSize)

  await t
    .typeText(shortUrlTextField, searchKeyWithDash) // concat generated searchKey
    .click(fileTab)
    .setFilesToUpload(uploadFile, dummyRelativePath)
    .click(createLinkButton.nth(2))

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
