/* eslint-disable max-classes-per-file, class-methods-use-this */
import { CookieReducer } from '../../../../src/server/util/transitionPage'
import { injectable } from 'inversify'

@injectable()
export class CookieArrayReducerMock implements CookieReducer {
  userHasVisitedShortlink(_: string[] | null, __: string): boolean {
    return true
  }

  writeShortlinkToCookie(_: string[] | null, __: string): string[] {
    return []
  }
}
