/* eslint-disable max-classes-per-file, class-methods-use-this */
import { injectable } from 'inversify'
import { CookieReducer } from '../../../../src/server/util/transitionPage'

@injectable()
export class CookieArrayReducerMockVisited implements CookieReducer {
  userHasVisitedShortlink(_: string[] | null, __: string): boolean {
    return true
  }

  writeShortlinkToCookie(_: string[] | null, __: string): string[] {
    return []
  }
}

@injectable()
export class CookieArrayReducerMockUnvisited implements CookieReducer {
  userHasVisitedShortlink(_: string[] | null, __: string): boolean {
    return false
  }

  writeShortlinkToCookie(_: string[] | null, __: string): string[] {
    return []
  }
}
