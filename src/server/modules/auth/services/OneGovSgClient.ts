import { createPrivateKey } from 'crypto'
import { Configuration, PrivateKeyJwt, discovery } from 'openid-client'
import {
  oneGovSgClientId,
  oneGovSgIssuer,
  oneGovSgPrivateKeyPem,
  oneGovSgRedirectUri,
} from '../../../config.js'

let configPromise: Promise<Configuration> | null = null

/**
 * Lazily discovers the one.gov.sg issuer and constructs a private_key_jwt
 * client configuration, memoizing the result.
 */
const getOneGovSgClient = (): Promise<Configuration> => {
  if (!configPromise) {
    // Guide step 1: discovery() rejects if the document's issuer does not
    // match the one we asked for, so no separate check is needed.
    configPromise = discovery(
      new URL(oneGovSgIssuer),
      oneGovSgClientId,
      {
        redirect_uris: [oneGovSgRedirectUri],
        response_types: ['code'],
        id_token_signed_response_alg: 'RS256',
      },
      PrivateKeyJwt(
        // @types/node's webcrypto.CryptoKey and the DOM lib's CryptoKey
        // (which openid-client's types refer to) disagree on KeyUsage.
        createPrivateKey(oneGovSgPrivateKeyPem).toCryptoKey(
          { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
          false,
          ['sign'],
        ) as CryptoKey,
      ),
    )
    // A failed discovery must not be cached, or one transient outage would
    // break login until the process restarts.
    configPromise.catch(() => {
      configPromise = null
    })
  }
  return configPromise
}

export default getOneGovSgClient
