import fs from 'fs'
import { customAlphabet } from 'nanoid/async'
import {
  API_LOGIN_OTP,
  API_LOGIN_VERIFY,
  EMAIL_RANDOM_STRING_LENGTH,
  LOCAL_EMAIL_URL,
} from '../config'
import { createDbUser, deleteDbUser } from './db'
import { get, postJson } from './requests'

export const DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/

export const generateRandomString = (length: number) => {
  const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'
  return customAlphabet(ALPHABET, length)()
}

export const createIntegrationTestUser: () => Promise<string> = async () => {
  const randomString = await generateRandomString(EMAIL_RANDOM_STRING_LENGTH)
  const integrationTestEmail = `integration-${randomString}@open.gov.sg`
  await createDbUser(integrationTestEmail)
  return integrationTestEmail
}

export const deleteIntegrationTestUser: (email: string) => Promise<void> =
  async (email) => {
    await deleteDbUser(email)
  }

export const getAuthCookie: (email: string) => Promise<string> = async (
  email,
) => {
  const otpRes = await postJson(API_LOGIN_OTP, {
    email,
  })
  if (!otpRes.ok) throw new Error('Failed to generate OTP')
  const emailRes = await get(LOCAL_EMAIL_URL)
  if (!emailRes.ok) throw new Error('Failed to check email for OTP')
  const emailJson = await emailRes.json()
  const emailBody = emailJson[emailJson.length - 1].html
  const emailOTP = JSON.stringify(emailBody).match(/\d{6}/)![0]
  const verifyRes = await postJson(API_LOGIN_VERIFY, {
    email,
    otp: emailOTP,
  })
  if (!verifyRes.ok) throw new Error('Failed to verify OTP')
  const setCookie = verifyRes.headers.get('set-cookie')
  if (!setCookie) throw new Error('Failed to get auth cookie')
  const authCookie = setCookie.split(';')[0]
  return authCookie
}

export const readFile = (path: string) => {
  return fs.createReadStream(path, 'utf-8')
}
