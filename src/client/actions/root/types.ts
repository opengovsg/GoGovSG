export const CLOSE_SNACKBAR = 'CLOSE_SNACKBAR'
export const SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE'
export const SET_INFO_MESSAGE = 'SET_INFO_MESSAGE'

export type CloseSnackbarAction = {
  type: typeof CLOSE_SNACKBAR
}

export type SetErrorMessageAction = {
  type: typeof SET_ERROR_MESSAGE
  payload: string
}
export type SetInfoMessageAction = {
  type: typeof SET_INFO_MESSAGE
  payload: string
}

export type RootActionType =
  | CloseSnackbarAction
  | SetErrorMessageAction
  | SetInfoMessageAction
