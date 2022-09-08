import { rootLocation, testEmail } from './util/config'
import {
  activeButton,
  activeButtonStyle,
  checkedButtonClass,
  clickAway,
  directoryFilterPanel,
  directoryFilterPanelButton,
  directoryPageButton,
  directoryTextFieldEmail,
  directoryTextFieldKeyword,
  emailToggle,
  fileButton,
  fileButtonStyle,
  getLocation,
  inactiveButton,
  inactiveButtonStyle,
  linkButton,
  linkButtonStyle,
  mostPopularFilter,
  mostRecentFilter,
  resetButton,
  sortButtonSelectedClass,
  sortButtonUnselectedClass,
  toggle,
  uncheckedButtonClass,
  urlTable,
  urlTableRowText,
  userApplyButton,
} from './util/helpers'
import LoginProcedure from './util/LoginProcedure'
import linkCreationProcedure from './util/LinkCreationProcedure'

// eslint-disable-next-line no-undef
fixture(`Directory Filter`)
  .page(`${rootLocation}`)
  .beforeEach(async (t) => {
    await LoginProcedure(t)
  })

// eslint-disable-next-line jest/no-disabled-tests
test('Populate with links', async (t) => {
  const createdLinks = await linkCreationProcedure(t)
  // eslint-disable-next-line no-param-reassign
  t.fixtureCtx.createdLinks = createdLinks
})

// eslint-disable-next-line jest/no-disabled-tests
test('Default settings', async (t) => {
  // Clicking on the directory page button brings user to directory page
  await t
    .click(directoryPageButton)
    .expect(getLocation())
    .match(/directory/)

  // Clicking on the button at the end of the search input should open the sort and filter panel
  await t
    .click(directoryFilterPanelButton)
    .expect(directoryFilterPanel.getStyleProperty('height'))
    .notEql('0px')
    // Panel should be closed when clicking outside of it
    .click(clickAway)
  // TODO: find the right element to measure height from
  // .expect(directoryFilterPanel.getStyleProperty('height'))
  // .eql('0px')

  // TODO: set classes as constants somewhere
  // Default search results should be by keyword, sort by recency, with all states, both url and file types
  await t
    .click(directoryPageButton)
    .click(directoryFilterPanelButton)
    .expect(directoryTextFieldKeyword.exists)
    .ok()
    .expect(directoryTextFieldEmail.exists)
    .notOk()
    .expect(linkButtonStyle.hasClass(uncheckedButtonClass))
    .ok()
    .expect(fileButtonStyle.hasClass(uncheckedButtonClass))
    .ok()
    .expect(activeButtonStyle.hasClass(uncheckedButtonClass))
    .ok()
    .expect(inactiveButtonStyle.hasClass(uncheckedButtonClass))
    .ok()
    .expect(mostPopularFilter.hasClass(sortButtonUnselectedClass))
    .ok()
    .expect(mostRecentFilter.hasClass(sortButtonSelectedClass))
    .ok()
})

// eslint-disable-next-line jest/no-disabled-tests
test('Directory Page test search by keyword and email', async (t) => {
  const { generatedUrlFile } = t.fixtureCtx.createdLinks

  // Clicking on the directory page button brings user to directory page
  await t.click(directoryPageButton)

  // search by keyword
  await t
    .typeText(directoryTextFieldKeyword, `${generatedUrlFile}`)
    .expect(urlTableRowText(0))
    .eql(`/${generatedUrlFile}`)
    // change in url
    .expect(getLocation())
    .match(new RegExp(`query=${generatedUrlFile}`))

  // search by email
  await t
    .click(toggle)
    .click(emailToggle)
    // reset search result
    .expect(directoryTextFieldEmail.value)
    .eql('')
    // find email results
    .typeText(directoryTextFieldEmail, testEmail)
    .expect(urlTable.child(0).child(2).child('p').innerText)
    .eql(testEmail)
    // change in url (email in url)
    .expect(getLocation())
    .match(new RegExp(`query=${testEmail}`.replace('@', '%40')))
    // // change in url (isEmail in url)
    .expect(getLocation())
    .match(/isEmail=true/)
})

// eslint-disable-next-line jest/no-disabled-tests
test('Directory Page test recency sort order', async (t) => {
  const {
    generatedUrlFile,
    generatedUrlInactive,
    generatedUrlActive,
    searchKey,
  } = t.fixtureCtx.createdLinks

  /*
  
  Based on LinkCreationProcedure recency sort order (most recent on top):
  1. generatedUrlFile,
  2. generatedUrlInactive,
  3. generatedUrlActive

  */

  await t
    .click(directoryPageButton)
    // search by search key
    .typeText(directoryTextFieldKeyword, searchKey)
    // first row
    .expect(urlTableRowText(0))
    .eql(`/${generatedUrlFile}`)
    // second row
    .expect(urlTableRowText(1))
    .eql(`/${generatedUrlInactive}`)
    // third row
    .expect(urlTableRowText(2))
    .eql(`/${generatedUrlActive}`)
})

// eslint-disable-next-line jest/no-disabled-tests
test('Directory Page test popularity sort order', async (t) => {
  const { generatedUrlMostPopular, generatedUrlSecondMostPopular, searchKey } =
    t.fixtureCtx.createdLinks

  /*
  
  Based on LinkCreationProcedure popularity sort order (most popular on top):
  1. generatedUrlMostPopular
  2. generatedUrlSecondMostPopular

  */

  await t
    .click(directoryPageButton)
    // change filter to 'most popularity'
    .click(directoryFilterPanelButton)
    .click(mostPopularFilter)
    .click(userApplyButton)
    // search by search key
    .typeText(directoryTextFieldKeyword, searchKey)
    // first row
    .expect(urlTableRowText(0))
    .eql(`/${generatedUrlMostPopular}`)
    // second row
    .expect(urlTableRowText(1))
    .eql(`/${generatedUrlSecondMostPopular}`)
})

