import {
  CLOSE_SNACKBAR,
  SET_ERROR_MESSAGE,
  SET_INFO_MESSAGE,
} from '~/actions/types'

const closeSnackbar = () => ({ type: CLOSE_SNACKBAR })
const setErrorMessage = (message) => ({
  type: SET_ERROR_MESSAGE,
  payload: message,
})
const setInfoMessage = (message) => ({
  type: SET_INFO_MESSAGE,
  payload: message,
})

export default {
  closeSnackbar,
  setErrorMessage,
  setInfoMessage,
}
