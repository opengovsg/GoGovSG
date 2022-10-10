import { customAlphabet } from 'nanoid'
import { ClientFunction, Selector } from 'testcafe'
import { tagText1, tagText2, tagText3 } from './config'

// General
export const loginButton = Selector('span').withText('Sign in')
export const signInButton = Selector('button[type="submit"]')
export const createLinkButton = Selector('span').withText('Create')
export const mobileCreateLinkButton = Selector('img').withAttribute(
  'alt',
  'Create link',
)
export const loginSuccessAlert = Selector('div[role="alert"]').child(1).child(0)
export const userModal = Selector('div[aria-labelledby="userModal"]')
export const userModalCloseButton = userModal.child(0).child(0).child(1)
export const generateUrlImage = Selector('img[src="/assets/refresh-icon.svg"]')
export const shortUrlTextField = Selector(
  'input[placeholder="your customised link"]',
)
export const longUrlTextField = Selector('input[placeholder="Enter URL"]')
export const tagsAutocompleteInput = Selector('input[placeholder="Add tag"]')
export const tagsAutocompleteTags = tagsAutocompleteInput.sibling('div')
export const getLocation = ClientFunction(() => document.location.href)
export const directoryPageButton = Selector('span')
  .withText('Directory')
  .parent()
export const mobileDirectoryPageButton = Selector('img')
  .withAttribute('alt', 'Directory')
  .parent()
  .parent()
export const signOutButton = Selector('strong').withText('Sign out').parent()

// Login Page
export const emailHelperText = Selector('#email-helper-text')
export const resendOtpButton = Selector('span').withText('Resend OTP').parent()

// Search Page
export const searchTextField = Selector(
  'input[placeholder="Search all go.gov.sg links"]',
)
export const filterPanelButton = searchTextField.parent().child('button').nth(1)
export const recencyButton = Selector('p').withText('Most recent')
export const resultTable = Selector('table')

// User Page - general
export const drawer = Selector('div[role="presentation"]')
export const fileTab = Selector('p').withText('To a File')
export const uploadFile = Selector('input[type="file"]')
export const activeSwitch = Selector('input[type="checkbox"]')
export const createUrlModal = Selector('div[aria-labelledby="createUrlModal"]')
export const blacklistValidationError = Selector('div').withText(
  'ValidationError: Creation of URLs to link shortener sites prohibited.',
)
export const circularRedirectValidationError = Selector('div').withText(
  'Validation error: Circular redirects to go.gov.sg are prohibited',
)
export const successUrlCreation = Selector('div').withText(
  'Your link has been created',
)
export const urlTable = Selector('tbody')
export const urlTableRowUrlText = (index: number) =>
  // eslint-disable-next-line newline-per-chained-call
  urlTable.child(index).child(1).child('div').child(0).child('h6').innerText

export const searchBarLinksInput = Selector('input[placeholder="Search links"]')
export const searchBarTagsInput = Selector('input[placeholder="Search tags"]')
export const searchBarLinkButton = Selector('span').withExactText('Link')
export const searchBarTagButton = Selector('span').withExactText('Tag')
export const searchBarSearchByTag = Selector('p').withExactText('Search by Tag')
export const downloadLinkButton = Selector('p')
  .withText('Download links')
  .parent()
  .parent()
export const closeDrawerButton = drawer.child(2).child('main').child('button')
export const longUrl = Selector('input[placeholder="Original link"]')
export const inactiveWord = Selector('span').withText('inactive')
export const urlSaveButton = Selector('span').withText('Save').nth(0)
export const urlUpdatedSnackbar =
  Selector('.MuiSnackbar-root').withExactText('URL is updated.')
export const tagsUpdatedSnackbar =
  Selector('.MuiSnackbar-root').withExactText('Tags are updated.')
export const helperText = Selector('p').withText(
  `This doesn't look like a valid url.`,
)
export const linkTransferField = Selector(
  'input[placeholder="Email of link recipient"]',
)
export const transferButton = Selector('span').withText('Transfer')
export const tagsSaveButton = Selector('span').withText('Save').nth(1)
export const successSnackBar = Selector('.MuiSnackbar-root') // MuiSnackbarContent-message
export const closeButtonSnackBar = Selector(
  'div[class="MuiSnackbarContent-action"]',
).child('button')
export const linkErrorSnackBar = Selector('div[role="alert"]').child(1).child(0)
export const clickAway = Selector('h3')
export const largeFileError = Selector('div').withText(
  'File too large, please upload a file smaller than 10mb',
)
export const fileSubmitButton = Selector('button[type="submit"]')
export const tag1 = Selector('p').withExactText(tagText1).parent()
export const tag2 = Selector('p').withExactText(tagText2).parent()
export const tag3 = Selector('p').withExactText(tagText3).parent()
export const tagCloseButton1 = tag1.child('button')
export const tagCloseButton2 = tag2.child('button')
export const tagCloseButton3 = tag3.child('button')

