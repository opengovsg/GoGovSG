import { Page, Locator } from '@playwright/test'
import { customAlphabet } from 'nanoid'
import { tagText1, tagText2, tagText3 } from './config'

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Matches Playwright's `hasText` filter against the FULL trimmed text content,
// mirroring testcafe's `.withExactText()` (hasText alone does substring match).
export const exactText = (value: string): RegExp =>
  new RegExp(`^${escapeRegExp(value)}$`)

// General
// Scoped to .MuiButton-label: a bare `span` with text 'Sign in' also matches
// the "Are you a public officer? Sign in" caption link next to this button.
export const loginButton = (page: Page): Locator =>
  page.locator('.MuiButton-label', { hasText: 'Sign in' })
export const signInButton = (page: Page): Locator =>
  page.locator('button[type="submit"]')
export const createLinkButton = (page: Page): Locator =>
  page.locator('span', { hasText: 'Create' })
export const mobileCreateLinkButton = (page: Page): Locator =>
  page.locator('img[alt="Create link"]')
export const loginSuccessAlert = (page: Page): Locator =>
  page
    .locator('div[role="alert"]')
    .locator('xpath=./*')
    .nth(1)
    .locator('xpath=./*')
    .nth(0)
export const userModal = (page: Page): Locator =>
  page.locator('div[aria-labelledby="userModal"]')
export const userModalCloseButton = (page: Page): Locator =>
  userModal(page)
    .locator('xpath=./*')
    .nth(0)
    .locator('xpath=./*')
    .nth(0)
    .locator('xpath=./*')
    .nth(1)
export const generateUrlImage = (page: Page): Locator =>
  page.locator('img[src="/assets/refresh-icon.svg"]')
export const shortUrlTextField = (page: Page): Locator =>
  page.locator('input[placeholder="your customised link"]')
export const longUrlTextField = (page: Page): Locator =>
  page.locator('input[placeholder="Enter URL"]')
export const tagsAutocompleteInput = (page: Page): Locator =>
  page.locator('input[placeholder="Add tag"]')
export const tagsAutocompleteTags = (page: Page): Locator =>
  tagsAutocompleteInput(page).locator('xpath=following-sibling::div')
export const directoryPageButton = (page: Page): Locator =>
  page.locator('span', { hasText: 'Directory' }).locator('xpath=..')
export const mobileDirectoryPageButton = (page: Page): Locator =>
  page.locator('img[alt="Directory"]').locator('xpath=..').locator('xpath=..')
export const apiIntegrationPageButton = (page: Page): Locator =>
  page.locator('span', { hasText: 'API Integration' }).locator('xpath=..')
export const signOutButton = (page: Page): Locator =>
  page.locator('strong', { hasText: 'Sign out' }).locator('xpath=..')

// Login Page
export const emailHelperText = (page: Page): Locator =>
  page.locator('#email-helper-text')
export const resendOtpButton = (page: Page): Locator =>
  page.locator('span', { hasText: 'Resend OTP' }).locator('xpath=..')

// Search Page
export const searchTextField = (page: Page): Locator =>
  page.locator('input[placeholder="Search all go.gov.sg links"]')
export const filterPanelButton = (page: Page): Locator =>
  searchTextField(page).locator('xpath=..').locator('xpath=./button').nth(1)
export const recencyButton = (page: Page): Locator =>
  page.locator('p', { hasText: 'Most recent' })
export const resultTable = (page: Page): Locator => page.locator('table')

// User Page - general
export const linkCountHeaderText = (page: Page): Promise<string> =>
  page.locator('h3', { hasText: 'links' }).innerText()
// Prefer MuiDrawer-root over bare [role=presentation]: a tags autocomplete
// popover also uses role=presentation and collides under strict mode.
export const drawer = (page: Page): Locator =>
  page.locator('div.MuiDrawer-root[role="presentation"]')
export const fileTab = (page: Page): Locator =>
  page.locator('p', { hasText: 'To a File' })
export const bulkTab = (page: Page): Locator =>
  page.locator('p', { hasText: 'From a .csv' })
