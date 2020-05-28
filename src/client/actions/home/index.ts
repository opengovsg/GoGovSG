import { Dispatch } from 'redux'
import {
  LOAD_STATS,
  SET_LINKS_TO_ROTATE,
  SetLinksToRotateAction,
} from './types'
import { get } from '../../util/requests'
import { LinksToRotate } from '../../reducers/home/types'
import { AllActions, GetReduxState } from '../types'

const setLinksToRotate: (payload: LinksToRotate) => SetLinksToRotateAction = (
  payload,
) => ({ type: SET_LINKS_TO_ROTATE, payload })

const getLinksToRotate = () => (
  dispatch: Dispatch<AllActions>,
  getState: GetReduxState,
) => {
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

const loadStats = () => (
  dispatch: Dispatch<AllActions>,
  getState: GetReduxState,
) => {
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
