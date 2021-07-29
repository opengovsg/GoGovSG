import { ClientFunction, Selector } from 'testcafe'

// General
export const loginButton = Selector('span').withText('Sign in')
export const signInButton = Selector('button[type="submit"]')
export const createLinkButton = Selector('span').withText('Create link')
export const loginSuccessAlert = Selector('div[role="alert"]').child(1).child(0)
export const userModal = Selector('div[aria-labelledby="userModal"]')
export const userModalCloseButton = userModal.child(0).child(0).child(1)
export const generateUrlImage = Selector('img[src="/assets/refresh-icon.svg"]')
export const shortUrlTextField = Selector(
  'input[placeholder="your customised link"]',
)
export const longUrlTextField = Selector('input[placeholder="Enter URL"]')
export const getLocation = ClientFunction(() => document.location.href)
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
export const fileTab = Selector('p').withText('From file')
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
export const searchBar = Selector('input[placeholder="Search links"]')
export const downloadLinkButton = Selector('p')
  .withText('Download links')
  .parent()
  .parent()
export const longUrl = Selector('input[placeholder="Original link"]')
export const inactiveWord = Selector('span').withText('inactive')
export const urlSaveButton = Selector('span').withText('Save')
export const urlUpdatedToaster = Selector('div').withText('URL is updated.')
export const helperText = Selector('p').withText(
  `This doesn't look like a valid url.`,
)
export const linkTransferField = Selector(
  'input[placeholder="Email of link recipient"]',
)
export const transferButton = Selector('span').withText('Transfer')
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

// User Page - filter search
export const userFilterPanelButton = Selector('img[alt="Filter and sort icon"]')
export const filterPanel = Selector('.MuiCollapse-root')
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
  .withText('Link')
  .parent()
  .child('button')
  .nth(0)
export const userFileButton = Selector('p')
  .withText('Link')
  .parent()
  .child('button')
  .nth(1)

// Directory Page
export const directoryTextFieldKeyword = Selector(
  'input[placeholder="Enter a keyword"]',
)
export const toggle = Selector('span').withText('Keyword')
export const emailToggle = Selector('p').withText('Search by Email')
export const directoryTextFieldEmail = Selector(
  'input[placeholder="Enter an email or email domain e.g. @mom.gov.sg"]',
)
export const applyButton = Selector('span').withText('Apply').parent()
export const resetButton = Selector('span').withText('Reset').parent()
export const linkButton = Selector('p')
  .withText('Link')
  .parent()
  .child('button')
  .nth(0)
export const fileButton = Selector('p')
  .withText('File')
  .parent()
  .child('button')
  .nth(1)
export const activeButton = Selector('p')
  .withText('Active')
  .parent()
  .child('button')
  .nth(0)
export const inactiveButton = Selector('p')
  .withText('Inactive')
  .parent()
  .child('button')
  .nth(1)
export const copyAlert = Selector('div').withText('Email has been copied')

// Transition Page
export const skipButton = Selector('#skip')
