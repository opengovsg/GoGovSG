import session from 'express-session'
import { StorableUser } from '../../../server/repositories/types'

declare module 'express-session' {
  export interface SessionData {
    user: StorableUser
    visits: string[]
    // Set when the session came from a one.gov.sg login.
    oneGovSg?: boolean
  }
}
