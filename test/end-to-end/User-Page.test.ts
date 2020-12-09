/* eslint-disable import/no-extraneous-dependencies */
import { Selector } from 'testcafe'
import { rootLocation, shortUrl } from './util/config'
import {
  activeSwitch,
  clickAway,
  createLinkButton,
  dateOfCreationButton,
  drawer,
  fileTab,
  filterPanel,
  generateUrlImage,
  longUrl,
  longUrlTextField,
  shortUrlTextField,
  uploadFile,
  urlTable,
  userActiveButton,
  userApplyButton,
  userFileButton,
  userFilterPanelButton,
  userInactiveButton,
  userLinkButton,
  userResetButton,
} from './util/helpers'
import LoginProcedure from './util/Login-Procedure'
import firstLinkHandle from './util/First-Link-Handle'

// eslint-disable-next-line no-undef
fixture(`User Page`)
  .page(`${rootLocation}`)
  .beforeEach(async (t) => {
    await LoginProcedure(t)
  })

test('User Page test on filter and search bar', async (t) => {
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

  await t
    .click(fileTab)
    .setFilesToUpload(uploadFile, './util/dummyFile.txt')
    .click(createLinkButton.nth(2))

  // Clicking on the button at the end of the search input should open the sort and filter panel
  await t
    .click(userFilterPanelButton)
    .expect(filterPanel.getStyleProperty('height'))
    .notEql('0px')

  // Links should be sorted by their created time in descending order when enabling sort by Date of creation and clicking apply
  await t
    .click(dateOfCreationButton)
    .click(userApplyButton)
    // eslint-disable-next-line
    .expect(urlTable.child(0).child(1).child('div').child(0).child('h6').innerText)
    .eql(`/${generatedUrlFile}`)
    // eslint-disable-next-line
    .expect(urlTable.child(1).child(1).child('div').child(0).child('h6').innerText)
    .eql(`/${generatedUrlInactive}`)
    // eslint-disable-next-line
    .expect(urlTable.child(2).child(1).child('div').child(0).child('h6').innerText)
    .eql(`/${generatedUrlActive}`)

  // Inactive links should be filtered out by checking only Active and clicking apply
  // Panel should be closed when apply is clicked
  await t
    .click(userFilterPanelButton)
    .click(userActiveButton)
    .click(userApplyButton)
    .expect(filterPanel.getStyleProperty('height'))
    .eql('0px')
    // eslint-disable-next-line
    .expect(urlTable.child(1).child(1).child('div').child(0).child('h6').innerText)
    .notEql(`/${generatedUrlInactive}`)

  // Active links should be filtered out by checking only Inactive and clicking apply
  // Panel should be closed and links sorted by created time with no filtering after clicking on reset. All links and files should be visible.
  await t
    .click(userFilterPanelButton)
    .click(userResetButton) // resets
    .click(userFilterPanelButton)
    .click(userInactiveButton)
    .click(userApplyButton)
    // eslint-disable-next-line
    .expect(urlTable.child(0).child(1).child('div').child(0).child('h6').innerText)
    .eql(`/${generatedUrlInactive}`)

  // File links should be filtered out by checking only Link and clicking apply
  await t
    .click(userFilterPanelButton)
    .click(userResetButton) // resets
    .click(userFilterPanelButton)
    .click(userLinkButton)
    .click(userApplyButton)
    // eslint-disable-next-line
    .expect(urlTable.child(0).child(1).child('div').child(0).child('h6').innerText)
    .notEql(`/${generatedUrlFile}`)

  // Non-file links should be filtered out by checking only File and clicking apply
  await t
    .click(userFilterPanelButton)
    .click(userResetButton) // resets
    .click(userFilterPanelButton)
    .click(userFileButton)
    .click(userApplyButton)
    // eslint-disable-next-line
    .expect(urlTable.child(0).child(1).child('div').child(0).child('h6').innerText)
    .eql(`/${generatedUrlFile}`)

  // Panel should be closed when clicking outside of it
  await t
    .click(userFilterPanelButton)
    .click(clickAway)
    .expect(filterPanel.getStyleProperty('height'))
    .eql('0px')
})