export const uploadFile = (page: Page): Locator =>
  page.locator('input[type="file"]')
export const activeSwitch = (page: Page): Locator =>
  page.locator('input[type="checkbox"]')
export const createUrlModal = (page: Page): Locator =>
  page.locator('div[aria-labelledby="createUrlModal"]')

// Snackbar text lives in nested divs; bare `div` + hasText matches ancestors
// (#root, .MuiSnackbar-root, [role=alert], message) and trips strict mode.
export const blacklistValidationError = (page: Page): Locator =>
  page.locator('[role="alert"]', {
    hasText:
      'ValidationError: Creation of URLs to link shortener sites are not allowed.',
  })
export const circularRedirectValidationError = (page: Page): Locator =>
  page.locator('[role="alert"]', {
    hasText: 'ValidationError: Circular redirects are not allowed.',
  })
export const successUrlCreation = (page: Page): Locator =>
  page.locator('[role="alert"]', { hasText: 'Your link has been created' })
export const maliciousFileCreation = (page: Page): Locator =>
  page.locator('[role="alert"]', { hasText: 'File is likely to be malicious.' })
export const successBulkCreation = (page: Page): Locator =>
  page.locator('[role="alert"]', { hasText: 'links have been created' })

// Unavailable Short Link Page
export const unavailableShortLink = (page: Page): Locator =>
  page.locator('h3', { hasText: 'This short link is not available.' })

export const urlTable = (page: Page): Locator => page.locator('tbody')
export const urlTableRowUrlText = (
  page: Page,
  index: number,
): Promise<string> =>
  urlTable(page)
    .locator('xpath=./*')
    .nth(index)
    .locator('xpath=./*')
    .nth(1)
    .locator('xpath=./div')
    .locator('xpath=./*')
    .nth(0)
    .locator('xpath=./h6')
    .innerText()
export const urlTableRow = (page: Page, index: number): Locator =>
  urlTable(page)
    .locator('xpath=./*')
    .nth(index)
    .locator('xpath=./*')
    .nth(1)
    .locator('xpath=./div')
    .locator('xpath=./*')
    .nth(0)
    .locator('xpath=./h6')

// Prefer text over h6[title]: MUI Tooltip strips the native title attribute while open.
export const linkRowByShortUrl = (page: Page, shortUrl: string): Locator =>
  page.locator('h6', { hasText: exactText(`/${shortUrl}`) })

export const urlTableRowShortUrlText = (row: Locator): Promise<string | null> =>
  // eslint-disable-next-line eslint-js/newline-per-chained-call
  row.locator('td').nth(1).locator('div').nth(1).textContent()

export const urlTableOriginalUrlText = (row: Locator): Promise<string | null> =>
  // eslint-disable-next-line eslint-js/newline-per-chained-call
  row.locator('td').nth(1).locator('div').nth(2).textContent()

export const urlTableTagsTextContent = async (
  row: Locator,
): Promise<string> => {
  let returnString = ''
  const numTags = await row
    .locator('td')
    .nth(1)
    .locator('div')
    .nth(3)
    .locator('button')
    .count()
  /* eslint-disable no-await-in-loop */
  for (let tagsCount = 0; tagsCount < numTags - 1; tagsCount += 1) {
    returnString += `${await row
      .locator('td')
      .nth(1)
      .locator('div')
      .nth(3)
      .locator('button')
      .nth(tagsCount)
      .textContent()};`
  }
  returnString += (await row
    .locator('td')
    .nth(1)
    .locator('div')
    .nth(3)
    .locator('button')
    .nth(numTags - 1)
    .textContent()) as string
  /* eslint-enable no-await-in-loop */
  return returnString
}

export const searchBarLinksInput = (page: Page): Locator =>
  page.locator('input[placeholder="Search links"]')
export const searchBarTagsInput = (page: Page): Locator =>
  page.locator('input[placeholder="Search tags"]')
