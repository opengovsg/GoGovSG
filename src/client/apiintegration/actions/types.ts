import { ReduxPayloadAction } from '../../app/actions/types'

export const USER_HAS_API_KEY = 'USER_HAS_API_KEY'
export const USER_HAS_NO_API_KEY = 'USER_HAS_NO_API_KEY'

export type UserHasApiKeyAction = ReduxPayloadAction<
  typeof USER_HAS_API_KEY,
  boolean
>

export type UserHasNoApiKeyAction = ReduxPayloadAction<
  typeof USER_HAS_NO_API_KEY,
  boolean
>

export type ApiKeyActionType = UserHasApiKeyAction | UserHasNoApiKeyAction
