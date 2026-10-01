import { injectable } from 'inversify'
import { CallbackParamsType, generators } from 'openid-client'
import { oneGovSgRedirectUri } from '../../../config.js'
import getOneGovSgClient from './OneGovSgClient.js'
import {
  OneGovSgService as OneGovSgServiceInterface,
  OneGovSgTransaction,
} from '../interfaces/index.js'

@injectable()
export class OneGovSgService implements OneGovSgServiceInterface {
  public createTransaction: () => OneGovSgTransaction = () => ({
    state: generators.state(),
    nonce: generators.nonce(),
    verifier: generators.codeVerifier(),
  })

  public getAuthorizationUrl: (
    transaction: OneGovSgTransaction,
  ) => Promise<string> = async ({ state, nonce, verifier }) => {
    const client = await getOneGovSgClient()
    return client.authorizationUrl({
      scope: 'openid email',
      state,
      nonce,
      code_challenge: generators.codeChallenge(verifier),
      code_challenge_method: 'S256',
    })
  }

  public handleCallback: (
    callbackParams: CallbackParamsType,
    transaction: OneGovSgTransaction,
  ) => Promise<string> = async (callbackParams, { state, nonce, verifier }) => {
    const client = await getOneGovSgClient()
    const tokenSet = await client.callback(
      oneGovSgRedirectUri,
      callbackParams,
      {
        state,
        nonce,
        code_verifier: verifier,
      },
    )
    // `sub` is the officer's normalised email and the permanent user key;
    // it is a required, verified claim, unlike `email` (guide steps 5-6).
    return tokenSet.claims().sub.trim().toLowerCase()
  }
}

export default OneGovSgService
