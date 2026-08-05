import { MaildevMessage, findOtpForRecipient, isAddressedTo } from './maildev'

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