// Scope to the search input's own toggle button. A bare `span` + exact 'Link'
// matches both MUI's .MuiButton-label wrapper and the inner label span.
export const searchBarLinkButton = (page: Page): Locator =>
  page
    .locator('.MuiInputBase-root')
    .filter({ has: page.locator('input[placeholder="Search links"]') })
    .locator('button')
    .first()
export const searchBarTagButton = (page: Page): Locator =>
  page
    .locator('.MuiInputBase-root')
    .filter({ has: page.locator('input[placeholder="Search tags"]') })
    .locator('button')
    .first()
export const searchBarSearchByTag = (page: Page): Locator =>
  page.locator('p', { hasText: exactText('Search by Tag') })
export const downloadLinkButton = (page: Page): Locator =>
  page
    .locator('p', { hasText: 'Download links' })
    .locator('xpath=..')
    .locator('xpath=..')
export const closeDrawerButton = (page: Page): Locator =>
  drawer(page)
    .locator('xpath=./*')
    .nth(2)
    .locator('xpath=./main')
    .locator('xpath=./button')
export const longUrl = (page: Page): Locator =>
  page.locator('input[placeholder="Original link"]')
export const inactiveWord = (page: Page): Locator =>
  page.locator('span', { hasText: 'inactive' })
export const urlSaveButton = (page: Page): Locator =>
  page.locator('span', { hasText: 'Save' }).nth(0)
export const urlUpdatedSnackbar = (page: Page): Locator =>
  page.locator('.MuiSnackbar-root', { hasText: exactText('URL is updated.') })
export const tagsUpdatedSnackbar = (page: Page): Locator =>
  page.locator('.MuiSnackbar-root', {
    hasText: exactText('Tags are updated.'),
  })
export const helperText = (page: Page): Locator =>
  page.locator('p', { hasText: `This doesn't look like a valid url.` })
export const linkTransferField = (page: Page): Locator =>
  page.locator('input[placeholder="Email of link recipient"]')
export const transferButton = (page: Page): Locator =>
  page.locator('span', { hasText: 'Transfer' })
export const tagsSaveButton = (page: Page): Locator =>
  page.locator('span', { hasText: 'Save' }).nth(1)
export const successSnackBar = (page: Page): Locator =>
  page.locator('.MuiSnackbar-root')
export const closeButtonSnackBar = (page: Page): Locator =>
  page
    .locator('div[class="MuiSnackbarContent-action"]')
    .locator('xpath=./button')
export const linkErrorSnackBar = (page: Page): Locator =>
  page
    .locator('div[role="alert"]')
    .locator('xpath=./*')
    .nth(1)
    .locator('xpath=./*')
    .nth(0)
// Click the user-page link-count heading (outside the drawer) to dismiss
// overlays. A bare `h3` also matches drawer titles under strict mode.
export const clickAway = (page: Page): Locator =>
  page.locator('h3', { hasText: /\d+\s+links?/ })
export const largeFileError = (page: Page): Locator =>
  page.getByText('File too large, please upload a file smaller than 20mb')
export const csvOnlyError = (page: Page): Locator =>
  page.locator('[role="alert"]', { hasText: 'Only csv files are allowed' })
export const fileSubmitButton = (page: Page): Locator =>
  page.locator('button[type="submit"]')
export const tag1 = (page: Page): Locator =>
  page.locator('p', { hasText: exactText(tagText1) }).locator('xpath=..')
export const tag2 = (page: Page): Locator =>
  page.locator('p', { hasText: exactText(tagText2) }).locator('xpath=..')
export const tag3 = (page: Page): Locator =>
  page.locator('p', { hasText: exactText(tagText3) }).locator('xpath=..')
export const tagCloseButton1 = (page: Page): Locator =>
  tag1(page).locator('xpath=./button')
export const tagCloseButton2 = (page: Page): Locator =>
  tag2(page).locator('xpath=./button')
export const tagCloseButton3 = (page: Page): Locator =>
  tag3(page).locator('xpath=./button')
export const noResultsFoundText = (page: Page): Locator =>
  page.locator('p', {
    hasText: exactText('No results found, try expanding your search terms.'),
  })

