import { AnnouncementPayload } from '../lib/growthbook'

export interface OperatorCopyService {
  init(): Promise<void>
  getLoginMessage(): string
  getUserMessage(): string
  getUserAnnouncement(): AnnouncementPayload | null
}
