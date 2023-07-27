import { ReduxPayloadAction } from '../../app/actions/types'

export type SgidAuthRedireectionUrl = (url: string) => boolean
export const SGID_AUTH_URL = 'SGID_AUTH_URL'

export type SgidAuthRedirectionAuthUrl = ReduxPayloadAction<
  typeof SGID_AUTH_URL,
  string | undefined
>
