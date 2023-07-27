import SgidClient, { generatePkcePair } from '@opengovsg/sgid-client'

interface SgidServiceOption {
  clientId: string
  clientSecret: string
  privateKey: string
  redirectUri: string
  hostname: string
}

export const SGID_LOGIN_OAUTH_STATE = 'login'

class SgidService {
  // SGID client will be null for other domains like edu, health
  // so we will need to handle cases for those as well, so that
  // they continue to work in prod without sgid client being initialised
  private sgidClient: SgidClient | null

  constructor({
    clientId,
    clientSecret,
    privateKey,
    redirectUri,
    hostname,
  }: SgidServiceOption) {
    try {
      this.sgidClient = new SgidClient({
        clientId,
        clientSecret,
        privateKey,
        redirectUri,
        hostname,
      })
    } catch (e) {
      this.sgidClient = null
    }
  }

  /**
   * Fetches the url via sgid SDK.
   */
  authorizationUrl(): { url: string; codeVerifier: string; nonce?: string } {
    if (!this.sgidClient) {
      throw new Error('SGID client not initialised')
    }
    try {
      const { codeChallenge, codeVerifier } = generatePkcePair()
      const { url, nonce } = this.sgidClient.authorizationUrl({
        state: SGID_LOGIN_OAUTH_STATE,
        scope: ['openid', 'ogpofficerinfo.work_email'].join(' '),
        codeChallenge,
      })
      return { url, codeVerifier, nonce }
    } catch (e) {
      throw new Error('Error retrieving url via sgid-client')
    }
  }

  /**
   * Fetches the token via sgid SDK.
   */
  async callback(code: string, nonce: string, codeVerifier: string) {
    if (!code || !this.sgidClient)
      throw Error(`code cannot be empty or sgid client not initialised`)
    try {
      const { sub, accessToken } = await this.sgidClient.callback({
        code,
        nonce,
        codeVerifier,
      })
      return { sub, accessToken }
    } catch (e) {
      throw new Error('Error retrieving access token via sgid-client')
    }
  }

  /**
   * Fetches the user info via sgid SDK.
   */
  async userinfo(accessToken: string, sub: string) {
    if (!accessToken || !this.sgidClient)
      throw Error(`accessToken cannot be empty`)
    try {
      return await this.sgidClient.userinfo({ accessToken, sub })
    } catch (e) {
      throw new Error('Error retrieving user info via sgid-client')
    }
  }
}

// Initialised the sgidService object with the different environments
export const SgidAuthService = new SgidService({
  clientId: process.env.CLIENT_ID as string,
  clientSecret: process.env.CLIENT_SECRET as string,
  privateKey: process.env.PRIVATE_KEY as string,
  redirectUri: 'http://localhost:3000/api/sgidLogin/authenticate',
  hostname: process.env.SGID_API_HOSTNAME as string,
})
