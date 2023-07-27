import { Dispatch } from 'redux'

import { SGID_AUTH_URL, SgidAuthRedirectionAuthUrl } from './types'
import { get } from '../../app/util/requests'
import { GetReduxState } from '../../app/actions/types'

const getAuthRedirectionUrl =
  () =>
  (
    dispatch: Dispatch<SgidAuthRedirectionAuthUrl>,
    _getState: GetReduxState,
  ) => {
    get('/api/sgidLogin/authurl').then(async (response) => {
      if (response.ok) {
        const text = await response.text()

        dispatch<SgidAuthRedirectionAuthUrl>({
          type: SGID_AUTH_URL,
          payload: text,
        })
        window.open(text)
      }
    })
  }

export default {
  getAuthRedirectionUrl,
}
