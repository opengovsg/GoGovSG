import fs from 'fs'
import path from 'path'
import { expect, Page } from '@playwright/test'
import { apiLocation } from './config'

/**
 * Creates links through the API instead of the create-link modal.
 *
 * Most specs need links merely to *exist* with given properties -- active or
 * inactive, file or URL, tagged, clicked -- before they assert on filtering,
 * sorting, searching or redirecting. Driving the modal for each one costs
 * several seconds of round-trips per link and, worse, reports a broken modal as
 * a filter or sort failure.
 *
 * Creating a link through the modal is itself covered, deliberately and
 * explicitly, by UrlCreation.spec.ts. Do not seed there.
 *
 * These helpers post to the same endpoints the client does, so the records are
 * indistinguishable from UI-created ones: userGuard injects userId from the
 * session (api/index.ts), and the client prepends `https://` to the long URL
 * before posting (user/actions/index.ts), which `seedUrlLink` mirrors.
 * `page.request` shares the browser context's cookie jar, so the saved session
 * authenticates these calls with no extra setup.
 */

const userUrlEndpoint = `${apiLocation}/api/user/url`

export type SeededLink = {
  shortUrl: string
  tags: string[]
}

/** Toggles a link active or inactive, as the drawer's switch does. */
export async function setLinkState(
  page: Page,
  shortUrl: string,
  active: boolean,
): Promise<void> {
  const response = await page.request.patch(userUrlEndpoint, {
    data: { shortUrl, state: active ? 'ACTIVE' : 'INACTIVE' },
  })
  expect(
    response.ok(),
    `setting /${shortUrl} to ${active ? 'ACTIVE' : 'INACTIVE'} failed: ${response.status()}`,
  ).toBeTruthy()
}

/**
 * `longUrl` is given without a scheme, exactly as it is typed into the modal,
 * which renders `https://` as a start adornment rather than as input.
 */
export async function seedUrlLink(
  page: Page,
  {
    shortUrl,
    longUrl,
    tags = [],
    active = true,
  }: {
    shortUrl: string
    longUrl: string
    tags?: string[]
    active?: boolean
  },
): Promise<SeededLink> {
  const response = await page.request.post(userUrlEndpoint, {
    data: { shortUrl, longUrl: `https://${longUrl}`, tags },
  })
  expect(
    response.ok(),
    `seeding /${shortUrl} failed: ${response.status()} ${await response.text()}`,
  ).toBeTruthy()

  if (!active) {
    await setLinkState(page, shortUrl, false)
  }
  return { shortUrl, tags }
}

/**
 * Uploads a file link. Sends only the file -- `urlSchema` is `xor` on
 * `longUrl`/`files`, and the server derives the S3 URL from the short URL
 * itself, so passing a long URL here is rejected rather than ignored.
 */
export async function seedFileLink(
  page: Page,
  {
    shortUrl,
    filePath,
    tags = [],
    active = true,
  }: {
    shortUrl: string
    filePath: string
    tags?: string[]
    active?: boolean
  },
): Promise<SeededLink> {
  const response = await page.request.post(userUrlEndpoint, {
    multipart: {
      shortUrl,
      // Tags cross the wire as JSON on multipart requests; preprocessFormData
      // parses them back before Joi sees them.
      ...(tags.length > 0 ? { tags: JSON.stringify(tags) } : {}),
      file: {
        name: path.basename(filePath),
        mimeType: 'text/plain',
        buffer: fs.readFileSync(filePath),
      },
    },
  })
  expect(
    response.ok(),
    `seeding file /${shortUrl} failed: ${response.status()} ${await response.text()}`,
  ).toBeTruthy()

  if (!active) {
    await setLinkState(page, shortUrl, false)
  }
  return { shortUrl, tags }
}
