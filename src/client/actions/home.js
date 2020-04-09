import { LOAD_STATS } from '~/actions/types'
import { get } from '../util/requests'

const loadStats = () => (dispatch, getState) => {
  const { home: { statistics } } = getState()
  if (
    statistics.userCount === null
    || statistics.linkCount === null
    || statistics.clickCount === null
  ) {
    get('/api/stats').then((response) => {
      if (response.ok) {
        response.json().then((stats) => {
          dispatch({
            type: LOAD_STATS,
            payload: stats,
          })
        })
      }
    })
  }
}

export default {
  loadStats,
}
