import { AnnouncementPayload } from '../lib/growthbook.js'

export interface OperatorCopyService {
  init(): Promise<void>
  getLoginMessage(): string
  getUserMessage(): string
  getUserAnnouncement(): AnnouncementPayload | null
}
