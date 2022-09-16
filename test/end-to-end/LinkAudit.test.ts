import { Selector } from 'testcafe'
import { rootLocation, subUrl, transferEmail } from './util/config'
import {
  activeSwitch,
  closeButtonSnackBar,
  linkHistoryCreateSpan,
  linkHistoryLinkOwnerH6,
  linkHistoryLinkStatusH6,
  linkHistoryOriginalLinkH6,
  linkHistoryViewButton,
  linkTransferField,
  longUrl,
  signOutButton,
  transferButton,
  urlSaveButton,
} from './util/helpers'

import LoginProcedure from './util/LoginProcedure'
import CreateNewLink from './util/CreateNewLink'

// eslint-disable-next-line no-undef
fixture(`URL Creation`)
  .page(`${rootLocation}`)
  .beforeEach(async (t) => {
    await LoginProcedure(t)
  })

test('Creating a new url updates the link history with create change set', async (t) => {
  // Create new link
  const generatedShortLink = await CreateNewLink(t)
  const linkRow = Selector(`h6[title="${generatedShortLink}"]`)
  // Click the url in the table to open the drawer
  await t.click(linkRow)
  // Go to link history
  await t.click(linkHistoryViewButton)
  // Check if the link history span is created
  await t.expect(linkHistoryCreateSpan.exists).ok()
})

test('Disabling the link should update the link history with Link Status update change set ', async (t) => {
  // Create new link
  const generatedShortLink = await CreateNewLink(t)
  const linkRow = Selector(`h6[title="${generatedShortLink}"]`)
  // Click the url in the table to open the drawer
  await t.click(linkRow)
  // Disable the link
  await t.click(activeSwitch)
  // Go to link history
  await t.click(linkHistoryViewButton)
  // Check if the link history span is created
  await t.expect(linkHistoryLinkStatusH6.exists).ok()
})

test('Changing the original link should update the link history with Original Link update change set ', async (t) => {
  // Create new link
  const generatedShortLink = await CreateNewLink(t)
  const linkRow = Selector(`h6[title="${generatedShortLink}"]`)
  // Click the url in the table to open the drawer
  await t.click(linkRow)

  // Update the original link
  await t
    .click(longUrl)
    .pressKey('ctrl+a delete')
    .typeText(longUrl, `${subUrl}`)
    .click(urlSaveButton)
  // Go to link history
  await t.click(linkHistoryViewButton)
  // Check if the link history span is created
  await t.expect(linkHistoryOriginalLinkH6.exists).ok()
})

test('Changing the link owner should update the link history with Link Owner update change set ', async (t) => {
  // Create new link
  const generatedShortLink = await CreateNewLink(t)
  const linkRow = Selector(`h6[title="${generatedShortLink}"]`)
  // Click the url in the table to open the drawer
  await t.click(linkRow)
  // Transfer ownership of the link
  await t
    .click(linkTransferField)
    .pressKey('ctrl+a delete')
    .typeText(linkTransferField, `${transferEmail}`)
    .click(transferButton)
  // Close drawer
  await t.click(closeButtonSnackBar)
  // Sign out
  await t.click(signOutButton)
  // Login using the new link owner
  await LoginProcedure(t, transferEmail)
  // Open Drawer
  await t.click(linkRow)
  // Go to link history
  await t.click(linkHistoryViewButton)
  // Check if the link history span is created
  await t.expect(linkHistoryLinkOwnerH6.exists).ok()
})
