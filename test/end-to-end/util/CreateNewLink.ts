import { Selector } from 'testcafe'
import { rootLocation, shortUrl } from './config'
import {
  createLinkButton,
  createUrlModal,
  generateUrlImage,
  longUrlTextField,
  shortUrlTextField,
} from './helpers'

import firstLinkHandle from './FirstLinkHandle'

const CreateNewLink = async (t) => {
  // The create url modal opens when the "Create link" button is clicked.
  await t.click(createLinkButton.nth(0)).expect(createUrlModal.exists).ok()

  // It should populate the short url input box on the create url modal with a random string when the refresh icon on the short url input box is pressed
  await t.click(generateUrlImage).expect(shortUrlTextField.value).notEql('')

  const generatedUrl = await shortUrlTextField.value

  await t
    .click(longUrlTextField)
    .pressKey('ctrl+a delete')
    .typeText(longUrlTextField, `${shortUrl}`)

  // Presses the create link
  await firstLinkHandle(t)

  return generatedUrl
}

export default CreateNewLink
