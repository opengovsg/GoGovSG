import { parse } from 'csv-parse'
import { createReadStream } from 'fs'
import { expect } from '@playwright/test'
import { test } from './fixtures'
import {
  dummyFilePath,
  rootLocation,
  shortUrl,
  smallFileSize,
  tagText1,
  tagText2,
  tagText3,
} from './util/config'
import {
  clickAway,
  dateOfCreationButton,
  downloadLinkButton,
  exactText,
  filterSortPanel,
  generateRandomString,
  linkRowByShortUrl,
  longUrlTextField,
  mostNumberOfVisitsButton,
  noResultsFoundText,
  openCreateLinkModal,
  searchBarLinkButton,
  searchBarLinksInput,
  searchBarTagButton,
  searchBarTagsInput,
  shortUrlTextField,
  urlTable,
  urlTableOriginalUrlText,
  urlTableRow,
  urlTableRowShortUrlText,
  urlTableRowUrlText,
  urlTableTagsTextContent,
  userActiveButton,
  userApplyButton,
  userFileButton,
  userFilterSortPanelButton,
  userInactiveButton,
  userLinkButton,
  userResetButton,
} from './util/helpers'
import { firstLinkHandle } from './util/FirstLinkHandle'
import { createEmptyFileOfSize, deleteFile } from './util/fileHandle'
import { gotoPage } from './util/navigation'
import { seedFileLink, seedUrlLink } from './util/seed'
import { userLinksRefetch } from './util/waits'
import { TAG_SEPARATOR } from '../../src/shared/constants'

test('User page test on filter search by link', async ({ page }) => {
  // Create links for filter and search. Seeded, not created through the modal:
  // this test asserts on the filter and sort panel, and seeding in sequence
  // gives the created-time order the assertions below depend on.
  const generatedUrlActive = generateRandomString(6)
  const generatedUrlInactive = generateRandomString(6)
  const generatedUrlFile = generateRandomString(6)

  // Save short url 1 - active link
  await seedUrlLink(page, { shortUrl: generatedUrlActive, longUrl: shortUrl })
  // Save short url 2 - inactive link
  await seedUrlLink(page, {
    shortUrl: generatedUrlInactive,
    longUrl: shortUrl,
    active: false,
  })
  // Save short url 3 - file link
  await createEmptyFileOfSize(dummyFilePath, smallFileSize)
  await seedFileLink(page, {
    shortUrl: generatedUrlFile,
    filePath: dummyFilePath,
  })
  await deleteFile(dummyFilePath)

  // The table was fetched before these links existed.
  await gotoPage(page, rootLocation)
  await expect(linkRowByShortUrl(page, generatedUrlFile)).toBeVisible()

  // Clicking on the button at the end of the search input should open the sort and filter panel
  await userFilterSortPanelButton(page).click()
  await expect(filterSortPanel(page)).not.toHaveCSS('height', '0px')

  // Links should be sorted by their created time in descending order when enabling sort by Date of creation and clicking apply
  await dateOfCreationButton(page).click()
  await userApplyButton(page).click()
  await expect
    .poll(() => urlTableRowUrlText(page, 0))
    .toBe(`/${generatedUrlFile}`)
  await expect
    .poll(() => urlTableRowUrlText(page, 1))
    .toBe(`/${generatedUrlInactive}`)
  await expect
    .poll(() => urlTableRowUrlText(page, 2))
    .toBe(`/${generatedUrlActive}`)

  // Inactive links should be filtered out by checking only Active and clicking apply
  // Panel should be closed when apply is clicked
  await userFilterSortPanelButton(page).click()
  await userActiveButton(page).click()
  await userApplyButton(page).click()
  await expect(filterSortPanel(page)).toHaveCSS('height', '0px')
  await expect
    .poll(() => urlTableRowUrlText(page, 1))
    .not.toBe(`/${generatedUrlInactive}`)

  // Active links should be filtered out by checking only Inactive and clicking apply
  // Panel should be closed and links sorted by created time with no filtering after clicking on reset. All links and files should be visible.
  await userFilterSortPanelButton(page).click()
  await userResetButton(page).click() // resets
  await userFilterSortPanelButton(page).click()
  await userInactiveButton(page).click()
  await userApplyButton(page).click()
  await expect
    .poll(() => urlTableRowUrlText(page, 0))
    .toBe(`/${generatedUrlInactive}`)

  // File links should be filtered out by checking only Link and clicking apply
  await userFilterSortPanelButton(page).click()
  await userResetButton(page).click() // resets
  await userFilterSortPanelButton(page).click()
  await userLinkButton(page).click()
  await userApplyButton(page).click()
  await expect
    .poll(() => urlTableRowUrlText(page, 0))
    .not.toBe(`/${generatedUrlFile}`)

  // Non-file links should be filtered out by checking only File and clicking apply
  await userFilterSortPanelButton(page).click()
  await userResetButton(page).click() // resets
  await userFilterSortPanelButton(page).click()
  await userFileButton(page).click()
  await userApplyButton(page).click()
  await expect
    .poll(() => urlTableRowUrlText(page, 0))
    .toBe(`/${generatedUrlFile}`)

  // Panel should be closed when clicking outside of it
  await userFilterSortPanelButton(page).click()
  await clickAway(page)
  await expect(filterSortPanel(page)).toHaveCSS('height', '0px')

  // Searching for a non-existent link should show that no results are found
  await searchBarLinksInput(page).fill('this-link-does-not-exist')
  // Should display no results found
  await expect(noResultsFoundText(page)).toBeVisible()
  // Links input and dropdown should still exist
  await expect(searchBarLinkButton(page)).toBeVisible()
  await expect(searchBarLinksInput(page)).toBeVisible()
})

