import { LOAD_STATS } from '~/actions/types'

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
    case LOAD_STATS:
      nextState = {
        statistics: payload,
      }
      break
    default:
      return state
  }
  return Object.assign({}, state, nextState)
}

export default home
