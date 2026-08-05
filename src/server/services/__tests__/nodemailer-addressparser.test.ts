/// <reference types="jest" />
/// <reference types="node" />

type ParsedAddress = { address: string; name: string }
type AddressParser = (address: string) => ParsedAddress[]

const addressparser = require('nodemailer/lib/addressparser') as AddressParser

/**
 * Regression tests for nodemailer addressparser.
 * Quoted nested addresses like `"user@gmail.com"@agency.gov.sg` previously
 * misparsed as delivering to gmail.com (fixed in nodemailer >= 7.0.7).
 */
describe('nodemailer addressparser', () => {
  it('does not misroute quoted nested emails to an external domain', () => {
    const payloads = [
      '"test@gmail.com"@tech.gov.sg',
      '"sample@gmail.com"@tech.gov.sg',
    ]

    payloads.forEach((payload) => {
      const parsed = addressparser(payload)

      expect(parsed).toHaveLength(1)
      expect(parsed[0].address).not.toMatch(/@(gmail|yahoo|outlook)\.com$/i)
      expect(parsed[0].address).toMatch(/@tech\.gov\.sg$/)
    })
  })

  it('parses a normal government email unchanged', () => {
    const parsed = addressparser('user@tech.gov.sg')

    expect(parsed).toEqual([{ address: 'user@tech.gov.sg', name: '' }])
  })

  it('parses display-name form without changing the mailbox', () => {
    const parsed = addressparser('Alexis <user@open.gov.sg>')

    expect(parsed).toEqual([{ address: 'user@open.gov.sg', name: 'Alexis' }])
  })
})
