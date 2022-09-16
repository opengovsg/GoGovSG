import { Selector } from 'testcafe'
import { customAlphabet } from 'nanoid'
import { fetch } from 'cross-fetch'
import {
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
  generateUrlImage,
  longUrl,
  longUrlTextField,
  mobileCreateLinkButton,
  shortUrlTextField,
  uploadFile,
} from './helpers'

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'
const LENGTH = 6
const generate = customAlphabet(ALPHABET, LENGTH)

/**
 * Fetch link multiple times to increase usage of link.
 */
const fetchLink = async (url, numberOfFetches) => {
  const get = async (url) => {
    const res = await fetch(url)
    return res.ok
  }

  Promise.all(new Array(numberOfFetches).fill(get(url))).then(
    (values: boolean[]) => {
      console.log(
        `Url: ${url} was fetched ${values.filter(Boolean).length} times`,
      )
    },
  )
}

const getUrlAndFetch = async (t, generatedUrl, numberOfFetches) => {
  const linkRowPopular = Selector(`h6[title="${generatedUrl}"]`)
  await t.click(linkRowPopular)

  const shortLink = Selector(
    '.MuiTypography-root.MuiTypography-subtitle2',
  ).withText(generatedUrl)

  const shortUrlValue = await shortLink.innerText

  await t.click(closeDrawerButton)

  await fetchLink(shortUrlValue, numberOfFetches)
}

const generateSearchKey = () => {
  // create key to searchBy
  const searchKey = generate()
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

  await getUrlAndFetch(t, generatedUrlMostPopular, 10)

  // Save url - 2nd most popular link
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)
  const generatedUrlSecondMostPopular = `${await shortUrlTextField.value}${searchKeyWithDash}`

  await t
    .typeText(shortUrlTextField, searchKeyWithDash)
    .typeText(longUrlTextField, `${shortUrl}`)
    .click(createLinkButton.nth(2))

  await getUrlAndFetch(t, generatedUrlSecondMostPopular, 8)

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
