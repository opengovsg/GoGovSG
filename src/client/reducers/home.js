import { LOAD_STATS, SET_LINKS_TO_ROTATE } from '~/actions/types'

const initialState = {
  statistics: {
    userCount: null,
    linkCount: null,
    clickCount: null,
  },
}
const home = (state = initialState, action) => {
  let nextState = {}
  const { payload } = action

  switch (action.type) {
    case SET_LINKS_TO_ROTATE:
      nextState = {
        linksToRotate: payload,
      }
      break
    case LOAD_STATS:
      nextState = {
        statistics: payload,
      }
      break
    default:
      return state
  }
  return { ...state, ...nextState }
}

export default home
