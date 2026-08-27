import { GrowthBookClient } from '@growthbook/growthbook'
import { injectable } from 'inversify'

import assetVariant from '../../shared/util/asset-variant'
import {
  AnnouncementPayload,
  getAnnouncementKey,
  getLoginMessageKey,
  getUserMessageKey,
} from '../lib/growthbook'
import { growthbookApiHost, growthbookClientKey, logger } from '../config'
import { OperatorCopyService } from './OperatorCopyService'

const EMPTY_USER_CONTEXT = { attributes: {} }
const INIT_TIMEOUT_MS = 3000
const POLLING_INTERVAL_MS = 60_000

@injectable()
export class GrowthBookOperatorCopyService implements OperatorCopyService {
  private client: GrowthBookClient | null = null

  public async init(): Promise<void> {
    if (!growthbookClientKey) {
      logger.warn(
        'GROWTHBOOK_CLIENT_KEY is not set; login snackbar, banner, and announcement will be empty.',
      )
      return
    }

    this.client = new GrowthBookClient({
      apiHost: growthbookApiHost,
      clientKey: growthbookClientKey,
    })

    const result = await this.client.init({
      timeout: INIT_TIMEOUT_MS,
    })

    if (!result.success) {
      logger.warn(
        `GrowthBook init did not succeed (source=${result.source}); operator copy will be empty until a poll succeeds.`,
      )
    }

    setInterval(() => {
      void this.client?.refreshFeatures({ skipCache: true })
    }, POLLING_INTERVAL_MS)
  }

  public getLoginMessage(): string {
    if (!this.client) {
      return ''
    }

    return this.client.getFeatureValue(
      getLoginMessageKey(assetVariant),
      '',
      EMPTY_USER_CONTEXT,
    )
  }

  public getUserMessage(): string {
    if (!this.client) {
      return ''
    }

    return this.client.getFeatureValue(
      getUserMessageKey(assetVariant),
      '',
      EMPTY_USER_CONTEXT,
    )
  }

  public getUserAnnouncement(): AnnouncementPayload | null {
    if (!this.client) {
      return null
    }

    return this.client.getFeatureValue(
      getAnnouncementKey(assetVariant),
      null,
      EMPTY_USER_CONTEXT,
    )
  }
}

export default GrowthBookOperatorCopyService
