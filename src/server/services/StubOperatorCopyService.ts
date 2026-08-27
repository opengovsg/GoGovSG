import { AnnouncementPayload } from '../lib/growthbook'
import { OperatorCopyService } from './OperatorCopyService'

export class StubOperatorCopyService implements OperatorCopyService {
  public constructor(
    private readonly loginMessage = '',
    private readonly userMessage = '',
    private readonly userAnnouncement: AnnouncementPayload | null = null,
  ) {}

  public async init(): Promise<void> {
    return Promise.resolve()
  }

  public getLoginMessage(): string {
    return this.loginMessage
  }

  public getUserMessage(): string {
    return this.userMessage
  }

  public getUserAnnouncement(): AnnouncementPayload | null {
    return this.userAnnouncement
  }
}

export default StubOperatorCopyService
