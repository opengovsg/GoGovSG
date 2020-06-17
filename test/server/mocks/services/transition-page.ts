/* eslint-disable max-classes-per-file, class-methods-use-this */
import { injectable } from 'inversify'
import { CookieArrayReducerServiceInterface } from '../../../../src/server/services/interfaces/CookieArrayReducerServiceInterface'

@injectable()
export class CookieArrayReducerMockVisited
  implements CookieArrayReducerServiceInterface {
  userHasVisitedShortlink(_: string[] | null, __: string): boolean {
    return true
  }

  writeShortlinkToCookie(_: string[] | null, __: string): string[] {
    return []
  }
}

@injectable()
export class CookieArrayReducerMockUnvisited
  implements CookieArrayReducerServiceInterface {
  userHasVisitedShortlink(_: string[] | null, __: string): boolean {
    return false
  }

  writeShortlinkToCookie(_: string[] | null, __: string): string[] {
    return []
  }
}