// eslint-disable-next-line jest/no-disabled-tests
test('Directory Page filter by active', async (t) => {
  const { generatedUrlFile, generatedUrlActive, searchKey } =
    t.fixtureCtx.createdLinks

  /*
  
  Based on LinkCreationProcedure with sorting by recency and active:
  1. generatedUrlFile,
  2. generatedUrlActive

  */

  await t
    .click(directoryPageButton)
    // change filter to active
    .click(directoryFilterPanelButton)
    .click(activeButton)
    .click(userApplyButton)
    // search by search key
    .typeText(directoryTextFieldKeyword, searchKey)
    // first row
    .expect(urlTableRowText(0))
    .eql(`/${generatedUrlFile}`)
    // second row
    .expect(urlTableRowText(1))
    .eql(`/${generatedUrlActive}`)
})

// eslint-disable-next-line jest/no-disabled-tests
test('Directory Page filter by inactive', async (t) => {
  const { generatedUrlInactive, searchKey } = t.fixtureCtx.createdLinks

  /*
  
  Based on LinkCreationProcedure with sorting by recency and inactive:
  1. generatedUrlInactive
  */

  await t
    .click(directoryPageButton)
    // change filter to inactive
    .click(directoryFilterPanelButton)
    .click(inactiveButton)
    .click(userApplyButton)
    // search by search key
    .typeText(directoryTextFieldKeyword, searchKey)
    // first row
    .expect(urlTableRowText(0))
    .eql(`/${generatedUrlInactive}`)
})

// eslint-disable-next-line jest/no-disabled-tests
test('Directory Page filter by file', async (t) => {
  const { generatedUrlFile, searchKey } = t.fixtureCtx.createdLinks

  /*
  
  Based on LinkCreationProcedure with sorting by recency and file:
  1. generatedUrlFile,

  */

  await t
    .click(directoryPageButton)
    // change filter to file
    .click(directoryFilterPanelButton)
    .click(fileButton)
    .click(userApplyButton)
    // search by search key
    .typeText(directoryTextFieldKeyword, searchKey)
    // first row
    .expect(urlTableRowText(0))
    .eql(`/${generatedUrlFile}`)
})

// eslint-disable-next-line jest/no-disabled-tests
test('Directory Page filter by url', async (t) => {
  const { generatedUrlInactive, generatedUrlActive, searchKey } =
    t.fixtureCtx.createdLinks

  /*
  
  Based on LinkCreationProcedure with sorting by recency and url:
  1. generatedUrlInactive
  2. generatedUrlFile,

  */

  await t
    .click(directoryPageButton)
    // change filter to file
    .click(directoryFilterPanelButton)
    .click(linkButton)
    .click(userApplyButton)
    // search by search key
    .typeText(directoryTextFieldKeyword, searchKey)
    // first row
    .expect(urlTableRowText(0))
    .eql(`/${generatedUrlInactive}`)
    // second row
    .expect(urlTableRowText(1))
    .eql(`/${generatedUrlActive}`)
})

// eslint-disable-next-line jest/no-disabled-tests
test('Directory Page test reset filter', async (t) => {
  /*
  
  Based on LinkCreationProcedure with sorting by recency and url:
  1. generatedUrlInactive
  2. generatedUrlFile,

  */

  await t
    .click(directoryPageButton)
    // change filter to file
    .click(directoryFilterPanelButton)
    .click(mostPopularFilter)
    .click(activeButton)
    .click(inactiveButton)
    .click(linkButton)
    .click(fileButton)
    .click(userApplyButton)
    // check all styles of selected values
    .expect(linkButtonStyle.hasClass(checkedButtonClass))
    .ok()
    .expect(fileButtonStyle.hasClass(checkedButtonClass))
    .ok()
    .expect(activeButtonStyle.hasClass(checkedButtonClass))
    .ok()
    .expect(inactiveButtonStyle.hasClass(checkedButtonClass))
    .ok()
    .expect(mostPopularFilter.hasClass(sortButtonSelectedClass))
    .ok()
    .expect(mostRecentFilter.hasClass(sortButtonUnselectedClass))
    .ok()

  // reset
  await t
    .click(directoryFilterPanelButton)
    .click(resetButton)
    .expect(linkButtonStyle.hasClass(uncheckedButtonClass))
    .ok()
    .expect(linkButtonStyle.hasClass(checkedButtonClass))
    .notOk()
    .expect(fileButtonStyle.hasClass(uncheckedButtonClass))
    .ok()
    .expect(fileButtonStyle.hasClass(checkedButtonClass))
    .notOk()
    .expect(activeButtonStyle.hasClass(uncheckedButtonClass))
    .ok()
    .expect(activeButtonStyle.hasClass(checkedButtonClass))
    .notOk()
    .expect(inactiveButtonStyle.hasClass(uncheckedButtonClass))
    .ok()
    .expect(inactiveButtonStyle.hasClass(checkedButtonClass))
    .notOk()
    .expect(mostPopularFilter.hasClass(sortButtonUnselectedClass))
    .ok()
    .expect(mostRecentFilter.hasClass(sortButtonSelectedClass))
    .ok()
})
/*

TODO:

Directory - desktop view

 It should redirect to the short url link when the row is clicked for active link
 It should underline the user email when hovering on the email
 It should copy the user's email when click on the email


Directory - mobile view
 It should open the bottom mobile panel when row is clicked
 It should redirect to the short url link when the redirect icon is clicked for active link in bottom mobile panel
 It should copy the user email when user icon clicked in the bottom mobile panel

*/
