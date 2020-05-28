import {
  CLOSE_SNACKBAR,
  CloseSnackbarAction,
  SET_ERROR_MESSAGE,
  SET_INFO_MESSAGE,
  SetErrorMessageAction,
  SetInfoMessageAction,
} from './types'

const closeSnackbar: () => CloseSnackbarAction = () => ({
  type: CLOSE_SNACKBAR,
})
const setErrorMessage: (message: string) => SetErrorMessageAction = (
  message: string,
) => ({
  type: SET_ERROR_MESSAGE,
  payload: message,
})
const setInfoMessage: (message: string) => SetInfoMessageAction = (
  message: string,
) => ({
  type: SET_INFO_MESSAGE,
  payload: message,
})

export default {
  closeSnackbar,
  setErrorMessage,
  setInfoMessage,
}
