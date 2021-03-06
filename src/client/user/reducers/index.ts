import { UserAction, UserActionType } from '../actions/types'
import { UserState } from './types'
import { initialSortConfig } from '../constants'

const initialState: UserState = {
  initialised: false,
  urls: [],
  isFetchingUrls: false,
  isUploading: false,
  shortUrl: '',
  longUrl: '',
  createUrlModal: false,
  tableConfig: {
    numberOfRows: 10,
    pageNumber: 0,
    searchText: '',
    filter: {},
    ...initialSortConfig,
  },
  urlCount: 0,
  message: null,
  announcement: null,
  uploadFileError: null,
  createShortLinkError: null,
  uploadState: {
    urlUpload: false,
    fileUpload: false,
  },
}

const user: (state: UserState, action: UserActionType) => UserState = (
  state = initialState,
  action,
) => {
  let nextState: Partial<UserState> = {}

  switch (action.type) {
    case UserAction.SET_USER_MESSAGE:
      nextState = {
        message: action.payload,
      }
      break
    case UserAction.SET_USER_ANNOUNCEMENT:
      nextState = {
        announcement: action.payload,
      }
      break
    case UserAction.SET_LAST_CREATED_LINK:
      nextState = {
        lastCreatedLink: action.payload,
      }
      break
    case UserAction.SET_CREATE_SHORT_LINK_ERROR:
      nextState = {
        createShortLinkError: action.payload,
      }
      break
    case UserAction.SET_UPLOAD_FILE_ERROR:
      nextState = {
        uploadFileError: action.payload,
      }
      break
    case UserAction.SET_IS_UPLOADING:
      nextState = {
        isUploading: action.payload,
      }
      break
    case UserAction.IS_FETCHING_URLS:
      nextState = {
        isFetchingUrls: action.payload,
      }
      break
    case UserAction.GET_URLS_FOR_USER_SUCCESS:
      nextState = {
        initialised: true,
        urls: action.payload,
      }
      break
    case UserAction.SET_SHORT_URL:
      nextState = {
        shortUrl: action.payload,
      }
      break
    case UserAction.SET_LONG_URL:
      nextState = {
        longUrl: action.payload,
      }
      break
    case UserAction.SET_EDITED_LONG_URL: {
      const { editedLongUrl, shortUrl } = action.payload
      nextState = {
        urls: state.urls.map((url) => {
          if (shortUrl !== url.shortUrl) {
            return url
          }
          return {
            ...url,
            editedLongUrl,
          }
        }),
      }
      break
    }
    case UserAction.SET_EDITED_CONTACT_EMAIL: {
      const { editedContactEmail, shortUrl } = action.payload
      nextState = {
        urls: state.urls.map((url) => {
          if (shortUrl !== url.shortUrl) {
            return url
          }
          return {
            ...url,
            editedContactEmail,
          }
        }),
      }
      break
    }
    case UserAction.SET_EDITED_DESCRIPTION: {
      const { editedDescription, shortUrl } = action.payload
      nextState = {
        urls: state.urls.map((url) => {
          if (shortUrl !== url.shortUrl) {
            return url
          }
          return {
            ...url,
            editedDescription,
          }
        }),
      }
      break
    }
    case UserAction.SET_RANDOM_SHORT_URL:
      nextState = {
        shortUrl: action.payload,
      }
      break
    case UserAction.RESET_USER_STATE:
      nextState = {
        shortUrl: '',
        longUrl: '',
      }
      break
    case UserAction.WIPE_USER_STATE:
      nextState = {
        ...initialState,
      }
      break
    case UserAction.TOGGLE_URL_STATE_SUCCESS: {
      const { shortUrl, toState } = action.payload

      nextState = {
        urls: state.urls.map((url) => {
          if (shortUrl !== url.shortUrl) {
            return url
          }
          return {
            ...url,
            state: toState,
          }
        }),
      }
      break
    }
    case UserAction.OPEN_CREATE_URL_MODAL:
      nextState = {
        createUrlModal: true,
      }
      break
    case UserAction.CLOSE_CREATE_URL_MODAL:
      nextState = {
        createUrlModal: false,
      }
      break
    case UserAction.SET_URL_TABLE_CONFIG:
      nextState = {
        tableConfig: {
          ...state.tableConfig,
          ...action.payload,
        },
      }
      break
    case UserAction.SET_URL_FILTER:
      nextState = {
        tableConfig: {
          ...state.tableConfig,
          filter: action.payload,
          pageNumber: 0,
        },
      }
      break
    case UserAction.UPDATE_URL_COUNT:
      nextState = {
        urlCount: action.payload,
      }
      break
    case UserAction.SET_URL_UPLOAD_STATE:
      nextState = {
        uploadState: {
          ...state.uploadState,
          urlUpload: action.payload,
        },
      }
      break
    case UserAction.SET_FILE_UPLOAD_STATE:
      nextState = {
        uploadState: {
          ...state.uploadState,
          fileUpload: action.payload,
        },
      }
      break
    default:
      return state
  }
  return { ...state, ...nextState }
}

export default user
