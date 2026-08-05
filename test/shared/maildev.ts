import fetch from 'cross-fetch'

const DEFAULT_MAILDEV_URL = 'http://localhost:1080/email/'
const DEFAULT_CLEAR_URL = 'http://localhost:1080/email/all'

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

export type MaildevAddress = {
  address?: string
  name?: string
}

export type MaildevMessage = {
  id: string
  time?: string
  html?: string
  text?: string
  to?: MaildevAddress[]
  envelope?: {
    to?: string[]
  }
}

export type WaitForOtpOptions = {
  /** Intended recipient; only messages addressed to this email are considered. */
  to: string
  /**
   * Message ids present before the OTP request. Only messages with new ids
   * are accepted, so a leftover inbox entry for the same recipient is ignored.
   */
  afterMessageIds: ReadonlySet<string> | readonly string[]
  maildevUrl?: string
  timeoutMs?: number
  intervalMs?: number
}

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const recipientAddresses = (message: MaildevMessage): string[] => {
  const fromTo = (message.to ?? [])
    .map((entry) => entry.address)
    .filter((address): address is string => Boolean(address))
  const fromEnvelope = message.envelope?.to ?? []
  return [...fromTo, ...fromEnvelope].map(normalizeEmail)
}

export const isAddressedTo = (
  message: MaildevMessage,
  recipient: string,
): boolean => {
  const wanted = normalizeEmail(recipient)
  return recipientAddresses(message).includes(wanted)
}

export const extractOtpFromBody = (body: unknown): string | null => {
  if (body == null) {
    return null
  }
  const match = JSON.stringify(body).match(/\d{6}/)
  return match ? match[0] : null
}

/**
 * Return the OTP from the newest new message to `to` that contains a six-digit
 * code. Skips newer non-OTP mail for the same recipient (e.g. Job notices).
 */
export const findOtpForRecipient = (
  messages: MaildevMessage[],
  to: string,
  afterMessageIds: ReadonlySet<string> | readonly string[],
): string | null => {
  const knownIds =
    afterMessageIds instanceof Set ? afterMessageIds : new Set(afterMessageIds)

  const candidates = messages.filter(
    (message) =>
      Boolean(message.id) &&
      !knownIds.has(message.id) &&
      isAddressedTo(message, to),
  )

  for (let index = candidates.length - 1; index >= 0; index -= 1) {
    const otp = extractOtpFromBody(
      candidates[index].html ?? candidates[index].text,
    )
    if (otp) {
      return otp
    }
  }

  return null
}

export const listMaildevMessages = async (
  maildevUrl = DEFAULT_MAILDEV_URL,
): Promise<MaildevMessage[]> => {
  const res = await fetch(maildevUrl, { method: 'GET' })
  if (!res.ok) {
    throw new Error(`Failed to list maildev inbox: HTTP ${res.status}`)
  }
  const json = await res.json()
  if (!Array.isArray(json)) {
    throw new Error('Unexpected maildev inbox payload')
  }
  return json as MaildevMessage[]
}

export type MaildevRetryOptions = {
  timeoutMs?: number
  intervalMs?: number
}

/** Snapshot inbox message ids before triggering an OTP email. */
export const getMaildevMessageIds = async (
  maildevUrl = DEFAULT_MAILDEV_URL,
  { timeoutMs = 30_000, intervalMs = 1_000 }: MaildevRetryOptions = {},
): Promise<string[]> => {
  const deadline = Date.now() + timeoutMs

  /* eslint-disable no-await-in-loop */
  while (Date.now() < deadline) {
    try {
      const messages = await listMaildevMessages(maildevUrl)
      return messages.map((message) => message.id).filter(Boolean)
    } catch {
      // maildev may not be ready yet; retry until we know the inbox state
    }
    await sleep(intervalMs)
  }
  /* eslint-enable no-await-in-loop */

  throw new Error('Timed out reading maildev inbox baseline')
}

/**
 * Poll maildev until a new OTP email for `to` arrives (or timeout).
 * Required with nodemailer v9, which delivers asynchronously via the SMTP pool.
 */
export const waitForOtpFromMaildev = async ({
  to,
  afterMessageIds,
  maildevUrl = DEFAULT_MAILDEV_URL,
  timeoutMs = 30_000,
  intervalMs = 1_000,
}: WaitForOtpOptions): Promise<string> => {
  const deadline = Date.now() + timeoutMs

  /* eslint-disable no-await-in-loop */
  while (Date.now() < deadline) {
    try {
      const messages = await listMaildevMessages(maildevUrl)
      const otp = findOtpForRecipient(messages, to, afterMessageIds)
      if (otp) {
        return otp
      }
    } catch {
      // maildev may not be ready yet
    }
    await sleep(intervalMs)
  }
  /* eslint-enable no-await-in-loop */

  throw new Error(`Timed out waiting for OTP email to ${to} in maildev`)
}

export const clearMaildevInbox = async (
  maildevUrl = DEFAULT_CLEAR_URL,
): Promise<void> => {
  await fetch(maildevUrl, { method: 'DELETE' })
}
