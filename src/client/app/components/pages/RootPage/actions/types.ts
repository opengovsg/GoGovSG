import { ReduxAction, ReduxPayloadAction } from '../../../../actions/types'

export const CLOSE_SNACKBAR = 'CLOSE_SNACKBAR'
export const SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE'
export const SET_INFO_MESSAGE = 'SET_INFO_MESSAGE'
export const SET_SUCCESS_MESSAGE = 'SET_SUCCESS_MESSAGE'

export type CloseSnackbarAction = ReduxAction<typeof CLOSE_SNACKBAR>

export type SetErrorMessageAction = ReduxPayloadAction<
  typeof SET_ERROR_MESSAGE,
  string
>

export type SetInfoMessageAction = ReduxPayloadAction<
  typeof SET_INFO_MESSAGE,
  string
>

export type SetSuccessMessageAction = ReduxPayloadAction<
  typeof SET_SUCCESS_MESSAGE,
  string
>

export type RootActionType =
  | CloseSnackbarAction
  | SetErrorMessageAction
  | SetInfoMessageAction
  | SetSuccessMessageAction
