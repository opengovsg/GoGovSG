import { Selector } from 'testcafe'
import { getOtp, getRootLocation, testEmail } from './util/config'
import {
  createLinkButton,
  drawer,
  fileTab,
  generateUrlImage,
  loginButton,
  loginSuccessAlert,
  longUrlTextField,
  shortUrlTextField,
  signInButton,
  uploadFile,
  userModal,
  userModalCloseButton,
} from './util/helpers'

const location = getRootLocation()

// eslint-disable-next-line no-undef
fixture(`User Page`).page(`${location}`)

test('User Page test.', async (t) => {
  /*
   * Drawer should open with the correct long url and state when a short url row is clicked
   */

  await t
    // Login Procedure
    .click(loginButton)
    .typeText('#email', `${testEmail}`)
    .click(signInButton.nth(0))

  const otp = await getOtp()

  await t
    .typeText('#otp', otp)
    .click(signInButton.nth(1))
    .click(loginSuccessAlert)

  // Close announcement modal
  if (await userModal.exists) {
    await t.click(userModalCloseButton)
  }
  // create link procedure - generate short url - 1
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  // Save short url 1 - active link
  const generatedUrlActive = await shortUrlTextField.value

  // create link procedure - proceed to create the link
  await t.typeText(longUrlTextField, 'google.com')

  // if it is the first link to be created, need to click on index 1 button
  if (await createLinkButton.nth(2).exists) {
    await t.click(createLinkButton.nth(2))
  } else {
    await t.click(createLinkButton.nth(1))
  }

  // create link procedure - generate short url - 2
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  // Save short url 2 - inactive link
  const generatedUrlInactive = await shortUrlTextField.value
  const linkRowInactive = Selector(`h6[title="${generatedUrlInactive}"]`)
  const activeSwitch = Selector('input[type="checkbox"]')

  // create link procedure - proceed to create the link
  await t
    .typeText(longUrlTextField, 'google.com')
    .click(createLinkButton.nth(2))
    .click(linkRowInactive)
    .click(activeSwitch)
    .click(drawer.child(2).child('main').child('button'))

  // create link procedure - generate short url - 3
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  // Save short url 3 - file link
  const generatedUrlFile = await shortUrlTextField.value

  // create link procedure - proceed to create the link
  await t
    .click(fileTab)
    .setFilesToUpload(uploadFile, './util/dummyFile.txt')
    .click(createLinkButton.nth(2))

  const filterPanelButton = Selector('img[alt="Filter and sort icon"]')
  const filterPanel = Selector('.MuiCollapse-container')
  const urlTable = Selector('tbody')
  const applyButton = Selector('span').withText('Apply')
  const resetButton = Selector('span').withText('Reset')
  const dateOfCreationButton = Selector('p').withText('Date of creation')
  const activeButton = Selector('p')
    .withText('Active')
    .parent()
    .child('button')
    .nth(0)
  const inactiveButton = Selector('p')
    .withText('Active')
    .parent()
    .child('button')
    .nth(1)
  const linkButton = Selector('p')
    .withText('Link')
    .parent()
    .child('button')
    .nth(0)
  const fileButton = Selector('p')
    .withText('Link')
    .parent()
    .child('button')
    .nth(1)
  const clickAway = Selector('h3')

  // Clicking on the button at the end of the search input should open the sort and filter panel
  await t
    .click(filterPanelButton)
    .expect(filterPanel.getStyleProperty('height'))
    .notEql('0px')

  // Links should be sorted by their created time in descending order when enabling sort by Date of creation and clicking apply
  // First is File link , second is inactive link, third is active link
  await t
    .click(dateOfCreationButton)
    .click(applyButton)
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
  // checks with date of creation
  // No more inactive link
  await t
    .click(filterPanelButton)
    .click(activeButton)
    .click(applyButton)
    .expect(filterPanel.getStyleProperty('height'))
    .eql('0px')
    // eslint-disable-next-line
    .expect(urlTable.child(1).child(1).child('div').child(0).child('h6').innerText)
    .notEql(`/${generatedUrlInactive}`)

  // Active links should be filtered out by checking only Inactive and clicking apply
  // Panel should be closed and links sorted by created time with no filtering after clicking on reset. All links and files should be visible.
  // checks with date of creation
  // Shows inactive link
  await t
    .click(filterPanelButton)
    .click(resetButton) // resets
    .click(filterPanelButton)
    .click(inactiveButton)
    .click(applyButton)
    // eslint-disable-next-line
    .expect(urlTable.child(0).child(1).child('div').child(0).child('h6').innerText)
    .eql(`/${generatedUrlInactive}`)

  // File links should be filtered out by checking only Link and clicking apply
  // checks with date of creation
  // No more file link
  await t
    .click(filterPanelButton)
    .click(resetButton) // resets
    .click(filterPanelButton)
    .click(linkButton)
    .click(applyButton)
    // eslint-disable-next-line
    .expect(urlTable.child(0).child(1).child('div').child(0).child('h6').innerText)
    .notEql(`/${generatedUrlFile}`)

  // Non-file links should be filtered out by checking only File and clicking apply
  // checks with date of creation
  // Shows file link
  await t
    .click(filterPanelButton)
    .click(resetButton) // resets
    .click(filterPanelButton)
    .click(fileButton)
    .click(applyButton)
    // eslint-disable-next-line
    .expect(urlTable.child(0).child(1).child('div').child(0).child('h6').innerText)
    .eql(`/${generatedUrlFile}`)

  // Panel should be closed when clicking outside of it
  await t
    .click(filterPanelButton)
    .click(clickAway)
    .expect(filterPanel.getStyleProperty('height'))
    .eql('0px')
})

/*
 * Links should be sorted by their number of clicks in descending order when enabling sort by Most number of visits and clicking apply
 * It should reset the table to page 1 when apply is clicked
 */
