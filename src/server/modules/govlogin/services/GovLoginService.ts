import { GovLoginClient } from '@opengovsg/gov-login-client'
import { injectable } from 'inversify'
import { govLogin, logger } from '../../../config'

import * as interfaces from '../interfaces'

@injectable()
export class GovLoginService implements interfaces.GovLoginService {
  private client: GovLoginClient

  constructor() {
    this.client = new GovLoginClient({
      clientId: govLogin.clientId,
      clientSecret: govLogin.clientSecret,
      redirectUri: govLogin.redirectUri,
      hostname: 'https://gov-login-stg.beta.gov.sg',
    })
  }

  createRedirectUrl(): string {
    const result = this.client.authorizationUrl('', 'openid', null)
    if (typeof result.url === 'string') {
      return result.url
    }
    logger.error(`GovLogin authorization URL is not a string`)
    throw new Error('GovLogin authorization URL is not a string')
  }

  retrieveAccessToken(
    code: string,
  ): Promise<{ sub: string; accessToken: string }> {
    return this.client.callback(code, null)
  }
}

export default GovLoginService
