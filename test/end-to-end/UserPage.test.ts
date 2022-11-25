import { Selector } from 'testcafe'
import {
  dummyFilePath,
  dummyRelativePath,
  rootLocation,
  shortUrl,
  smallFileSize,
  tagText1,
  tagText2,
  tagText3,
} from './util/config'
import {
  activeSwitch,
  clickAway,
  createLinkButton,
  dateOfCreationButton,
  drawer,
  fileTab,
  filterSortPanel,
  generateUrlImage,
  longUrl,
  longUrlTextField,
  searchBarTagButton,
  searchBarTagsInput,
  shortUrlTextField,
  tagsAutocompleteInput,
  uploadFile,
  urlTableRowUrlText,
  userActiveButton,
  userApplyButton,
  userFileButton,
  userFilterSortPanelButton,
  userInactiveButton,
  userLinkButton,
  userResetButton,
} from './util/helpers'
import LoginProcedure from './util/LoginProcedure'
import firstLinkHandle from './util/FirstLinkHandle'
import { createEmptyFileOfSize, deleteFile } from './util/fileHandle'
import { TAG_SEPARATOR } from '../../src/shared/constants'

// eslint-disable-next-line no-undef
fixture(`User page`)
  .page(`${rootLocation}`)
  .beforeEach(async (t) => {
    await LoginProcedure(t)
  })

test('User page test on filter search by link', async (t) => {
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  // Create links for filter and search
  // Save short url 1 - active link
  const generatedUrlActive = await shortUrlTextField.value

  await t.typeText(longUrlTextField, `${shortUrl}`)

  await firstLinkHandle(t)

  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  // Save short url 2 - inactive link
  const generatedUrlInactive = await shortUrlTextField.value
  const linkRowInactive = Selector(`h6[title="${generatedUrlInactive}"]`)

  await t
    .typeText(longUrlTextField, `${shortUrl}`)
    .click(createLinkButton.nth(2))
    .click(linkRowInactive)
    .expect(longUrl.value)
    .eql(`${shortUrl}`)

  await t
    .click(activeSwitch)
    .click(drawer.child(2).child('main').child('button'))

  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  // Save short url 3 - file link
  const generatedUrlFile = await shortUrlTextField.value

  await createEmptyFileOfSize(dummyFilePath, smallFileSize)

  await t
    .click(fileTab)
    .setFilesToUpload(uploadFile, dummyRelativePath)
    .click(createLinkButton.nth(2))

  await deleteFile(dummyFilePath)

  // Clicking on the button at the end of the search input should open the sort and filter panel
  await t
    .click(userFilterSortPanelButton)
    .expect(filterSortPanel.getStyleProperty('height'))
    .notEql('0px')

  // Links should be sorted by their created time in descending order when enabling sort by Date of creation and clicking apply
  await t
    .click(dateOfCreationButton)
    .click(userApplyButton)
    // eslint-disable-next-line
    .expect(urlTableRowUrlText(0))
    .eql(`/${generatedUrlFile}`)
    // eslint-disable-next-line
    .expect(urlTableRowUrlText(1))
    .eql(`/${generatedUrlInactive}`)
    // eslint-disable-next-line
    .expect(urlTableRowUrlText(2))
    .eql(`/${generatedUrlActive}`)

  // Inactive links should be filtered out by checking only Active and clicking apply
  // Panel should be closed when apply is clicked
  await t
    .click(userFilterSortPanelButton)
    .click(userActiveButton)
    .click(userApplyButton)
    .expect(filterSortPanel.getStyleProperty('height'))
    .eql('0px')
    // eslint-disable-next-line
    .expect(urlTableRowUrlText(1))
    .notEql(`/${generatedUrlInactive}`)

  // Active links should be filtered out by checking only Inactive and clicking apply
  // Panel should be closed and links sorted by created time with no filtering after clicking on reset. All links and files should be visible.
  await t
    .click(userFilterSortPanelButton)
    .click(userResetButton) // resets
    .click(userFilterSortPanelButton)
    .click(userInactiveButton)
    .click(userApplyButton)
    // eslint-disable-next-line
    .expect(urlTableRowUrlText(0))
    .eql(`/${generatedUrlInactive}`)

  // File links should be filtered out by checking only Link and clicking apply
  await t
    .click(userFilterSortPanelButton)
    .click(userResetButton) // resets
    .click(userFilterSortPanelButton)
    .click(userLinkButton)
    .click(userApplyButton)
    // eslint-disable-next-line
    .expect(urlTableRowUrlText(0))
    .notEql(`/${generatedUrlFile}`)

  // Non-file links should be filtered out by checking only File and clicking apply
  await t
    .click(userFilterSortPanelButton)
    .click(userResetButton) // resets
    .click(userFilterSortPanelButton)
    .click(userFileButton)
    .click(userApplyButton)
    // eslint-disable-next-line
    .expect(urlTableRowUrlText(0))
    .eql(`/${generatedUrlFile}`)

  // Panel should be closed when clicking outside of it
  await t
    .click(userFilterSortPanelButton)
    .click(clickAway)
    .expect(filterSortPanel.getStyleProperty('height'))
    .eql('0px')
})

