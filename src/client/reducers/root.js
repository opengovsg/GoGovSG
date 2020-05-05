import {
  CLOSE_SNACKBAR,
  SET_ERROR_MESSAGE,
  SET_INFO_MESSAGE,
} from '~/actions/types'
import { snackbarVariants } from '~/util/types'

const initialState = {
  snackbarMessage: {
    message: '',
    variant: snackbarVariants.ERROR,
  },
}
const root = (state = initialState, action) => {
  let nextState = {}
  const { payload } = action

  switch (action.type) {
    case CLOSE_SNACKBAR:
      nextState = {
        ...state,
        snackbarMessage: {
          message: '',
          variant: state.snackbarMessage.variant,
        },
      }
      break
    case SET_ERROR_MESSAGE:
      nextState = {
        snackbarMessage: {
          message: payload,
          variant: snackbarVariants.ERROR,
        },
      }
      break
    case SET_INFO_MESSAGE:
      nextState = {
        snackbarMessage: {
          message: payload,
          variant: snackbarVariants.INFO,
        },
      }
      break

    default:
      return state
  }
  return { ...state, ...nextState }
}

export default root
