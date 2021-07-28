import session from 'express-session'
import { StorableUser } from '../../../server/repositories/types'

declare module 'express-session' {
  export interface SessionData {
    user: StorableUser
    visits: string[]
  }
}
