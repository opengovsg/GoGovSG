import { ClientFunction } from 'testcafe'
import { getRootLocation } from './util/config'
import {
  createLinkButton,
  generateUrlImage,
  longUrlTextField,
  shortUrlTextField,
  skipButton,
} from './util/helpers'
import LoginProcedure from './util/Login-Procedure'

const location = getRootLocation()
const getLocation = ClientFunction(() => document.location.href)

// eslint-disable-next-line no-undef
fixture(`Transition Page`)
  .page(`${location}`)
  .beforeEach(async (t) => {
    await LoginProcedure(t)
  })

test('Transition Page test.', async (t) => {
  await t.click(createLinkButton.nth(0)).click(generateUrlImage)

  const generatedUrlActive = await shortUrlTextField.value

  await t
    .typeText(shortUrlTextField, '-redirect')
    .typeText(longUrlTextField, 'google.com')

  // if it is the first link to be created, need to click on index 1 button
  if (await createLinkButton.nth(2).exists) {
    await t.click(createLinkButton.nth(2))
  } else {
    await t.click(createLinkButton.nth(1))
  }

  await t.wait(3000)

  // Accessing a short link with a trailing slash should not result in a broken transition page.
  console.log(`${location}/${generatedUrlActive}-redirect/`)
  await t.navigateTo(`${location}/${generatedUrlActive}-redirect/`)

  // Accessing a short link for the first time shows the transition page.
  await t.expect(getLocation()).contains(`${generatedUrlActive}-redirect`)

  // skip button is shown.
  await t.expect(skipButton.getStyleProperty('opacity')).eql('1')

  // After 6 seconds, user is redirected from the transition page to the correct destination long url.
  await t.wait(6000).expect(getLocation()).contains('google.com')

  // Visiting the same short link again does not show the transition page.
  await t
    .navigateTo(`${location}/${generatedUrlActive}-redirect/`)
    .expect(getLocation())
    .contains('google.com')
})
