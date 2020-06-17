/* eslint-disable import/prefer-default-export, max-classes-per-file */

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

export class InvalidOtpError extends Error {
  public retries: number

  constructor(retries: number) {
    super('Invalid Otp')
    this.name = 'InvalidOtpError'
    this.retries = retries
    Object.setPrototypeOf(this, InvalidOtpError.prototype)
  }
}