test('User page test on filter search by tags', async ({ page }) => {
  // Create links for filter and search by tags. Seeded, not typed into the tags
  // autocomplete: this test asserts on tag search and sort. Creating tags
  // through the autocomplete is covered by UrlCreation.spec.ts and
  // DrawerLogin.spec.ts, both of which assert the tag lands on the row.
  const generatedUrl1 = generateRandomString(6)
  const generatedUrl2 = generateRandomString(6)
  const generatedUrl3 = generateRandomString(6)
  const tableRow = (short: string) =>
    linkRowByShortUrl(page, short).locator('xpath=ancestor::tr')
  const linkTableRow1 = tableRow(generatedUrl1)
  const linkTableRow2 = tableRow(generatedUrl2)
  const linkTableRow3 = tableRow(generatedUrl3)

  // Save short url 1: link with tag 1
  await seedUrlLink(page, {
    shortUrl: generatedUrl1,
    longUrl: shortUrl,
    tags: [tagText1],
  })
  // Save short url 2: link with tags 1 and 2
  await seedUrlLink(page, {
    shortUrl: generatedUrl2,
    longUrl: shortUrl,
    tags: [tagText1, tagText2],
  })
  // Save short url 3: file with tags 2 and 3
  await createEmptyFileOfSize(dummyFilePath, smallFileSize)
  await seedFileLink(page, {
    shortUrl: generatedUrl3,
    filePath: dummyFilePath,
    tags: [tagText2, tagText3],
  })
  await deleteFile(dummyFilePath)

  // The table was fetched before these links existed.
  await gotoPage(page, rootLocation)
  await expect(linkTableRow3).toBeVisible()

  // Click on tag 1 from url 1. Bound to this query: creating url 3 above
  // dispatches a refetch that may still be in flight.
  const tag1Search = userLinksRefetch(page, { tags: tagText1 })
  await linkTableRow1.getByRole('button', { name: exactText(tagText1) }).click()
  await tag1Search
  // Link table should show urls 2 and 1 on top
  await expect.poll(() => urlTableRowUrlText(page, 0)).toBe(`/${generatedUrl2}`)
  await expect.poll(() => urlTableRowUrlText(page, 1)).toBe(`/${generatedUrl1}`)
  // Search dropdown should change to search by tags
  await expect(searchBarTagButton(page)).toBeVisible()
  // Search input should change to tag 1
  expect(await searchBarTagsInput(page).inputValue()).toBe(tagText1)

  // Click on tag 2 from url 2
  const tag2Search = userLinksRefetch(page)
  await linkTableRow2.getByRole('button', { name: exactText(tagText2) }).click()
  await tag2Search
  // Link table should show urls 3, 2, and 1 on top
  await expect.poll(() => urlTableRowUrlText(page, 0)).toBe(`/${generatedUrl3}`)
  await expect.poll(() => urlTableRowUrlText(page, 1)).toBe(`/${generatedUrl2}`)
  await expect.poll(() => urlTableRowUrlText(page, 2)).toBe(`/${generatedUrl1}`)
  // Search dropdown should remain at search by tags
  await expect(searchBarTagButton(page)).toBeVisible()
  // Search input should change to tag 1 + tag separator + tag 2
  expect(await searchBarTagsInput(page).inputValue()).toBe(
    `${tagText1}${TAG_SEPARATOR}${tagText2}`,
  )

  // Add semicolon and non-existent tag to search input. This block and the next
  // assert the table is *unchanged*, so awaiting the refetch is what makes them
  // meaningful -- polling alone would pass on the previous results.
  const orConditionSearch = userLinksRefetch(page)
  await searchBarTagsInput(page).fill(`${TAG_SEPARATOR}zzzzzzzzzzzzzzzzzzzz`)
  await orConditionSearch
  // Link table should still show urls 3, 2, and 1 on top (because of OR condition between search tags)
  await expect.poll(() => urlTableRowUrlText(page, 0)).toBe(`/${generatedUrl3}`)
  await expect.poll(() => urlTableRowUrlText(page, 1)).toBe(`/${generatedUrl2}`)
  await expect.poll(() => urlTableRowUrlText(page, 2)).toBe(`/${generatedUrl1}`)

  // Delete tags from search input
  const clearedSearch = userLinksRefetch(page)
  await searchBarTagsInput(page).click()
  await searchBarTagsInput(page).fill('')
  await clearedSearch
  // Link table should show urls 3, 2, and 1 on top
  await expect.poll(() => urlTableRowUrlText(page, 0)).toBe(`/${generatedUrl3}`)
  await expect.poll(() => urlTableRowUrlText(page, 1)).toBe(`/${generatedUrl2}`)
  await expect.poll(() => urlTableRowUrlText(page, 2)).toBe(`/${generatedUrl1}`)

  // Change search input to 'TaG_', a case-insensitive partial match for tag 1 but not 2 nor 3
  const partialMatchSearch = userLinksRefetch(page)
  await searchBarTagsInput(page).fill('TaG_')
  await partialMatchSearch
  // Link table should show urls 2 and 1 on top
  await expect.poll(() => urlTableRowUrlText(page, 0)).toBe(`/${generatedUrl2}`)
  await expect.poll(() => urlTableRowUrlText(page, 1)).toBe(`/${generatedUrl1}`)

  // Change search input to a single non-existent tag
  await searchBarTagsInput(page).click()
  await searchBarTagsInput(page).fill('this-tag-does-not-exist')
  // Should display no results found
  await expect(noResultsFoundText(page)).toBeVisible()
  // Tag input and dropdown should still exist
  await expect(searchBarTagButton(page)).toBeVisible()
  await expect(searchBarTagsInput(page)).toBeVisible()
})

