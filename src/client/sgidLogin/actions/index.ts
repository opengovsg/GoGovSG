import { get } from '../../app/util/requests'
import { GetReduxState } from '../../app/actions/types'

const getAuthUrl = () => (_getState: GetReduxState) => {
  get('/api/sgidLogin/authurl').then(async (response) => {
    if (response.ok) {
      const text = await response.text()
      window.open(text, '_self')
    }
  })
}

export default {
  getAuthUrl,
}
