import { expect, Page } from '@playwright/test'
import { shortUrl, tagText1 } from './config'
import {
  createUrlModal,
  generateUrlImage,
  longUrlTextField,
  openCreateLinkModal,
  shortUrlTextField,
  tagsAutocompleteInput,
} from './helpers'
import { firstLinkHandle } from './FirstLinkHandle'

export async function createNewLink(page: Page): Promise<string> {
  // The create url modal opens when the "Create link" button is clicked.
  await openCreateLinkModal(page)
  await expect(createUrlModal(page)).toBeVisible()

  // It should populate the short url input box on the create url modal with a random string when the refresh icon on the short url input box is pressed
  await generateUrlImage(page).click()
  await expect(shortUrlTextField(page)).not.toHaveValue('')

  // Add tags to the tags autocomplete field
  await tagsAutocompleteInput(page).fill(tagText1)
  await tagsAutocompleteInput(page).press('Enter')

  const generatedUrl = await shortUrlTextField(page).inputValue()

  await longUrlTextField(page).fill(shortUrl)

  // Presses the create link
  await firstLinkHandle(page)

  return generatedUrl
}

export default createNewLink
