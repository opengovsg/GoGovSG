import { ReduxAction, ReduxPayloadAction } from '../../app/actions/types'

export const USER_HAS_API_KEY = 'USER_HAS_API_KEY'
export const USER_HAS_NO_API_KEY = 'USER_HAS_NO_API_KEY'
export const CLOSE_API_KEY_MODAL = 'CLOSE_API_KEY_MODAL'
export const OPEN_API_KEY_MODAL = 'OPEN_API_KEY_MODAL'
export const GENERATE_API_KEY_SUCCESSFULLY = 'GENERATE_API_KEY_SUCCESSFULLY'

export type UserHasApiKeyAction = ReduxAction<typeof USER_HAS_API_KEY>

export type UserHasNoApiKeyAction = ReduxAction<typeof USER_HAS_NO_API_KEY>

export type CloseApiKeyModalAction = ReduxAction<typeof CLOSE_API_KEY_MODAL>

export type OpenApiKeyModalAction = ReduxAction<typeof OPEN_API_KEY_MODAL>

export type GenerateApiKeySuccessfullyAction = ReduxPayloadAction<
  typeof GENERATE_API_KEY_SUCCESSFULLY,
  {
    apiKey: string
  }
>

export type ApiKeyActionType =
  | UserHasApiKeyAction
  | UserHasNoApiKeyAction
  | CloseApiKeyModalAction
  | OpenApiKeyModalAction
  | GenerateApiKeySuccessfullyAction
