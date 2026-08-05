import fetch from 'cross-fetch'

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

const extractOtp = (messages: unknown[]): string | null => {
  if (!Array.isArray(messages) || messages.length === 0) {
    return null
  }

  const last = messages[messages.length - 1] as {
    html?: string
    text?: string
  }
  const body = last?.html ?? last?.text
  if (!body) {
    return null
  }

  const match = JSON.stringify(body).match(/\d{6}/)
  return match ? match[0] : null
}

/**
 * Poll maildev until an OTP email arrives (or timeout).
 * Required with nodemailer v9, which delivers asynchronously via the SMTP pool.
 */
export const waitForOtpFromMaildev = async (
  maildevUrl = 'http://localhost:1080/email/',
  { timeoutMs = 30_000, intervalMs = 1_000 } = {},
): Promise<string> => {
  const deadline = Date.now() + timeoutMs

  /* eslint-disable no-await-in-loop */
  while (Date.now() < deadline) {
    try {
      const res = await fetch(maildevUrl, { method: 'GET' })
      if (res.ok) {
        const json = await res.json()
        const otp = extractOtp(json)
        if (otp) {
          return otp
        }
      }
    } catch {
      // maildev may not be ready yet
    }
    await sleep(intervalMs)
  }
  /* eslint-enable no-await-in-loop */

  throw new Error('Timed out waiting for OTP email in maildev')
}

export const clearMaildevInbox = async (
  maildevUrl = 'http://localhost:1080/email/all',
): Promise<void> => {
  await fetch(maildevUrl, { method: 'DELETE' })
}
