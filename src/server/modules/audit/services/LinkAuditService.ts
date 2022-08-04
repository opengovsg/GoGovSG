import { injectable } from 'inversify'
import * as interfaces from '../interfaces'

@injectable()
export class LinkAuditService implements interfaces.LinkAuditService {
  getLinkAudit: (
    userId: number,
    shortUrl: string,
    limit: number,
    offset: number,
  ) => Promise<null> = async () => {
    return null
  }
}

export default LinkAuditService
