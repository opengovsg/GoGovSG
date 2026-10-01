// The registered initiate_login_uri is https://<host>/#/login, a frontend URL
// so that a Menlo-isolated one.gov.sg hands the navigation to the local
// browser before any transaction cookie is set. one.gov.sg appends `iss` to
// it, which lands in the real query (/?iss=…#/login) if appended with URL
// APIs, or inside the fragment (/#/login?iss=…) if string-concatenated, so
// check both. The value is checked against the configured issuer server-side.
export const initiatedLoginIssuer = (
  hashSearch: string,
  pageSearch: string,
): string | null =>
  new URLSearchParams(hashSearch).get('iss') ??
  new URLSearchParams(pageSearch).get('iss')

export const initiatedLoginHref = (iss: string): string =>
  `/api/sso/login?${new URLSearchParams({ iss })}`
