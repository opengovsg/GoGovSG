import { snackbarVariants } from '../../../../util/types.js'
import { RootState } from './types.js'
import {
  CLOSE_SNACKBAR,
  RootActionType,
  SET_ERROR_MESSAGE,
  SET_INFO_MESSAGE,
  SET_SUCCESS_MESSAGE,
} from '../actions/types.js'

const initialState = {
  snackbarMessage: {
    message: '',
    variant: snackbarVariants.ERROR,
  },
}
const root: (
  state: RootState | undefined,
  action: RootActionType,
) => RootState = (state, action) => {
  const currentState = state ?? initialState
  let nextState = {}

  switch (action.type) {
    case CLOSE_SNACKBAR:
      nextState = {
        ...currentState,
        snackbarMessage: {
          message: '',
          variant: currentState.snackbarMessage.variant,
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
      return currentState
  }
  return { ...currentState, ...nextState }
}

export default root
