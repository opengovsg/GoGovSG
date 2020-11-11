import { snackbarVariants } from '../../../util/types'
import { RootState } from './types'
import {
  CLOSE_SNACKBAR,
  RootActionType,
  SET_ERROR_MESSAGE,
  SET_INFO_MESSAGE,
  SET_SUCCESS_MESSAGE,
} from '../actions/types'

const initialState = {
  snackbarMessage: {
    message: '',
    variant: snackbarVariants.ERROR,
  },
}
const root: (state: RootState, action: RootActionType) => RootState = (
  state = initialState,
  action: RootActionType,
) => {
  let nextState = {}

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
    case SET_SUCCESS_MESSAGE:
      nextState = {
        snackbarMessage: {
          message: action.payload,
          variant: snackbarVariants.SUCCESS,
        },
      }
      break
    case SET_ERROR_MESSAGE:
      nextState = {
        snackbarMessage: {
          message: action.payload,
          variant: snackbarVariants.ERROR,
        },
      }
      break
    case SET_INFO_MESSAGE:
      nextState = {
        snackbarMessage: {
          message: action.payload,
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
