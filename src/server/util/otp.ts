// Generates a secure 6-char OTP
import crypto from 'crypto'

export type OtpFunction = () => string

export const generateOTP: OtpFunction = () => {
  const length: number = 6
  const chars: string = '0123456789'
  // Generates cryptographically strong pseudo-random data.
  // The size argument is a number indicating the number of bytes to generate.
  const rnd: Buffer = crypto.randomBytes(length)
  const d: number = chars.length / 256
  const value: string[] = new Array(length)
  for (let i: number = 0; i < length; i += 1) {
    value[i] = chars[Math.floor(rnd[i] * d)]
  }
  return value.join('')
}
