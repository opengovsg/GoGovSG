import { Selector } from 'testcafe'
import { customAlphabet } from 'nanoid'
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
  createLinkButton,
  drawer,
  fileTab,
  generateUrlImage,
  longUrl,
  longUrlTextField,
  shortUrlTextField,
  uploadFile,
} from './helpers'

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'
const LENGTH = 6
const generate = customAlphabet(ALPHABET, LENGTH)

/**
 * Process of creating various types of links into test account.
 */
const linkCreationProcedure = async (t) => {
  // create key to searchBy
  const searchKey = generate()
  const searchKeyWithDash = `-${searchKey}`

  // Save short url 1 - active link
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)
  const generatedUrlActive = `${await shortUrlTextField.value}${searchKeyWithDash}`

  await t
    .typeText(shortUrlTextField, searchKeyWithDash)
    .typeText(longUrlTextField, `${shortUrl}`)

  await firstLinkHandle(t)

  // Save short url 2 - inactive link
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

  await t
    .click(activeSwitch)
    .click(drawer.child(2).child('main').child('button'))

  // // Save short url 3 - file link
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
  }
}

export default linkCreationProcedure
