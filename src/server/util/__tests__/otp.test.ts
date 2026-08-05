import generateOTP from '../otp'

describe('generateOTP', () => {
  it('should generate a 6-character alphanumeric OTP', () => {
    const otp = generateOTP()
    expect(otp).toHaveLength(6)
    expect(otp).toMatch(/^[A-Z0-9]{6}$/)
  })

  it('should generate different OTPs across multiple calls', () => {
    const otps = new Set(Array.from({ length: 20 }, () => generateOTP()))
    expect(otps.size).toBeGreaterThan(1)
  })
})