// User Page - filter search
export const userFilterSortPanelButton = Selector(
  'img[alt="Filter and sort icon"]',
)
export const filterDrawer = Selector('.MuiCollapse-root').nth(0)
export const filterSortPanel = Selector('.MuiCollapse-root').nth(1)
export const userApplyButton = Selector('span').withText('Apply')
export const userResetButton = Selector('span').withText('Reset')
export const dateOfCreationButton = Selector('p').withText('Date of creation')
export const userActiveButton = Selector('p')
  .withText('Active')
  .parent()
  .child('button')
  .nth(0)
export const userInactiveButton = Selector('p')
  .withText('Active')
  .parent()
  .child('button')
  .nth(1)
export const userLinkButton = Selector('p')
  .withExactText('Link')
  .parent()
  .child('button')
  .nth(0)
export const userFileButton = Selector('p')
  .withExactText('Link')
  .parent()
  .child('button')
  .nth(1)

// Directory Page
export const directoryUrlTableRowUrl = (index: number) =>
  // eslint-disable-next-line newline-per-chained-call
  urlTable.child(index).child(0).child('p').child(1).child('span')
export const directoryUrlTableRowUrlText = (index: number) =>
  directoryUrlTableRowUrl(index).innerText
export const directoryUrlTableRowEmail = (index: number) =>
  urlTable.child(index).child(2).child('p')
export const directoryTextFieldKeyword = Selector(
  'input[placeholder="Enter a keyword"]',
)
export const toggle = Selector('span').withText('Keyword')
export const emailToggle = Selector('p').withText('Search by Email')
export const directoryTextFieldEmail = Selector(
  'input[placeholder="Enter an email or email domain e.g. @mom.gov.sg"]',
)
export const directoryFilterPanelButton = Selector('.MuiIconButton-label')
export const directoryFilterPanel = Selector('.MuiCollapse-root').nth(1)
export const sortButtonSelectedBackground = 'rgb(249, 249, 249)'
export const mostRecentFilter = Selector('p')
  .withText('Most recent')
  .parent()
  .parent()
export const mostPopularFilter = Selector('p')
  .withText('Most popular')
  .parent()
  .parent()
export const applyButton = Selector('span').withText('Apply').parent()
export const resetButton = Selector('span').withText('Reset').parent()
export const uncheckedButtonBackground = 'rgba(0, 0, 0, 0)'

export const linkButton = Selector('p')
  .withText('Link')
  .parent()
  .child('button')
  .nth(0)
export const linkButtonStyle = linkButton.child().child()
export const fileButton = Selector('p')
  .withText('File')
  .parent()
  .child('button')
  .nth(1)
export const fileButtonStyle = fileButton.child().child()
export const activeButton = Selector('p')
  .withText('Active')
  .parent()
  .child('button')
  .nth(0)
export const activeButtonStyle = activeButton.child().child()
export const inactiveButton = Selector('p')
  .withText('Inactive')
  .parent()
  .child('button')
  .nth(1)
export const inactiveButtonStyle = inactiveButton.child().child()

export const copyAlert = Selector('div').withText('Email has been copied')

export const bottomMobilePanel = Selector('div.MuiDrawer-paper')
export const mobileCopyEmailIcon = Selector('input').withAttribute(
  'alt',
  'email icon',
)
// Transition Page
export const skipButton = Selector('#skip')

// Link History
export const linkHistoryViewButton = Selector('p').withText('View Link History')
export const linkHistoryCreateSpan = Selector('span').withText(' created for ')
export const linkHistoryLinkStatusH6 = Selector('h6').withText('Link Status')
export const linkHistoryOriginalLinkH6 =
  Selector('h6').withText('Original Link')
export const linkHistoryLinkOwnerH6 = Selector('h6').withText('Link Owner')
export const linkHistoryTagsH6 = Selector('h6').withText('Tags')

// Helper Functions
export function generateRandomString(length: number): string {
  const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'
  return customAlphabet(ALPHABET, length)()
}
