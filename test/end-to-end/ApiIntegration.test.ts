import LoginProcedure from './util/LoginProcedure'
import { rootLocation } from './util/config'
import {
  apiIntegrationPageButton,
  copyButton,
  generateApiKeyButton,
  getLocation,
  iHaveCopiedButton,
  regenerateApiKeyButton,
} from './util/helpers'

// eslint-disable-next-line no-undef
fixture('Api Integration')
  .page(`${rootLocation}`)
  .beforeEach(async (t) => {
    const email = `${Date.now().toString()}@open.gov.sg`
    await LoginProcedure(t, email)
  })

test('No API Key view', async (t) => {
  await t
    .click(apiIntegrationPageButton)
    .expect(getLocation())
    .match(/apiintegration/)

  await t
    .expect(generateApiKeyButton.exists)
    .ok()
    .expect(regenerateApiKeyButton.exists)
    .notOk()
})

test('API Key view', async (t) => {
  await t
    .click(apiIntegrationPageButton)
    .click(generateApiKeyButton)
    .expect(regenerateApiKeyButton.exists)
    .ok()
})

test('Save API Key modal after clicking generate API button', async (t) => {
  await t
    .click(apiIntegrationPageButton)
    .click(generateApiKeyButton)
    .expect(iHaveCopiedButton.exists)
    .ok()
    .expect(copyButton.exists)
    .ok()
    .click(iHaveCopiedButton)
    .expect(iHaveCopiedButton.exists)
    .notOk()
    .expect(copyButton.exists)
    .notOk()
})

test('Save API Key modal after clicking Regenerate API button', async (t) => {
  await t
    .click(apiIntegrationPageButton)
    .click(generateApiKeyButton)
    .click(iHaveCopiedButton)
    .click(regenerateApiKeyButton)
    .expect(iHaveCopiedButton.exists)
    .ok()
    .expect(copyButton.exists)
    .ok()
    .click(iHaveCopiedButton)
    .expect(iHaveCopiedButton.exists)
    .notOk()
    .expect(copyButton.exists)
    .notOk()
})
