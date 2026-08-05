import { HomeState } from './types'
import {
  HomeActionType,
  LOAD_STATS,
  SET_LINKS_TO_ROTATE,
} from '../actions/types'

const initialState: HomeState = {
  statistics: {
    userCount: 0,
    linkCount: 0,
    clickCount: 0,
  },
}
const home = (
  state: HomeState | undefined,
  action: HomeActionType,
): HomeState => {
  const currentState = state ?? initialState
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
      return currentState
  }
  return { ...currentState, ...nextState }
}

export default home
