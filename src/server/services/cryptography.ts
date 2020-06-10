import bcrypt from 'bcrypt'
import { injectable } from 'inversify'

export interface Cryptography {
  hash(data: string, saltOrRounds: string | number): Promise<string>

  compare(data: string, encrypted: string): Promise<boolean>
}

@injectable()
export class CryptographyBcrypt implements Cryptography {
  hash = bcrypt.hash

  compare = bcrypt.compare
}
