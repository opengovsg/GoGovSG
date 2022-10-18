import {
  LinkChangeSet,
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
  GET_LINK_HISTORY_FOR_USER_SUCCESS = 'GET_LINK_HISTORY_FOR_USER_SUCCESS',
  SET_TAGS = 'SET_TAGS',
  CLOSE_STATUS_BAR = 'CLOSE_STATUS_BAR',
  SET_STATUS_BAR_ERROR_MESSAGE = 'SET_STATUS_BAR_ERROR_MESSAGE',
  SET_STATUS_BAR_INFO_MESSAGE = 'SET_STATUS_BAR_INFO_MESSAGE',
  SET_STATUS_BAR_SUCCESS_MESSAGE = 'SET_STATUS_BAR_SUCCESS_MESSAGE',
}

export type SetUrlUploadStateAction = ReduxPayloadAction<
  UserAction.SET_URL_UPLOAD_STATE,
  boolean
>

export type SetFileUploadStateAction = ReduxPayloadAction<
  UserAction.SET_FILE_UPLOAD_STATE,
  boolean
>

export type SetUserMessageAction = ReduxPayloadAction<
  UserAction.SET_USER_MESSAGE,
  string
>

export type SetUserAnnouncementAction = ReduxPayloadAction<
  UserAction.SET_USER_ANNOUNCEMENT,
  {
    message: string | undefined
    title: string | undefined
    subtitle: string | undefined
    url: string | undefined
    image: string | undefined
  }
>

export type SetEditedContactEmailAction = ReduxPayloadAction<
  UserAction.SET_EDITED_CONTACT_EMAIL,
  {
    shortUrl: string
    editedContactEmail: string
  }
>

export type SetEditedDescriptionAction = ReduxPayloadAction<
  UserAction.SET_EDITED_DESCRIPTION,
  {
    shortUrl: string
    editedDescription: string
  }
>

export type SetLastCreatedLinkAction = ReduxPayloadAction<
  UserAction.SET_LAST_CREATED_LINK,
  string
>

export type WipeUserStateAction = ReduxAction<UserAction.WIPE_USER_STATE>

export type IsFetchingUrlsAction = ReduxPayloadAction<
  UserAction.IS_FETCHING_URLS,
  boolean
>

export type CreateUrlSuccessAction = ReduxAction<UserAction.CREATE_URL_SUCCESS>

export type GetUrlsForUserSuccessAction = ReduxPayloadAction<
  UserAction.GET_URLS_FOR_USER_SUCCESS,
  Array<UrlType>
>

export type OpenCreateUrlModalAction =
  ReduxAction<UserAction.OPEN_CREATE_URL_MODAL>

export type CloseCreateUrlModalAction =
  ReduxAction<UserAction.CLOSE_CREATE_URL_MODAL>

export type SetShortUrlAction = ReduxPayloadAction<
  UserAction.SET_SHORT_URL,
  string
>

export type SetLongUrlAction = ReduxPayloadAction<
  UserAction.SET_LONG_URL,
  string
>

export type SetEditedLongUrlAction = ReduxPayloadAction<
  UserAction.SET_EDITED_LONG_URL,
  {
    shortUrl: string
    editedLongUrl: string
  }
>

export type SetRandomShortUrlAction = ReduxPayloadAction<
  UserAction.SET_RANDOM_SHORT_URL,
  string
>

export type ResetUserStateAction = ReduxAction<UserAction.RESET_USER_STATE>

export type ToggleUrlStateSuccessAction = ReduxPayloadAction<
  UserAction.TOGGLE_URL_STATE_SUCCESS,
  {
    shortUrl: string
    toState: UrlState
  }
>

export type SetUrlTableConfigAction = ReduxPayloadAction<
  UserAction.SET_URL_TABLE_CONFIG,
  Partial<UrlTableConfig>
>

export type UpdateUrlCountAction = ReduxPayloadAction<
  UserAction.UPDATE_URL_COUNT,
  number
>

export type SetIsUploadingAction = ReduxPayloadAction<
  UserAction.SET_IS_UPLOADING,
  boolean
>

export type SetUploadFileErrorAction = ReduxPayloadAction<
  UserAction.SET_UPLOAD_FILE_ERROR,
  string
>

export type SetCreateShortLinkErrorAction = ReduxPayloadAction<
  UserAction.SET_CREATE_SHORT_LINK_ERROR,
  string
>

export type SetUrlFilterAction = ReduxPayloadAction<
  UserAction.SET_URL_FILTER,
  UrlTableFilterConfig
>

export type GetLinkHistoryForUserSuccessAction = ReduxPayloadAction<
  UserAction.GET_LINK_HISTORY_FOR_USER_SUCCESS,
  {
    linkHistory: Array<LinkChangeSet>
    totalCount: number
  }
>

export type SetTagsAction = ReduxPayloadAction<UserAction.SET_TAGS, string[]>

export type CloseStatusBarAction = ReduxAction<UserAction.CLOSE_STATUS_BAR>

export type SetStatusBarErrorMessageAction = ReduxPayloadAction<
  UserAction.SET_STATUS_BAR_ERROR_MESSAGE,
  {
    header: string
    body: string
  }
>

export type SetStatusBarInfoMessageAction = ReduxPayloadAction<
  UserAction.SET_STATUS_BAR_INFO_MESSAGE,
  {
    header: string
    body: string
  }
>

export type SetStatusBarSuccessMessageAction = ReduxPayloadAction<
  UserAction.SET_STATUS_BAR_SUCCESS_MESSAGE,
  {
    header: string
    body: string
  }
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
  | GetLinkHistoryForUserSuccessAction
  | SetTagsAction
  | CloseStatusBarAction
  | SetStatusBarErrorMessageAction
  | SetStatusBarInfoMessageAction
  | SetStatusBarSuccessMessageAction
