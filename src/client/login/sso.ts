// Two one.gov.sg entry points land on the frontend, not the API, so that a
// Menlo-isolated one.gov.sg hands the navigation to the local browser first.
//
// Launch: the registered initiate_login_uri is https://<host>/#/login.
// one.gov.sg appends `iss` to it, which lands in the real query
// (/?iss=…#/login) if appended with URL APIs, or inside the fragment
// (/#/login?iss=…) if string-concatenated, so check both. The value is checked
// against the configured issuer server-side.
export const initiatedLoginIssuer = (
  hashSearch: string,
  pageSearch: string,
): string | null =>
  new URLSearchParams(hashSearch).get('iss') ??
  new URLSearchParams(pageSearch).get('iss')

export const initiatedLoginHref = (iss: string): string =>
  `/api/sso/login?${new URLSearchParams({ iss })}`

// Callback: the registered redirect_uri is the bare origin https://<host>/ (a
// redirect_uri can't carry a #fragment), so the authorization response lands
// in the real query. Forward it unchanged to the backend callback.
export const oneGovSgCallbackHref = (pageSearch: string): string | null => {
  const params = new URLSearchParams(pageSearch)
  return params.has('state') && (params.has('code') || params.has('error'))
    ? `/api/sso/callback?${params}`
    : null
}
