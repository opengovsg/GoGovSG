import {
  UrlState,
  UrlTableConfig,
  UrlTableFilterConfig,
  UrlType,
} from '../reducers/types'

import { HasPayload, ReduxAction } from '../../app/actions/types'

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

export type SetUrlUploadStateAction = ReduxAction<
  typeof UserAction.SET_URL_UPLOAD_STATE
> &
  HasPayload<boolean>

export type SetFileUploadStateAction = ReduxAction<
  typeof UserAction.SET_FILE_UPLOAD_STATE
> &
  HasPayload<boolean>

export type SetUserMessageAction = ReduxAction<
  typeof UserAction.SET_USER_MESSAGE
> &
  HasPayload<string>

export type SetUserAnnouncementAction = ReduxAction<
  typeof UserAction.SET_USER_ANNOUNCEMENT
> &
  HasPayload<{
    message: string | undefined
    title: string | undefined
    subtitle: string | undefined
    url: string | undefined
    image: string | undefined
  }>

export type SetEditedContactEmailAction = ReduxAction<
  typeof UserAction.SET_EDITED_CONTACT_EMAIL
> &
  HasPayload<{
    shortUrl: string
    editedContactEmail: string
  }>

export type SetEditedDescriptionAction = ReduxAction<
  typeof UserAction.SET_EDITED_DESCRIPTION
> &
  HasPayload<{
    shortUrl: string
    editedDescription: string
  }>

export type SetLastCreatedLinkAction = ReduxAction<
  typeof UserAction.SET_LAST_CREATED_LINK
> &
  HasPayload<string>

export type WipeUserStateAction = ReduxAction<typeof UserAction.WIPE_USER_STATE>

export type IsFetchingUrlsAction = ReduxAction<
  typeof UserAction.IS_FETCHING_URLS
> &
  HasPayload<boolean>

export type CreateUrlSuccessAction = ReduxAction<
  typeof UserAction.CREATE_URL_SUCCESS
>

export type GetUrlsForUserSuccessAction = ReduxAction<
  typeof UserAction.GET_URLS_FOR_USER_SUCCESS
> &
  HasPayload<Array<UrlType>>

export type OpenCreateUrlModalAction = ReduxAction<
  typeof UserAction.OPEN_CREATE_URL_MODAL
>

export type CloseCreateUrlModalAction = ReduxAction<
  typeof UserAction.CLOSE_CREATE_URL_MODAL
>

export type SetShortUrlAction = ReduxAction<typeof UserAction.SET_SHORT_URL> &
  HasPayload<string>

export type SetLongUrlAction = ReduxAction<typeof UserAction.SET_LONG_URL> &
  HasPayload<string>

export type SetEditedLongUrlAction = ReduxAction<
  typeof UserAction.SET_EDITED_LONG_URL
> &
  HasPayload<{
    shortUrl: string
    editedLongUrl: string
  }>

export type SetRandomShortUrlAction = ReduxAction<
  typeof UserAction.SET_RANDOM_SHORT_URL
> &
  HasPayload<string>

export type ResetUserStateAction = ReduxAction<
  typeof UserAction.RESET_USER_STATE
>

export type ToggleUrlStateSuccessAction = ReduxAction<
  typeof UserAction.TOGGLE_URL_STATE_SUCCESS
> &
  HasPayload<{
    shortUrl: string
    toState: UrlState
  }>

export type SetUrlTableConfigAction = ReduxAction<
  typeof UserAction.SET_URL_TABLE_CONFIG
> &
  HasPayload<UrlTableConfig>

export type UpdateUrlCountAction = ReduxAction<
  typeof UserAction.UPDATE_URL_COUNT
> &
  HasPayload<number>

export type SetIsUploadingAction = ReduxAction<
  typeof UserAction.SET_IS_UPLOADING
> &
  HasPayload<boolean>

export type SetUploadFileErrorAction = ReduxAction<
  typeof UserAction.SET_UPLOAD_FILE_ERROR
> &
  HasPayload<string>

export type SetCreateShortLinkErrorAction = ReduxAction<
  typeof UserAction.SET_CREATE_SHORT_LINK_ERROR
> &
  HasPayload<string>

export type SetUrlFilterAction = ReduxAction<typeof UserAction.SET_URL_FILTER> &
  HasPayload<UrlTableFilterConfig>

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