test('User page test on filter search by tags', async (t) => {
  // Create links for filter and search by tags
  // Save short url 1: link with tag 1
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)
  const generatedUrl1 = await shortUrlTextField.value
  const linkTableRow1 = Selector(`h6[title="${generatedUrl1}"]`).parent('tr')
  await t
    .typeText(longUrlTextField, shortUrl)
    .click(tagsAutocompleteInput)
    .typeText(tagsAutocompleteInput, tagText1)
    .pressKey('enter')

  await firstLinkHandle(t)

  // Save short url 2: link with tags 1 and 2
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)
  const generatedUrl2 = await shortUrlTextField.value
  const linkTableRow2 = Selector(`h6[title="${generatedUrl2}"]`).parent('tr')
  await t
    .typeText(longUrlTextField, shortUrl)
    .click(tagsAutocompleteInput)
    .typeText(tagsAutocompleteInput, tagText1)
    .pressKey('enter')
    .typeText(tagsAutocompleteInput, tagText2)
    .pressKey('enter')
    .click(createLinkButton.nth(2))

  // Save short url 3: file with tags 2 and 3
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)
  const generatedUrl3 = await shortUrlTextField.value
  const linkTableRow3 = Selector(`h6[title="${generatedUrl3}"]`).parent('tr')
  await createEmptyFileOfSize(dummyFilePath, smallFileSize)
  await t
    .click(fileTab)
    .setFilesToUpload(uploadFile, dummyRelativePath)
    .click(tagsAutocompleteInput)
    .typeText(tagsAutocompleteInput, tagText2)
    .pressKey('enter')
    .typeText(tagsAutocompleteInput, tagText3)
    .pressKey('enter')
    .click(createLinkButton.nth(2))
  await deleteFile(dummyFilePath)

  // Click on tag 1 from url 1
  await t
    .click(linkTableRow1.find('span').withExactText(tagText1))
    .wait(3000)
    // Link table should show urls 2 and 1 on top
    .expect(urlTableRowUrlText(0))
    .eql(`/${generatedUrl2}`)
    .expect(urlTableRowUrlText(1))
    .eql(`/${generatedUrl1}`)
    // Search dropdown should change to search by tags
    .expect(searchBarTagButton.exists)
    .ok()
    // Search input should change to tag 1
    .expect(searchBarTagsInput.value)
    .eql(tagText1)

  // Click on tag 2 from url 2
  await t
    .click(linkTableRow2.find('span').withExactText(tagText2))
    .wait(3000)
    // Link table should show urls 3, 2, and 1 on top
    .expect(urlTableRowUrlText(0))
    .eql(`/${generatedUrl3}`)
    .expect(urlTableRowUrlText(1))
    .eql(`/${generatedUrl2}`)
    .expect(urlTableRowUrlText(2))
    .eql(`/${generatedUrl1}`)
    // Search dropdown should remain at search by tags
    .expect(searchBarTagButton.exists)
    .ok()
    // Search input should change to tag 1 + tag separator + tag 2
    .expect(searchBarTagsInput.value)
    .eql(`${tagText1}${TAG_SEPARATOR}${tagText2}`)

  // Add semicolon and non-existent tag to search input
  await t
    .typeText(searchBarTagsInput, `${TAG_SEPARATOR}zzzzzzzzzzzzzzzzzzzz`)
    .wait(3000)
    // Link table should still show urls 3, 2, and 1 on top (because of OR condition between search tags)
    .expect(urlTableRowUrlText(0))
    .eql(`/${generatedUrl3}`)
    .expect(urlTableRowUrlText(1))
    .eql(`/${generatedUrl2}`)
    .expect(urlTableRowUrlText(2))
    .eql(`/${generatedUrl1}`)

  // Delete tags from search input
  await t
    .click(searchBarTagsInput)
    .pressKey('ctrl+a delete')
    .wait(3000)
    // Link table should show urls 3, 2, and 1 on top
    .expect(urlTableRowUrlText(0))
    .eql(`/${generatedUrl3}`)
    .expect(urlTableRowUrlText(1))
    .eql(`/${generatedUrl2}`)
    .expect(urlTableRowUrlText(2))
    .eql(`/${generatedUrl1}`)

  // Change search input to 'TaG_', a case-insensitive partial match for tag 1 but not 2 nor 3
  await t
    .typeText(searchBarTagsInput, 'TaG_')
    // Link table should show urls 2 and 1 on top
    .expect(urlTableRowUrlText(0))
    .eql(`/${generatedUrl2}`)
    .expect(urlTableRowUrlText(1))
    .eql(`/${generatedUrl1}`)
})
