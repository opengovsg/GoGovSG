import { HomeState } from './types'
import {
  HomeActionType,
  LOAD_STATS,
  SET_LINKS_TO_ROTATE,
} from '../../actions/home/types'

const initialState: HomeState = {
  statistics: {
    userCount: null,
    linkCount: null,
    clickCount: null,
  },
}
const home = (
  state: HomeState = initialState,
  action: HomeActionType,
): HomeState => {
  let nextState = {}

  switch (action.type) {
    case SET_LINKS_TO_ROTATE:
      nextState = {
        linksToRotate: action.payload,
      }
      break
    case LOAD_STATS:
      nextState = {
        statistics: action.payload,
      }
      break
    default:
      return state
  }
  return { ...state, ...nextState }
}

export default home
