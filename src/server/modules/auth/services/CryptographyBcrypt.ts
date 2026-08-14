import bcrypt from 'bcrypt'
import { injectable } from 'inversify'
import { Cryptography } from '../interfaces/index.js'

@injectable()
export class CryptographyBcrypt implements Cryptography {
  hash = bcrypt.hash

  compare = bcrypt.compare
}

export default CryptographyBcrypt
