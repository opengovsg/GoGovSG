import { LOAD_STATS, SET_LINKS_TO_ROTATE } from '~/actions/types'
import { get } from '../util/requests'

const setLinksToRotate = (payload) => ({ type: SET_LINKS_TO_ROTATE, payload })

const getLinksToRotate = () => (dispatch, getState) => {
  const { home } = getState()
  const { linksToRotate } = home
  if (!linksToRotate) {
    get('/api/links').then((response) => {
      if (response.ok) {
        response.text().then((extractedString) => {
          if (extractedString) {
            const links = extractedString.split(',').map((link) => link.trim())
            dispatch(setLinksToRotate(links))
          }
        })
      }
    })
  }
}

const loadStats = () => (dispatch, getState) => {
  const {
    home: { statistics },
  } = getState()
  if (
    statistics.userCount === null ||
    statistics.linkCount === null ||
    statistics.clickCount === null
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
  getLinksToRotate,
  loadStats,
}
