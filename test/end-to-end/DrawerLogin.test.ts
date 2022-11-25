import { ClientFunction, Selector } from 'testcafe'
import {
  apiLocation,
  dummyFilePath,
  dummyRelativePath,
  largeFileSize,
  rootLocation,
  shortUrl,
  smallFileSize,
  subUrl,
  tagText1,
  tagText2,
  tagText3,
  testEmail,
  transferEmail,
} from './util/config'
import {
  activeSwitch,
  clickAway,
  closeButtonSnackBar,
  closeDrawerButton,
  createLinkButton,
  drawer,
  fileTab,
  generateUrlImage,
  helperText,
  inactiveWord,
  largeFileError,
  linkErrorSnackBar,
  linkTransferField,
  longUrl,
  longUrlTextField,
  shortUrlTextField,
  signOutButton,
  successSnackBar,
  tag1,
  tag2,
  tag3,
  tagCloseButton1,
  tagsAutocompleteInput,
  tagsAutocompleteTags,
  tagsSaveButton,
  tagsUpdatedSnackbar,
  transferButton,
  uploadFile,
  urlSaveButton,
  urlUpdatedSnackbar,
} from './util/helpers'
import LoginProcedure from './util/LoginProcedure'
import firstLinkHandle from './util/FirstLinkHandle'
import { createEmptyFileOfSize, deleteFile } from './util/fileHandle'

const getLocation = ClientFunction(() => document.location.href)

// eslint-disable-next-line no-undef
fixture(`Drawer Page`)
  .page(`${rootLocation}`)
  .beforeEach(async (t) => {
    await LoginProcedure(t)
  })

test('Drawer functionality test for url.', async (t) => {
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  const generatedUrl = await shortUrlTextField.value
  const linkRow = Selector(`h6[title="${generatedUrl}"]`)
  const linkTableRow = linkRow.parent('tr')

  await t.typeText(tagsAutocompleteInput, tagText1).pressKey('enter')

  await t.typeText(longUrlTextField, `${shortUrl}`)

  await firstLinkHandle(t)

  await t
    .click(linkRow)
    .expect(drawer.exists)
    .ok()
    // Drawer should open with the correct long url and tags when a short url row is clicked
    .expect(longUrl.value)
    .eql(`${shortUrl}`)
    .expect(tag1.exists)
    .ok()

  await t
    .click(closeDrawerButton)
    // Drawer can be closed on clickaway or when the close button is clicked.
    .expect(drawer.exists)
    .notOk()

  await t
    .click(linkRow)
    .click(activeSwitch.nth(0))
    // It should set short url active or inactive immediately when the toggle is switched (any caching for that short url is cleared)
    .expect(inactiveWord.exists)
    .ok()

  await t
    .click(longUrl)
    .pressKey('ctrl+a delete')
    .typeText(longUrl, `${subUrl}`)
    .click(tagCloseButton1)
    .click(closeDrawerButton)
    .click(linkRow)
    // Url and tags revert to original when user enters a new url, then re-opens the drawer without clicking "save"
    .expect(longUrl.value)
    .eql('google.com')

  await t
    .click(longUrl)
    .pressKey('ctrl+a delete')
    .typeText(longUrl, `${subUrl}`)
    .click(urlSaveButton)
    // It should show a success snackbar when long url is changed, and the drawer should remain open
    .expect(urlUpdatedSnackbar.exists)
    .ok()
    .expect(drawer.exists)
    .ok()

  await t
    .click(tagCloseButton1)
    .click(tagsAutocompleteInput)
    .typeText(tagsAutocompleteInput, tagText2)
    .pressKey('enter')
    .typeText(tagsAutocompleteInput, tagText3)
    .pressKey('enter')
    .click(tagsSaveButton)
    // It should show a success snackbar when tags are added and removed, and the drawer should remain open
    .expect(tagsUpdatedSnackbar.exists)
    .ok()
    .expect(drawer.exists)
    .ok()

  await t
    .click(closeDrawerButton)
    // Updated url and tags should be updated on the link row after closing drawer
    .expect(linkTableRow.find('span').withText(shortUrl).exists)
    .notOk()
    .expect(linkTableRow.find('span').withText(subUrl).exists)
    .ok()
    .expect(linkTableRow.find('span').withExactText(tagText1).exists)
    .notOk()
    .expect(linkTableRow.find('span').withExactText(tagText2).exists)
    .ok()
    .expect(linkTableRow.find('span').withExactText(tagText3).exists)
    .ok()

  await t
    .click(linkRow)
    // Updated url and tags should be displayed corectly when re-opening drawer
    .expect(longUrl.value)
    .eql(`${subUrl}`)
    .expect(tagsAutocompleteTags.count)
    .eql(2)
    .expect(tag2.exists)
    .ok()
    .expect(tag3.exists)
    .ok()

  await t
    .click(longUrl)
    .pressKey('ctrl+a delete')
    .typeText(longUrl, 'invalid')
    // Error validation (red underline + helperText) appears when value in edit long url textfield is invalid
    .expect(helperText.exists)
    .ok()

  // "Save" button is disabled (grey and unclickable) when value in edit long url textfield is invalid
  await t.expect(urlSaveButton.parent(0).hasAttribute('disabled')).ok()

  // Url is updated/saved when user enters a new url, then clicks "save" - check redirect with port 8080
  await t
    .click(activeSwitch.nth(0))
    .navigateTo(`${apiLocation}/${generatedUrl}`)
  await t.wait(6000).expect(getLocation()).contains(`${subUrl}`)
})

