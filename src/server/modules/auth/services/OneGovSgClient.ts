import { createPrivateKey } from 'crypto'
import { Client, Issuer } from 'openid-client'
import {
  oneGovSgClientId,
  oneGovSgIssuer,
  oneGovSgPrivateKeyPem,
  oneGovSgRedirectUri,
} from '../../../config.js'

let clientPromise: Promise<Client> | null = null

/**
 * Lazily discovers the one.gov.sg issuer and constructs a private_key_jwt
 * client, memoizing the result.
 */
const getOneGovSgClient = (): Promise<Client> => {
  if (!clientPromise) {
    clientPromise = Issuer.discover(oneGovSgIssuer).then((issuer) => {
      // Guide step 1: the discovery document's issuer must match ours
      // exactly. openid-client only enforces this for webfinger lookups.
      if (issuer.metadata.issuer !== oneGovSgIssuer) {
        throw new Error(
          `one.gov.sg discovery issuer mismatch: ${issuer.metadata.issuer}`,
        )
      }
      return new issuer.Client(
        {
          client_id: oneGovSgClientId,
          redirect_uris: [oneGovSgRedirectUri],
          response_types: ['code'],
          token_endpoint_auth_method: 'private_key_jwt',
          token_endpoint_auth_signing_alg: 'RS256',
          id_token_signed_response_alg: 'RS256',
        },
        {
          // Node (18+) supports exporting a KeyObject as 'jwk', but the
          // @types/node version pinned here predates that overload.
          keys: [
            (createPrivateKey(oneGovSgPrivateKeyPem) as any).export({
              format: 'jwk',
            }),
          ],
        },
      )
    })
    // A failed discovery must not be cached, or one transient outage would
    // break login until the process restarts.
    clientPromise.catch(() => {
      clientPromise = null
    })
  }
  return clientPromise
}

export default getOneGovSgClient
