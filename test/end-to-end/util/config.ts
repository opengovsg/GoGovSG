import fetch from 'cross-fetch'
import { ClientFunction } from 'testcafe'

const downloadsFolder = require('downloads-folder')

export const testEmail = 'testcafe1@open.gov.sg'
// export const downloadPath = '/Downloads/'
export const downloadPath = downloadsFolder()

// transferEmail must exist in database
export const transferEmail = 'transfer1@open.gov.sg'

export const getRootLocation = () => {
  return 'http://localhost:3000'
}

export const getOtp = async () => {
  return '111111'
}

const options = {
  host: 'http://ipv4bot.whatismyipaddress.com',
}

export const getMyIp = async () => {
  const response = await fetch(options.host)
  const result = await response.text()
  return result
}

export const getEmailIp = async () => {
  const ip = await getMyIp()
  return ip
}

export const getURL = ClientFunction(() => document.location.href)
