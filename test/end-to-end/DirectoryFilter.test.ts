import { rootLocation, testEmail } from './util/config'
import {
  clickAway,
  directoryFilterPanel,
  directoryFilterPanelButton,
  directoryPageButton,
  directoryTextFieldEmail,
  directoryTextFieldKeyword,
  emailToggle,
  getLocation,
  toggle,
  urlTable,
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

test('Directory Page test on filter search`', async (t) => {
  const { generatedUrlFile, generatedUrlInactive, generatedUrlActive } =
    t.fixtureCtx.createdLinks

  // Clicking on the directory page button brings user to directory page
  await t
    .click(directoryPageButton)
    .expect(getLocation())
    .match(/directory/)

  // // search by keyword
  await t
    .typeText(directoryTextFieldKeyword, `${generatedUrlFile}`)
    .expect(
      // eslint-disable-next-line newline-per-chained-call
      urlTable.child(0).child(0).child('p').child(1).child('span').innerText,
    )
    .eql(`/${generatedUrlFile}`)

  // // search by email
  await t
    .click(toggle)
    .click(emailToggle)
    .typeText(directoryTextFieldEmail, testEmail)
    .expect(urlTable.child(0).child(2).child('p').innerText)
    .eql(testEmail)

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
})
