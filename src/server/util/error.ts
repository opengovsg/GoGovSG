/* eslint-disable max-classes-per-file */

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

export class InvalidFormatError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidFormatError'
    Object.setPrototypeOf(this, InvalidFormatError.prototype)
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

export class AlreadyExistsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AlreadyExistsError'
    Object.setPrototypeOf(this, AlreadyExistsError.prototype)
  }
}

export class AlreadyOwnLinkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AlreadyOwnLinkError'
    Object.setPrototypeOf(this, AlreadyOwnLinkError.prototype)
  }
}
