/* eslint-disable max-classes-per-file, class-methods-use-this */

import { injectable } from 'inversify'
import { Cryptography } from '../../../../src/server/util/cryptography'

/**
 * A mock cryptography class that does not encrypt any data.
 * Comparison is replaced with a simple equality check between
 * two strings.
 */
@injectable()
export default class CryptographyMock implements Cryptography {
  hash(data: string, _: string | number): Promise<string> {
    return Promise.resolve(data)
  }

  compare(data: string, encrypted: string): Promise<boolean> {
    return Promise.resolve(data === encrypted)
  }
}