// User Page - filter search
export const userFilterSortPanelButton = (page: Page): Locator =>
  page.locator('img[alt="Filter and sort icon"]')
export const filterDrawer = (page: Page): Locator =>
  page.locator('.MuiCollapse-root').nth(0)
export const filterSortPanel = (page: Page): Locator =>
  page.locator('.MuiCollapse-root').nth(1)
export const userApplyButton = (page: Page): Locator =>
  page.locator('span', { hasText: 'Apply' })
export const userResetButton = (page: Page): Locator =>
  page.locator('span', { hasText: 'Reset' })
export const dateOfCreationButton = (page: Page): Locator =>
  page.locator('p', { hasText: 'Date of creation' })
export const mostNumberOfVisitsButton = (page: Page): Locator =>
  page.locator('p', { hasText: 'Most number of visits' })
export const userActiveButton = (page: Page): Locator =>
  page
    .locator('p', { hasText: 'Active' })
    .locator('xpath=..')
    .locator('xpath=./button')
    .nth(0)
export const userInactiveButton = (page: Page): Locator =>
  page
    .locator('p', { hasText: 'Active' })
    .locator('xpath=..')
    .locator('xpath=./button')
    .nth(1)
export const userLinkButton = (page: Page): Locator =>
  page
    .locator('p', { hasText: exactText('Link') })
    .locator('xpath=..')
    .locator('xpath=./button')
    .nth(0)
// NOTE: matches the original testcafe suite's selector verbatim (it also
// matches on 'Link' text, not 'File') -- preserved as-is, not a new bug.
export const userFileButton = (page: Page): Locator =>
  page
    .locator('p', { hasText: exactText('Link') })
    .locator('xpath=..')
    .locator('xpath=./button')
    .nth(1)

// Directory Page
export const directoryUrlTableRowUrl = (page: Page, index: number): Locator =>
  urlTable(page)
    .locator('xpath=./*')
    .nth(index)
    .locator('xpath=./*')
    .nth(0)
    .locator('xpath=./p')
    .locator('xpath=./*')
    .nth(1)
    .locator('xpath=./span')
export const directoryUrlTableRowUrlText = (
  page: Page,
  index: number,
): Promise<string> => directoryUrlTableRowUrl(page, index).innerText()
export const directoryUrlTableRowEmail = (page: Page, index: number): Locator =>
  urlTable(page)
    .locator('xpath=./*')
    .nth(index)
    .locator('xpath=./*')
    .nth(2)
    .locator('xpath=./p')
export const directoryTextFieldKeyword = (page: Page): Locator =>
  page.locator('input[placeholder="Enter a keyword"]')
export const toggle = (page: Page): Locator =>
  page.locator('span', { hasText: 'Keyword' })
export const emailToggle = (page: Page): Locator =>
  page.locator('p', { hasText: 'Search by Email' })
export const directoryTextFieldEmail = (page: Page): Locator =>
  page.locator(
    'input[placeholder="Enter an email or email domain e.g. @mom.gov.sg"]',
  )
export const directoryFilterPanelButton = (page: Page): Locator =>
  page.locator('.MuiIconButton-label')
export const directoryFilterPanel = (page: Page): Locator =>
  page.locator('.MuiCollapse-root').nth(1)
export const sortButtonSelectedBackground = 'rgb(249, 249, 249)'
export const mostRecentFilter = (page: Page): Locator =>
  page
    .locator('p', { hasText: 'Most recent' })
    .locator('xpath=..')
    .locator('xpath=..')
export const mostPopularFilter = (page: Page): Locator =>
  page
    .locator('p', { hasText: 'Most popular' })
    .locator('xpath=..')
    .locator('xpath=..')
export const applyButton = (page: Page): Locator =>
  page.locator('span', { hasText: 'Apply' }).locator('xpath=..')
export const resetButton = (page: Page): Locator =>
  page.locator('span', { hasText: 'Reset' }).locator('xpath=..')
export const uncheckedButtonBackground = 'rgba(0, 0, 0, 0)'

