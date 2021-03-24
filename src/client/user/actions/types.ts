import {
  UrlState,
  UrlTableConfig,
  UrlTableFilterConfig,
  UrlType,
} from '../reducers/types'

import { ReduxAction, ReduxPayloadAction } from '../../app/actions/types'

/* User actions */

export enum UserAction {
  CREATE_URL_SUCCESS = 'CREATE_URL_SUCCESS',
  GET_URLS_FOR_USER_SUCCESS = 'GET_URLS_FOR_USER_SUCCESS',
  OPEN_CREATE_URL_MODAL = 'OPEN_CREATE_URL_MODAL',
  CLOSE_CREATE_URL_MODAL = 'CLOSE_CREATE_URL_MODAL',
  SET_SHORT_URL = 'SET_SHORT_URL',
  SET_LONG_URL = 'SET_LONG_URL',
  SET_EDITED_LONG_URL = 'SET_EDITED_LONG_URL',
  SET_RANDOM_SHORT_URL = 'SET_RANDOM_SHORT_URL',
  RESET_USER_STATE = 'RESET_USER_STATE',
  TOGGLE_URL_STATE_SUCCESS = 'TOGGLE_URL_STATE_SUCCESS',
  SET_URL_TABLE_CONFIG = 'SET_URL_TABLE_CONFIG',
  SET_URL_FILTER = 'SET_URL_FILTER',
  UPDATE_URL_COUNT = 'UPDATE_URL_COUNT',
  IS_FETCHING_URLS = 'IS_FETCHING_URLS',
  WIPE_USER_STATE = 'WIPE_USER_STATE',
  SET_IS_UPLOADING = 'SET_IS_UPLOADING',
  SET_UPLOAD_FILE_ERROR = 'SET_UPLOAD_FILE_ERROR',
  SET_CREATE_SHORT_LINK_ERROR = 'SET_CREATE_SHORT_LINK_ERROR',
  SET_LAST_CREATED_LINK = 'SET_LAST_CREATED_LINK',
  SET_EDITED_CONTACT_EMAIL = 'SET_EDITED_CONTACT_EMAIL',
  SET_EDITED_DESCRIPTION = 'SET_EDITED_DESCRIPTION',
  SET_USER_MESSAGE = 'SET_USER_MESSAGE',
  SET_USER_ANNOUNCEMENT = 'SET_USER_ANNOUNCEMENT',
  SET_URL_UPLOAD_STATE = 'SET_URL_UPLOAD_STATE',
  SET_FILE_UPLOAD_STATE = 'SET_FILE_UPLOAD_STATE',
}

export type SetUrlUploadStateAction = ReduxPayloadAction<
  typeof UserAction.SET_URL_UPLOAD_STATE,
  boolean
>

export type SetFileUploadStateAction = ReduxPayloadAction<
  typeof UserAction.SET_FILE_UPLOAD_STATE,
  boolean
>

export type SetUserMessageAction = ReduxPayloadAction<
  typeof UserAction.SET_USER_MESSAGE,
  string
>

export type SetUserAnnouncementAction = ReduxPayloadAction<
  typeof UserAction.SET_USER_ANNOUNCEMENT,
  {
    message: string | undefined
    title: string | undefined
    subtitle: string | undefined
    url: string | undefined
    image: string | undefined
  }
>

export type SetEditedContactEmailAction = ReduxPayloadAction<
  typeof UserAction.SET_EDITED_CONTACT_EMAIL,
  {
    shortUrl: string
    editedContactEmail: string
  }
>

export type SetEditedDescriptionAction = ReduxPayloadAction<
  typeof UserAction.SET_EDITED_DESCRIPTION,
  {
    shortUrl: string
    editedDescription: string
  }
>

export type SetLastCreatedLinkAction = ReduxPayloadAction<
  typeof UserAction.SET_LAST_CREATED_LINK,
  string
>

export type WipeUserStateAction = ReduxAction<typeof UserAction.WIPE_USER_STATE>

export type IsFetchingUrlsAction = ReduxPayloadAction<
  typeof UserAction.IS_FETCHING_URLS,
  boolean
>

export type CreateUrlSuccessAction = ReduxAction<
  typeof UserAction.CREATE_URL_SUCCESS
>

export type GetUrlsForUserSuccessAction = ReduxPayloadAction<
  typeof UserAction.GET_URLS_FOR_USER_SUCCESS,
  Array<UrlType>
>

export type OpenCreateUrlModalAction = ReduxAction<
  typeof UserAction.OPEN_CREATE_URL_MODAL
>

export type CloseCreateUrlModalAction = ReduxAction<
  typeof UserAction.CLOSE_CREATE_URL_MODAL
>

export type SetShortUrlAction = ReduxPayloadAction<
  typeof UserAction.SET_SHORT_URL,
  string
>

export type SetLongUrlAction = ReduxPayloadAction<
  typeof UserAction.SET_LONG_URL,
  string
>

export type SetEditedLongUrlAction = ReduxPayloadAction<
  typeof UserAction.SET_EDITED_LONG_URL,
  {
    shortUrl: string
    editedLongUrl: string
  }
>

export type SetRandomShortUrlAction = ReduxPayloadAction<
  typeof UserAction.SET_RANDOM_SHORT_URL,
  string
>

export type ResetUserStateAction = ReduxAction<
  typeof UserAction.RESET_USER_STATE
>

export type ToggleUrlStateSuccessAction = ReduxPayloadAction<
  typeof UserAction.TOGGLE_URL_STATE_SUCCESS,
  {
    shortUrl: string
    toState: UrlState
  }
>

export type SetUrlTableConfigAction = ReduxPayloadAction<
  typeof UserAction.SET_URL_TABLE_CONFIG,
  UrlTableConfig
>

export type UpdateUrlCountAction = ReduxPayloadAction<
  typeof UserAction.UPDATE_URL_COUNT,
  number
>

export type SetIsUploadingAction = ReduxPayloadAction<
  typeof UserAction.SET_IS_UPLOADING,
  boolean
>

export type SetUploadFileErrorAction = ReduxPayloadAction<
  typeof UserAction.SET_UPLOAD_FILE_ERROR,
  string
>

export type SetCreateShortLinkErrorAction = ReduxPayloadAction<
  typeof UserAction.SET_CREATE_SHORT_LINK_ERROR,
  string
>

export type SetUrlFilterAction = ReduxPayloadAction<
  typeof UserAction.SET_URL_FILTER,
  UrlTableFilterConfig
>

export type UserActionType =
  | UpdateUrlCountAction
  | SetUrlTableConfigAction
  | ToggleUrlStateSuccessAction
  | ResetUserStateAction
  | SetRandomShortUrlAction
  | SetEditedLongUrlAction
  | SetLongUrlAction
  | SetShortUrlAction
  | CloseCreateUrlModalAction
  | OpenCreateUrlModalAction
  | GetUrlsForUserSuccessAction
  | CreateUrlSuccessAction
  | WipeUserStateAction
  | IsFetchingUrlsAction
  | SetIsUploadingAction
  | IsFetchingUrlsAction
  | SetCreateShortLinkErrorAction
  | SetUploadFileErrorAction
  | SetLastCreatedLinkAction
  | SetUrlFilterAction
  | SetEditedContactEmailAction
  | SetEditedDescriptionAction
  | SetUserMessageAction
  | SetUserAnnouncementAction
  | SetUrlUploadStateAction
  | SetFileUploadStateAction
