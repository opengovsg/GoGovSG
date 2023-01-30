export interface GovLoginService {
  /**
   * Create a URL to GovLogin which is used to redirect the user back for completion of the login flow.
   */
  createRedirectUrl(): string

  /**
   * Given the OIDC authorization code from sgID, obtain the corresponding
   * access token, which will be used later to retrieve user information.
   * @param code The authorization code initially obtained from GovLogin.
   */
  retrieveAccessToken(
    code: string,
  ): Promise<{ sub: string; accessToken: string }>
}