export const linkButton = (page: Page): Locator =>
  page
    .locator('p', { hasText: 'Link' })
    .locator('xpath=..')
    .locator('xpath=./button')
    .nth(0)
export const linkButtonStyle = (page: Page): Locator =>
  // eslint-disable-next-line eslint-js/newline-per-chained-call
  linkButton(page).locator('xpath=./*').first().locator('xpath=./*').first()
export const fileButton = (page: Page): Locator =>
  page
    .locator('p', { hasText: 'File' })
    .locator('xpath=..')
    .locator('xpath=./button')
    .nth(1)
export const fileButtonStyle = (page: Page): Locator =>
  // eslint-disable-next-line eslint-js/newline-per-chained-call
  fileButton(page).locator('xpath=./*').first().locator('xpath=./*').first()
export const activeButton = (page: Page): Locator =>
  page
    .locator('p', { hasText: 'Active' })
    .locator('xpath=..')
    .locator('xpath=./button')
    .nth(0)
export const activeButtonStyle = (page: Page): Locator =>
  // eslint-disable-next-line eslint-js/newline-per-chained-call
  activeButton(page).locator('xpath=./*').first().locator('xpath=./*').first()
export const inactiveButton = (page: Page): Locator =>
  page
    .locator('p', { hasText: 'Inactive' })
    .locator('xpath=..')
    .locator('xpath=./button')
    .nth(1)
export const inactiveButtonStyle = (page: Page): Locator =>
  // eslint-disable-next-line eslint-js/newline-per-chained-call
  inactiveButton(page).locator('xpath=./*').first().locator('xpath=./*').first()

export const copyAlert = (page: Page): Locator =>
  page.locator('[role="alert"]', { hasText: 'Email has been copied' })

export const bottomMobilePanel = (page: Page): Locator =>
  page.locator('div.MuiDrawer-paper')
export const mobileCopyEmailIcon = (page: Page): Locator =>
  page.locator('input[alt="email icon"]')
// Transition Page
export const skipButton = (page: Page): Locator => page.locator('#skip')

// Link History
export const linkHistoryViewButton = (page: Page): Locator =>
  page.locator('p', { hasText: 'View Link History' })
export const linkHistoryCreateSpan = (page: Page): Locator =>
  page.locator('span', { hasText: ' created for ' })
export const linkHistoryLinkStatusH6 = (page: Page): Locator =>
  page.locator('h6', { hasText: 'Link Status' })
export const linkHistoryOriginalLinkH6 = (page: Page): Locator =>
  page.locator('h6', { hasText: 'Original Link' })
export const linkHistoryLinkOwnerH6 = (page: Page): Locator =>
  page.locator('h6', { hasText: 'Link Owner' })
export const linkHistoryTagsH6 = (page: Page): Locator =>
  page.locator('h6', { hasText: 'Tags' })

// API Integration
export const generateApiKeyButton = (page: Page): Locator =>
  page
    .locator('img[alt="generate api key"]')
    .locator('xpath=..')
    .locator('xpath=..')
export const regenerateApiKeyButton = (page: Page): Locator =>
  page.locator('img[alt="Regenerate"]').locator('xpath=..').locator('xpath=..')
export const iHaveCopiedButton = (page: Page): Locator =>
  page.locator('span', { hasText: 'Yes, I have copied' }).locator('xpath=..')
export const copyButton = (page: Page): Locator =>
  page
    .locator('span', { hasText: 'Yes, I have copied' })
    .locator('xpath=..')
    .locator('xpath=..')
    .locator('xpath=./div')
    .nth(0)
    .locator('xpath=./div')
    .nth(0)
    .locator('xpath=./button')
    .nth(0)

// Helper Functions
export function generateRandomString(length: number): string {
  const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'
  return customAlphabet(ALPHABET, length)()
}

export async function getLinkCount(page: Page): Promise<number> {
  const currLinkCountHeaderText = await linkCountHeaderText(page)
  // currLinkCountHeaderText is a string with format "<numOfLinks> links"
  return parseInt(currLinkCountHeaderText.split(' ')[0], 10)
}
