// import { Selector } from 'testcafe'
// import { getOtp, getLocation, testEmail, getURL } from './config'
// import {
//   loginButton,
//   signInButton,
//   createLinkButton,
//   loginSuccessAlert,
//   userModal,
//   userModalCloseButton,
//   generateUrlImage,
//   shortUrlTextField,
//   longUrlTextField,
//   drawer,
//   fileTab,
//   uploadFile,
//   activeSwitch,
//   resultTable,
//   recencyButton,
//   directoryTextFieldKeyword,
//   toggle,
//   emailToggle,
//   directoryTextFieldEmail,
//   applyButton,
//   resetButton,
//   linkButton,
//   fileButton,
//   activeButton,
//   inactiveButton,
//   copyAlert,
// } from './util/helpers'

// const location = getLocation()

// fixture(`Directory Page `).page(`${location}`)

// test('Directory Page test.', async (t) => {
//   await t
//     // Login Procedure
//     .click(loginButton)
//     .typeText('#email', `${testEmail}`)
//     .click(signInButton.nth(0))
//     .wait(5000)

//   const otp = await getOtp()

//   await t
//     .typeText('#otp', otp)
//     .click(signInButton.nth(1))
//     .click(loginSuccessAlert)

//   // Close announcement modal
//   if (await userModal.exists) {
//     await t.click(userModalCloseButton)
//   }

//   // create link procedure - generate short url - 1
//   await t.click(createLinkButton.nth(0)).click(generateUrlImage)

//   // Save short url 1 - active link
//   const generatedUrlActive = await shortUrlTextField.value

//   // create link procedure - proceed to create the link
//   await t
//     .typeText(shortUrlTextField, '-directory')
//     .typeText(longUrlTextField, 'google.com')

//   // if it is the first link to be created, need to click on index 1 button
//   if (await createLinkButton.nth(2).exists) {
//     await t.click(createLinkButton.nth(2))
//   } else {
//     await t.click(createLinkButton.nth(1))
//   }

//   // create link procedure - generate short url - 2
//   await t.click(createLinkButton.nth(0)).click(generateUrlImage)

//   // Save short url 2 - inactive link
//   const generatedUrlInactive = await shortUrlTextField.value
//   const linkRowInactive = Selector(`h6[title="${generatedUrlInactive}-directory"]`)

//   // create link procedure - proceed to create the link
//   await t
//     .typeText(shortUrlTextField, '-directory')
//     .typeText(longUrlTextField, 'google.com')
//     .click(createLinkButton.nth(2))
//     .click(linkRowInactive)
//     .click(activeSwitch)
//     .click(drawer.child(2).child('main').child('button'))

//   // create link procedure - generate short url - 3
//   await t.click(createLinkButton.nth(0)).click(generateUrlImage)

//   // Save short url 3 - file link
//   const generatedUrlFile = await shortUrlTextField.value

//   // create link procedure - proceed to create the link
//   await t
//   .typeText(shortUrlTextField, '-directory')
//   .click(fileTab)
//   .setFilesToUpload(uploadFile, './util/dummyFile.txt')
//   .click(createLinkButton.nth(2))

//   // It should show search results after the user types in a search query
//   // It should change the url in the address bar after the user stops typing in the search input box
//   // It should show default search results by keyword, sort by recency, with all states, both url and file types
//   // It should show search results by url when search by keyword
//   await t
//     .navigateTo(`${location}/#/directory`)
//     .typeText(directoryTextFieldKeyword, 'directory')
//     .wait(1000)
//     .expect(resultTable.exists).ok()

//   const userEmailRow = Selector('p').withText(`${testEmail}`).nth(0)

//   // It should reset search result when toggle between keyword and email filter
//   await t
//     .click(toggle)
//     .click(emailToggle)
//     .expect(resultTable.exists)
//     .notOk()

//   //  It should show search results by email when search by email
//   await t
//     .typeText(directoryTextFieldEmail, `${testEmail}`)
//     .wait(1000)
//     .expect(getURL())
//     .contains(`isEmail=true`)

//   const filterPanelButtonEmailTyped = Selector('input[type="search"]').parent().child(3)

//   // It should show search results in order of recency when recency sort order is chosen
//   await t
//     .click(filterPanelButtonEmailTyped)
//     .click(recencyButton)
//     .click(applyButton)
//     .expect(resultTable.child('tbody').child(0).child('td').child('p').child('span').innerText).contains(`${generatedUrlFile}-directory`)
//     .expect(resultTable.child('tbody').child(1).child('td').child('p').child('span').innerText).contains(`${generatedUrlInactive}-directory`)
//     .expect(resultTable.child('tbody').child(2).child('td').child('p').child('span').innerText).contains(`${generatedUrlActive}-directory`)

//   // It should show search results by url when filter by url
//   await t
//     .click(filterPanelButtonEmailTyped)
//     .click(resetButton)
//     .click(filterPanelButtonEmailTyped)
//     .click(linkButton)
//     .click(applyButton)
//     .expect(resultTable.child('tbody').child(0).child('td').child('p').child('span').innerText).contains(`${generatedUrlInactive}-directory`)
//     .expect(resultTable.child('tbody').child(1).child('td').child('p').child('span').innerText).contains(`${generatedUrlActive}-directory`)

//   // It should show search results by file when filter by file
//   await t
//     .click(filterPanelButtonEmailTyped)
//     .click(resetButton)
//     .click(filterPanelButtonEmailTyped)
//     .click(fileButton)
//     .click(applyButton)
//     .expect(resultTable.child('tbody').child(0).child('td').child('p').child('span').innerText).contains(`${generatedUrlFile}-directory`)

//   // It should show search results by active when filter by active
//   // It should reset search result and reset filter when reset button is clicked
//   await t
//     .click(filterPanelButtonEmailTyped)
//     .click(resetButton)
//     .click(filterPanelButtonEmailTyped)
//     .click(activeButton)
//     .click(applyButton)
//     .expect(resultTable.child('tbody').child(0).child('td').child('p').child('span').innerText).contains(`${generatedUrlFile}-directory`)
//     .expect(resultTable.child('tbody').child(1).child('td').child('p').child('span').innerText).contains(`${generatedUrlActive}-directory`)

//   // It should show search results by inactive when filter by inactive
//   await t
//     .click(filterPanelButtonEmailTyped)
//     .click(resetButton)
//     .click(filterPanelButtonEmailTyped)
//     .click(inactiveButton)
//     .click(applyButton)
//     .expect(resultTable.child('tbody').child(0).child('td').child('p').child('span').innerText).contains(`${generatedUrlInactive}-directory`)

//   // It should underline the user email when hovering on the email
//   await t
//     .click(filterPanelButtonEmailTyped)
//     .click(resetButton)
//     .hover(userEmailRow)
//     .expect(userEmailRow.getStyleProperty('text-decoration')).eql('underline solid rgb(56, 74, 81)')

//   // It should copy the user's email when click on the email
//   // await overrideClipboardCopy()
//   await t
//     // Ensure next action is a copy
//     .setNativeDialogHandler(() => true)
//     .click(userEmailRow)
//     .expect(copyAlert.exists).ok()

// })

//  /*
//  * Unable to test to the following:
//  * It should show search results in order of popularity when popularity sort order is chosen\
//  * It should redirect to the short url link when the row is clicked for active link
//  * It should copy the user's email when click on the email
//  */