test('User page shows ellipsis on long link', async ({ page }) => {
  await openCreateLinkModal(page)
  const longUrlString = generateRandomString(60)
  await shortUrlTextField(page).fill(longUrlString)
  await longUrlTextField(page).fill(`${shortUrl}`)
  await firstLinkHandle(page)
  // wait for it to appear on the table
  await expect(linkRowByShortUrl(page, longUrlString)).toBeVisible()
  const tableRow = urlTableRow(page, 0)
  const overflow = await tableRow.evaluate(
    (el) => getComputedStyle(el).textOverflow,
  )
  const hasEllipsis = overflow === 'ellipsis'

  expect(hasEllipsis).toBe(true)
})

test('Download csv should match links on page', async ({ page }) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    downloadLinkButton(page).click(),
  ])
  const csvPath = await download.path()
  if (!csvPath) {
    throw new Error('Download did not produce a local file path')
  }

  type Record = {
    shortUrl: string
    originalUrl: string
    status: string
    tags: string
    visits: string
    createdAt: string
  }

  const csvRows: string[] = []
  ;(() => {
    const readStream = createReadStream(csvPath, 'utf8')

    readStream.pipe(parse()).on('data', (chunk) => {
      csvRows.push(chunk)
    })

    readStream.on('error', (err) => {
      console.log(`Error reading the downloaded csv: ${err}`)
    })

    readStream.on('end', () => {
      console.log('Finished reading using csv parse')
    })
  })()

  const linkTable = urlTable(page)
  // Get the number of rows in the table
  const rowCount = await linkTable.locator('tr').count()
  const linktTableRecords: Record[] = []

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const row = linkTable.locator('tr').nth(rowIndex)
    const record: Record = {
      shortUrl: '',
      originalUrl: '',
      status: 'ACTIVE',
      tags: '',
      visits: '',
      createdAt: '',
    }

    // Get the number of columns in the row
    // eslint-disable-next-line no-await-in-loop
    const colCount = await row.locator('td').count()

    // Loop through each column
    for (let colIndex = 1; colIndex < colCount; colIndex += 1) {
      // For short URL, Original URL and tags
      if (colIndex === 1) {
        // eslint-disable-next-line no-await-in-loop
        const divs = await row
          .locator('td')
          .nth(colIndex)
          .locator('div')
          .count()
        for (let divCount = 1; divCount < divs; divCount += 1) {
          if (divCount === 1) {
            // eslint-disable-next-line no-await-in-loop
            record.shortUrl = (await urlTableRowShortUrlText(row)) ?? ''
          }
          if (divCount === 2) {
            // eslint-disable-next-line no-await-in-loop
            record.originalUrl = (await urlTableOriginalUrlText(row)) ?? ''
          }
          if (divCount === 3) {
            // eslint-disable-next-line no-await-in-loop
            record.tags += await urlTableTagsTextContent(row)
          }
        }
      }
      // eslint-disable-next-line no-await-in-loop
      const cellText = await row.locator('td').nth(colIndex).textContent()

      // isActive
      if (colIndex === 3) {
        record.status = cellText === '• active' ? 'ACTIVE' : 'INACTIVE'
      }

      // Created Time
      if (colIndex === 4) {
        record.createdAt = cellText ?? ''
      }

      // Number of Visits
      if (colIndex === 5) {
        record.visits = cellText ?? ''
      }
    }
    linktTableRecords.push(record)
  }

  let isMatching = true
  for (let index = 0; index < linktTableRecords.length; index += 1) {
    const linkRecord = linktTableRecords[index]
    const csvRecord = csvRows[index + 1]

    if (linkRecord.shortUrl !== `/${csvRecord[0]}`) {
      isMatching = false
    }
    if (linkRecord.originalUrl !== csvRecord[1]) {
      isMatching = false
    }
    if (linkRecord.status !== csvRecord[2]) {
      isMatching = false
    }
    if (linkRecord.tags !== csvRecord[3]) {
      isMatching = false
    }
    if (linkRecord.visits !== csvRecord[4]) {
      isMatching = false
    }
  }

  expect(isMatching).toBe(true)
})

test('Directory sort by number of visitors.', async ({ page }) => {
  await userFilterSortPanelButton(page).click()
  await mostNumberOfVisitsButton(page).click()
  await userApplyButton(page).click()

  const linkTable = urlTable(page)
  // Get the number of rows in the table
  const rowCount = await linkTable.locator('tr').count()
  let isSorted = true
  // Loop through each row
  const resultArray: string[] = []

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const row = linkTable.locator('tr').nth(rowIndex)
    // eslint-disable-next-line no-await-in-loop
    resultArray.push((await row.locator('td').nth(5).textContent()) ?? '')
  }

  const numberArray: number[] = resultArray.map((value) => {
    return +value
  })

  const sortedNumberArray = [...numberArray].sort((n1, n2) => n2 - n1)
  isSorted = sortedNumberArray.every((element, index) => {
    return element === numberArray[index]
  })

  expect(isSorted).toBe(true)
})
