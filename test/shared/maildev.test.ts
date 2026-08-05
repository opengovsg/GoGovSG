jest.mock('cross-fetch')

import fetch from 'cross-fetch'
import {
  MaildevMessage,
  findOtpForRecipient,
  getMaildevMessageIds,
  isAddressedTo,
} from './maildev'

const mockedFetch = fetch as jest.MockedFunction<typeof fetch>

const message = (
  overrides: Partial<MaildevMessage> & Pick<MaildevMessage, 'id'>,
): MaildevMessage => ({
  html: '<p>Your OTP is 123456</p>',
  to: [{ address: 'user@open.gov.sg' }],
  ...overrides,
})

describe('maildev OTP helpers', () => {
  it('matches recipient via to[] or envelope.to', () => {
    expect(
      isAddressedTo(
        message({ id: 'a', to: [{ address: 'User@open.gov.sg' }] }),
        'user@open.gov.sg',
      ),
    ).toBe(true)
    expect(
      isAddressedTo(
        message({
          id: 'b',
          to: [],
          envelope: { to: ['other@open.gov.sg'] },
        }),
        'other@open.gov.sg',
      ),
    ).toBe(true)
    expect(
      isAddressedTo(message({ id: 'c' }), 'someone-else@open.gov.sg'),
    ).toBe(false)
  })

  it('ignores baseline messages and other recipients', () => {
    const inbox = [
      message({
        id: 'stale-same-user',
        html: '<p>111111</p>',
        to: [{ address: 'user@open.gov.sg' }],
      }),
      message({
        id: 'other-user',
        html: '<p>222222</p>',
        to: [{ address: 'other@open.gov.sg' }],
      }),
      message({
        id: 'fresh',
        html: '<p>333333</p>',
        to: [{ address: 'user@open.gov.sg' }],
      }),
    ]

    expect(
      findOtpForRecipient(inbox, 'user@open.gov.sg', ['stale-same-user']),
    ).toBe('333333')
  })

  it('returns null when only baseline or wrong-recipient mail exists', () => {
    const inbox = [
      message({
        id: 'stale',
        html: '<p>111111</p>',
        to: [{ address: 'user@open.gov.sg' }],
      }),
      message({
        id: 'other',
        html: '<p>222222</p>',
        to: [{ address: 'other@open.gov.sg' }],
      }),
    ]

    expect(findOtpForRecipient(inbox, 'user@open.gov.sg', ['stale'])).toBeNull()
  })
})

describe('getMaildevMessageIds', () => {
  const maildevUrl = 'http://localhost:1080/email/'

  afterEach(() => {
    mockedFetch.mockReset()
  })

  it('returns an empty baseline when the inbox is reachable but empty', async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response)

    await expect(
      getMaildevMessageIds(maildevUrl, { intervalMs: 10, timeoutMs: 1000 }),
    ).resolves.toEqual([])
  })

  it('retries until maildev responds', async () => {
    mockedFetch
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 'existing' }],
      } as Response)

    await expect(
      getMaildevMessageIds(maildevUrl, { intervalMs: 10, timeoutMs: 1000 }),
    ).resolves.toEqual(['existing'])
  })

  it('throws when the baseline cannot be read in time', async () => {
    mockedFetch.mockRejectedValue(new Error('ECONNREFUSED'))

    await expect(
      getMaildevMessageIds(maildevUrl, { intervalMs: 10, timeoutMs: 50 }),
    ).rejects.toThrow('Timed out reading maildev inbox baseline')
  })
})
