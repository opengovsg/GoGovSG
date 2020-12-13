import { ClientFunction } from 'testcafe'
import { rootLocation, shortUrl } from './util/config'
import {
  createLinkButton,
  generateUrlImage,
  longUrlTextField,
  shortUrlTextField,
  skipButton,
} from './util/helpers'
import LoginProcedure from './util/LoginProcedure'
import firstLinkHandle from './util/FirstLinkHandle'

const getLocation = ClientFunction(() => document.location.href)

// eslint-disable-next-line no-undef
fixture(`Transition Page`)
  .page(`${rootLocation}`)
  .beforeEach(async (t) => {
    await LoginProcedure(t)
  })

test('Transition Page test.', async (t) => {
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  const generatedUrlActive = await shortUrlTextField.value

  await t
    .typeText(shortUrlTextField, '-redirect')
    .typeText(longUrlTextField, `${shortUrl}`)

  await firstLinkHandle(t)

  await t.wait(3000)

  // Accessing a short link with a trailing slash should not result in a broken transition page.
  await t.navigateTo(`${rootLocation}/${generatedUrlActive}-redirect/`)

  // Accessing a short link for the first time shows the transition page.
  await t.expect(getLocation()).contains(`${generatedUrlActive}-redirect`)

  // skip button is shown.
  await t.expect(skipButton.getStyleProperty('opacity')).eql('1')

  // After 6 seconds, user is redirected from the transition page to the correct destination long url.
  await t.wait(6000).expect(getLocation()).contains(`${shortUrl}`)

  // Visiting the same short link again does not show the transition page.
  await t
    .navigateTo(`${rootLocation}/${generatedUrlActive}-redirect/`)
    .expect(getLocation())
    .contains(`${shortUrl}`)
})
