import { Dispatch } from 'redux'
import {
  LOAD_STATS,
  LoadStatsAction,
  SET_LINKS_TO_ROTATE,
  SetLinksToRotateAction,
} from './types'
import { get } from '../../app/util/requests'
import { LinksToRotate } from '../reducers/types'
import { GetReduxState } from '../../app/actions/types'

const setLinksToRotate: (payload: LinksToRotate) => SetLinksToRotateAction = (
  payload,
) => ({ type: SET_LINKS_TO_ROTATE, payload })

const getLinksToRotate = () => (
  dispatch: Dispatch<SetLinksToRotateAction>,
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
            dispatch<SetLinksToRotateAction>(setLinksToRotate(links))
          }
        })
      }
    })
  }
}

const loadStats = () => (dispatch: Dispatch<LoadStatsAction>) => {
  get('/api/stats').then((response) => {
    if (response.ok) {
      response.json().then((stats) => {
        dispatch<LoadStatsAction>({
          type: LOAD_STATS,
          payload: stats,
        })
      })
    }
  })
}

export default {
  getLinksToRotate,
  loadStats,
}
