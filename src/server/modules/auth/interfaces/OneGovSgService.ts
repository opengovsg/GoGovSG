import { CallbackParamsType } from 'openid-client'

export type OneGovSgTransaction = {
  state: string
  nonce: string
  verifier: string
  /** Local hash route to land on after login, e.g. `/user/links`. */
  next?: string
}

export interface OneGovSgService {
  /**
   * Generates a fresh PKCE verifier/state/nonce transaction for a login
   * attempt. The controller holds it in a short-lived, httpOnly, signed
   * cookie (not encrypted: a leaked verifier is useless without the code).
   */
  createTransaction(): OneGovSgTransaction

  /**
   * Builds the one.gov.sg authorization URL to redirect the user to,
   * bound to the given transaction.
   */
  getAuthorizationUrl(transaction: OneGovSgTransaction): Promise<string>

  /**
   * Exchanges the authorization code for tokens using private_key_jwt,
   * verifies the id_token (signature, iss, aud, nonce, exp/iat), and
   * returns the verified officer's email (the `sub` claim).
   * Throws if any check fails.
   */
  handleCallback(
    callbackParams: CallbackParamsType,
    transaction: OneGovSgTransaction,
  ): Promise<string>
}
