import { ClientFunction, Selector } from 'testcafe'

// General
export const loginButton = Selector('span').withText('Sign in')
export const signInButton = Selector('button[type="submit"]')
export const createLinkButton = Selector('span').withText('Create link')
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
export const urlTableRowText = (index: number) =>
  // eslint-disable-next-line newline-per-chained-call
  urlTable.child(index).child(0).child('p').child(1).child('span').innerText
export const urlTableRowUrl = (index: number) =>
  // eslint-disable-next-line newline-per-chained-call
  urlTable.child(index).child(0).child('p').child(1).child('span')
export const urlTableRowEmail = (index: number) =>
  urlTable.child(index).child(2).child('p')

export const searchBar = Selector('input[placeholder="Search links"]')
export const downloadLinkButton = Selector('p')
  .withText('Download links')
  .parent()
  .parent()
export const closeDrawerButton = drawer.child(2).child('main').child('button')
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
export const directoryFilterPanelButton = Selector('.MuiIconButton-label')
export const directoryFilterPanel = Selector('.MuiCollapse-wrapper')
export const sortButtonSelectedClass = 'makeStyles-sortButtonSelected-304'
export const sortButtonUnselectedClass = 'makeStyles-sortButton-303'
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
export const uncheckedButtonClass = 'makeStyles-uncheckedIcon-458'
export const checkedButtonClass = 'makeStyles-filled-459'
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
export const fileButtonStyle = linkButton.child().child()
export const activeButton = Selector('p')
  .withText('Active')
  .parent()
  .child('button')
  .nth(0)
export const activeButtonStyle = linkButton.child().child()
export const inactiveButton = Selector('p')
  .withText('Inactive')
  .parent()
  .child('button')
  .nth(1)
export const inactiveButtonStyle = linkButton.child().child()

export const copyAlert = Selector('div').withText('Email has been copied')

export const bottomMobilePanel = Selector('div.MuiDrawer-paper')
export const mobileCopyEmailIcon = Selector('input').withAttribute(
  'alt',
  'email icon',
)
// Transition Page
export const skipButton = Selector('#skip')
