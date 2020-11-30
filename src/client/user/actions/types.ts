import {
  UrlState,
  UrlTableConfig,
  UrlTableFilterConfig,
  UrlType,
} from '../reducers/types'

/* User actions */
export const CREATE_URL_SUCCESS = 'CREATE_URL_SUCCESS'
export const GET_URLS_FOR_USER_SUCCESS = 'GET_URLS_FOR_USER_SUCCESS'
export const OPEN_CREATE_URL_MODAL = 'OPEN_CREATE_URL_MODAL'
export const CLOSE_CREATE_URL_MODAL = 'CLOSE_CREATE_URL_MODAL'
export const SET_SHORT_URL = 'SET_SHORT_URL'
export const SET_LONG_URL = 'SET_LONG_URL'
export const SET_EDITED_LONG_URL = 'SET_EDITED_LONG_URL'
export const SET_RANDOM_SHORT_URL = 'SET_RANDOM_SHORT_URL'
export const RESET_USER_STATE = 'RESET_USER_STATE'
export const TOGGLE_URL_STATE_SUCCESS = 'TOGGLE_URL_STATE_SUCCESS'
export const SET_URL_TABLE_CONFIG = 'SET_URL_TABLE_CONFIG'
export const SET_URL_FILTER = 'SET_URL_FILTER'
export const UPDATE_URL_COUNT = 'UPDATE_URL_COUNT'
export const IS_FETCHING_URLS = 'IS_FETCHING_URLS'
export const WIPE_USER_STATE = 'WIPE_USER_STATE'
export const SET_IS_UPLOADING = 'SET_IS_UPLOADING'
export const SET_UPLOAD_FILE_ERROR = 'SET_UPLOAD_FILE_ERROR'
export const SET_CREATE_SHORT_LINK_ERROR = 'SET_CREATE_SHORT_LINK_ERROR'
export const SET_LAST_CREATED_LINK = 'SET_LAST_CREATED_LINK'
export const SET_EDITED_CONTACT_EMAIL = 'SET_EDITED_CONTACT_EMAIL'
export const SET_EDITED_DESCRIPTION = 'SET_EDITED_DESCRIPTION'
export const SET_USER_MESSAGE = 'SET_USER_MESSAGE'
export const SET_USER_ANNOUNCEMENT = 'SET_USER_ANNOUNCEMENT'
export const SET_URL_UPLOAD_STATE = 'SET_URL_UPLOAD_STATE'
export const SET_FILE_UPLOAD_STATE = 'SET_FILE_UPLOAD_STATE'

export type SetUrlUploadStateAction = {
  type: typeof SET_URL_UPLOAD_STATE
  payload: boolean
}

export type SetFileUploadStateAction = {
  type: typeof SET_FILE_UPLOAD_STATE
  payload: boolean
}

export type SetUserMessageAction = {
  type: typeof SET_USER_MESSAGE
  payload: string
}

export type SetUserAnnouncementAction = {
  type: typeof SET_USER_ANNOUNCEMENT
  payload: {
    message: string | undefined
    title: string | undefined
    subtitle: string | undefined
    url: string | undefined
    image: string | undefined
  }
}

export type SetEditedContactEmailAction = {
  type: typeof SET_EDITED_CONTACT_EMAIL
  payload: {
    shortUrl: string
    editedContactEmail: string
  }
}

export type SetEditedDescriptionAction = {
  type: typeof SET_EDITED_DESCRIPTION
  payload: {
    shortUrl: string
    editedDescription: string
  }
}

export type SetLastCreatedLinkAction = {
  type: typeof SET_LAST_CREATED_LINK
  payload: string
}

export type WipeUserStateAction = {
  type: typeof WIPE_USER_STATE
}

export type IsFetchingUrlsAction = {
  type: typeof IS_FETCHING_URLS
  payload: boolean
}

export type CreateUrlSuccessAction = {
  type: typeof CREATE_URL_SUCCESS
}

export type GetUrlsForUserSuccessAction = {
  type: typeof GET_URLS_FOR_USER_SUCCESS
  payload: Array<UrlType>
}

export type OpenCreateUrlModalAction = {
  type: typeof OPEN_CREATE_URL_MODAL
}

export type CloseCreateUrlModalAction = {
  type: typeof CLOSE_CREATE_URL_MODAL
}

export type SetShortUrlAction = {
  type: typeof SET_SHORT_URL
  payload: string
}

export type SetLongUrlAction = {
  type: typeof SET_LONG_URL
  payload: string
}

export type SetEditedLongUrlAction = {
  type: typeof SET_EDITED_LONG_URL
  payload: {
    shortUrl: string
    editedLongUrl: string
  }
}

export type SetRandomShortUrlAction = {
  type: typeof SET_RANDOM_SHORT_URL
  payload: string
}

export type ResetUserStateAction = {
  type: typeof RESET_USER_STATE
}

export type ToggleUrlStateSuccessAction = {
  type: typeof TOGGLE_URL_STATE_SUCCESS
  payload: {
    shortUrl: string
    toState: UrlState
  }
}

export type SetUrlTableConfigAction = {
  type: typeof SET_URL_TABLE_CONFIG
  payload: UrlTableConfig
}

export type UpdateUrlCountAction = {
  type: typeof UPDATE_URL_COUNT
  payload: number
}

export type SetIsUploadingAction = {
  type: typeof SET_IS_UPLOADING
  payload: boolean
}

export type SetUploadFileErrorAction = {
  type: typeof SET_UPLOAD_FILE_ERROR
  payload: string
}

export type SetCreateShortLinkErrorAction = {
  type: typeof SET_CREATE_SHORT_LINK_ERROR
  payload: string
}

export type SetUrlFilterAction = {
  type: typeof SET_URL_FILTER
  payload: UrlTableFilterConfig
}

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
