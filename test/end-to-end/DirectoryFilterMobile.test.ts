import { rootLocation } from './util/config'
import {
  bottomMobilePanel,
  copyAlert,
  directoryTextFieldKeyword,
  directoryUrlTableRowUrl,
  directoryUrlTableRowUrlText,
  mobileCopyEmailIcon,
  mobileDirectoryPageButton,
} from './util/helpers'
import { singleLinkCreationProcedure } from './util/LinkCreationProcedure'
import LoginProcedure from './util/LoginProcedure'

// eslint-disable-next-line no-undef
fixture(`Directory Filter Mobile view`)
  .page(`${rootLocation}`)
  .beforeEach(async (t) => {
    await LoginProcedure(t)
    await t.resizeWindow(400, 600)
  })

test('Populate with links', async (t) => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const createdLinks = await singleLinkCreationProcedure(t)
  // eslint-disable-next-line no-param-reassign
  t.fixtureCtx.createdLinks = createdLinks
})

test('Directory Page test url row interactions', async (t) => {
  const { generatedUrlActive } = t.fixtureCtx.createdLinks

  await t
    .click(mobileDirectoryPageButton)
    // search by url
    .typeText(directoryTextFieldKeyword, generatedUrlActive)
    // first row
    .expect(directoryUrlTableRowUrlText(0))
    .eql(`/${generatedUrlActive}`)
    // test bottom panel appears
    .expect(bottomMobilePanel.exists)
    .notOk()
    .click(directoryUrlTableRowUrl(0))
    .expect(bottomMobilePanel.exists)
    .ok()
    // copy email
    .setNativeDialogHandler(() => true)
    .click(mobileCopyEmailIcon)
    // Testcafe does not have any inbuilt clipboard
    .expect(copyAlert.visible)
    .ok()
})
