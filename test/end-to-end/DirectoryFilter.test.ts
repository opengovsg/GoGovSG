import { rootLocation, testEmail } from './util/config'
import {
  activeButtonStyle,
  clickAway,
  directoryFilterPanel,
  directoryFilterPanelButton,
  directoryPageButton,
  directoryTextFieldEmail,
  directoryTextFieldKeyword,
  emailToggle,
  fileButtonStyle,
  getLocation,
  inactiveButtonStyle,
  linkButtonStyle,
  mostPopularFilter,
  mostRecentFilter,
  toggle,
  urlTable,
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

test('Populate with links', async (t) => {
  const createdLinks = await linkCreationProcedure(t)
  // eslint-disable-next-line no-param-reassign
  t.fixtureCtx.createdLinks = createdLinks
})

// eslint-disable-next-line jest/no-disabled-tests
test.skip('Default settings', async (t) => {
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
    .expect(linkButtonStyle.hasClass('makeStyles-uncheckedIcon-458'))
    .ok()
    .expect(fileButtonStyle.hasClass('makeStyles-uncheckedIcon-458'))
    .ok()
    .expect(activeButtonStyle.hasClass('makeStyles-uncheckedIcon-458'))
    .ok()
    .expect(inactiveButtonStyle.hasClass('makeStyles-uncheckedIcon-458'))
    .ok()
    .expect(mostPopularFilter.hasClass('makeStyles-sortButton-303'))
    .ok()
    .expect(mostRecentFilter.hasClass('makeStyles-sortButtonSelected-304'))
    .ok()
})

// eslint-disable-next-line jest/no-disabled-tests
test.skip('Directory Page test search by keyword and email', async (t) => {
  const { generatedUrlFile } = t.fixtureCtx.createdLinks

  // Clicking on the directory page button brings user to directory page
  await t.click(directoryPageButton)

  // search by keyword
  await t
    .typeText(directoryTextFieldKeyword, `${generatedUrlFile}`)
    .expect(
      // eslint-disable-next-line newline-per-chained-call
      urlTable.child(0).child(0).child('p').child(1).child('span').innerText,
    )
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
    .expect(
      // eslint-disable-next-line newline-per-chained-call
      urlTable.child(0).child(0).child('p').child(1).child('span').innerText,
    )
    .eql(`/${generatedUrlFile}`)
    // second row
    .expect(
      // eslint-disable-next-line newline-per-chained-call
      urlTable.child(1).child(0).child('p').child(1).child('span').innerText,
    )
    .eql(`/${generatedUrlInactive}`)
    // third row
    .expect(
      // eslint-disable-next-line newline-per-chained-call
      urlTable.child(2).child(0).child('p').child(1).child('span').innerText,
    )
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
    .expect(
      // eslint-disable-next-line newline-per-chained-call
      urlTable.child(0).child(0).child('p').child(1).child('span').innerText,
    )
    .eql(`/${generatedUrlMostPopular}`)
    // second row
    .expect(
      // eslint-disable-next-line newline-per-chained-call
      urlTable.child(1).child(0).child('p').child(1).child('span').innerText,
    )
    .eql(`/${generatedUrlSecondMostPopular}`)
})