test('Drawer functionality test for file.', async (t) => {
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  const generatedFileUrl = await shortUrlTextField.value
  const linkRow = Selector(`h6[title="${generatedFileUrl}"]`)

  await createEmptyFileOfSize(dummyFilePath, smallFileSize)

  await t
    .click(fileTab)
    .setFilesToUpload(uploadFile, dummyRelativePath)
    .click(createLinkButton.nth(2))

  await deleteFile(dummyFilePath)
  await createEmptyFileOfSize(dummyFilePath, largeFileSize)

  await t
    .click(linkRow)
    .setFilesToUpload(uploadFile, dummyRelativePath)
    .expect(largeFileError.exists)
    .ok()

  await deleteFile(dummyFilePath)
})

test.before(async (t) => {
  // login to the transfer email to activate it, then logout
  await LoginProcedure(t, transferEmail)

  await t.click(signOutButton).navigateTo(`${rootLocation}`)

  await LoginProcedure(t)
})('Link transfer test.', async (t) => {
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)
  await t.typeText(tagsAutocompleteInput, tagText1).pressKey('enter')

  const generatedUrl = await shortUrlTextField.value
  const linkRow = Selector(`h6[title="${generatedUrl}"]`)
  const linkTableRow = linkRow.parent('tr')

  await t
    .typeText(longUrlTextField, `${shortUrl}`)
    .click(createLinkButton.nth(2))

  await t
    .click(linkRow)
    .typeText(linkTransferField, `${testEmail}`)
    .click(transferButton)
    .click(linkErrorSnackBar)
    // Unsuccessful link transfers do not close the drawer.
    .expect(drawer.exists)
    .ok()

  await t
    .click(linkTransferField)
    .pressKey('ctrl+a delete')
    .typeText(linkTransferField, `${transferEmail}`)
    .click(transferButton)
    // Successful link transfers closes the drawer.
    .expect(drawer.exists)
    .notOk()
    // It should show a success snackbar when link is transferred to another user.
    .expect(successSnackBar.exists)
    .ok()

  // Toasters to not disappear on clickaway (i.e. to prevent premature closure when user clickaway to save url)
  await t.click(clickAway).expect(successSnackBar.exists).ok()

  // Toasters to disappear when user clicks on the X only
  if (await successSnackBar.exists) {
    await t.click(closeButtonSnackBar)
  }
  await t.expect(successSnackBar.exists).notOk()

  // Verify the link is in the transfer email
  await t.click(signOutButton).navigateTo(`${rootLocation}`)

  await LoginProcedure(t, transferEmail)

  await t.expect(linkRow.exists).ok()

  // Verify the tag is transferred along with the link
  await t.expect(linkTableRow.find('span').withExactText(tagText1).exists).ok()
})

test('Link transfer toast test.', async (t) => {
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  const generatedUrl = await shortUrlTextField.value
  const linkRow = Selector(`h6[title="${generatedUrl}"]`)

  await t
    .typeText(longUrlTextField, `${shortUrl}`)
    .click(createLinkButton.nth(2))

  await t
    .click(linkRow)
    .typeText(linkTransferField, `${testEmail}`)
    .click(transferButton)

  // Toasters to disappear after 5sec
  await t.click(clickAway).wait(5000).expect(successSnackBar.exists).notOk()
})
