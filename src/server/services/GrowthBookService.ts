import { GrowthBookClient } from '@growthbook/growthbook'
import { injectable } from 'inversify'

import assetVariant from '../../shared/util/asset-variant'
import {
  AnnouncementPayload,
  getAnnouncementKey,
  getLoginMessageKey,
  getUserMessageKey,
} from '../lib/growthbook'
import { growthbookClientKey, logger } from '../config'
import { OperatorCopyService } from './OperatorCopyService'

const GROWTHBOOK_API_HOST = 'https://cdn.growthbook.io'
const EMPTY_USER_CONTEXT = { attributes: {} }

@injectable()
export class GrowthBookService implements OperatorCopyService {
  private client: GrowthBookClient | null = null

  public async init(): Promise<void> {
    if (!growthbookClientKey) {
      logger.warn('GROWTHBOOK_CLIENT_KEY is not set; GrowthBook disabled.')
      return
    }

    this.client = new GrowthBookClient({
      apiHost: GROWTHBOOK_API_HOST,
      clientKey: growthbookClientKey,
    })

    const result = await this.client.init({ timeout: 3000 })

    if (!result.success) {
      logger.warn(
        `GrowthBook init failed (source=${result.source}); features empty until refresh succeeds.`,
      )
    }

    setInterval(() => {
      void this.client?.refreshFeatures({ skipCache: true })
    }, 60_000)
  }

  public getLoginMessage(): string {
    return this.getFeatureValue(getLoginMessageKey(assetVariant), '')
  }

  public getUserMessage(): string {
    return this.getFeatureValue(getUserMessageKey(assetVariant), '')
  }

  public getUserAnnouncement(): AnnouncementPayload | null {
    return this.getFeatureValue(getAnnouncementKey(assetVariant), null)
  }

  private getFeatureValue<T>(key: string, fallback: T): T {
    if (!this.client) {
      return fallback
    }

    return this.client.getFeatureValue(key, fallback, EMPTY_USER_CONTEXT) as T
  }
}
