import { injectable } from 'inversify'
import {
  authorizationCodeGrant,
  buildAuthorizationUrl,
  calculatePKCECodeChallenge,
  randomNonce,
  randomPKCECodeVerifier,
  randomState,
} from 'openid-client'
import { oneGovSgRedirectUri } from '../../../config.js'
import getOneGovSgClient from './OneGovSgClient.js'
import {
  OneGovSgCallbackParams,
  OneGovSgService as OneGovSgServiceInterface,
  OneGovSgTransaction,
} from '../interfaces/index.js'

@injectable()
export class OneGovSgService implements OneGovSgServiceInterface {
  public createTransaction: () => OneGovSgTransaction = () => ({
    state: randomState(),
    nonce: randomNonce(),
    verifier: randomPKCECodeVerifier(),
  })

  public getAuthorizationUrl: (
    transaction: OneGovSgTransaction,
  ) => Promise<string> = async ({ state, nonce, verifier }) => {
    const config = await getOneGovSgClient()
    return buildAuthorizationUrl(config, {
      redirect_uri: oneGovSgRedirectUri,
      scope: 'openid email',
      state,
      nonce,
      code_challenge: await calculatePKCECodeChallenge(verifier),
      code_challenge_method: 'S256',
    }).href
  }

  public handleCallback: (
    callbackParams: OneGovSgCallbackParams,
    transaction: OneGovSgTransaction,
  ) => Promise<string> = async (callbackParams, { state, nonce, verifier }) => {
    const config = await getOneGovSgClient()
    // openid-client reads the authorization response off the redirect URL.
    const currentUrl = new URL(oneGovSgRedirectUri)
    currentUrl.search = new URLSearchParams(callbackParams).toString()
    const tokens = await authorizationCodeGrant(config, currentUrl, {
      expectedState: state,
      expectedNonce: nonce,
      pkceCodeVerifier: verifier,
    })
    // `sub` is the officer's normalised email and the permanent user key;
    // it is a required, verified claim, unlike `email` (guide steps 5-6).
    const sub = tokens.claims()?.sub
    if (!sub) {
      throw new Error('one.gov.sg id_token missing sub claim')
    }
    return sub.trim().toLowerCase()
  }
}

export default OneGovSgService
