import {
  CLOSE_CREATE_URL_MODAL,
  GET_URLS_FOR_USER_SUCCESS,
  IS_FETCHING_URLS,
  OPEN_CREATE_URL_MODAL,
  RESET_USER_STATE,
  SET_CREATE_SHORT_LINK_ERROR,
  SET_EDITED_LONG_URL,
  SET_IS_UPLOADING,
  SET_LAST_CREATED_LINK,
  SET_LONG_URL,
  SET_RANDOM_SHORT_URL,
  SET_SHORT_URL,
  SET_UPLOAD_FILE_ERROR,
  SET_URL_FILTER,
  SET_URL_TABLE_CONFIG,
  TOGGLE_URL_STATE_SUCCESS,
  UPDATE_URL_COUNT,
  UserActionType,
  WIPE_USER_STATE,
} from '../../actions/user/types'
import { UserState } from './types'
import { initialSortConfig } from '../../constants/user'

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
}

const user: (state: UserState, action: UserActionType) => UserState = (
  state = initialState,
  action,
) => {
  let nextState: Partial<UserState> = {}

  switch (action.type) {
    case SET_LAST_CREATED_LINK:
      nextState = {
        lastCreatedLink: action.payload,
      }
      break
    case SET_CREATE_SHORT_LINK_ERROR:
      nextState = {
        createShortLinkError: action.payload,
      }
      break
    case SET_UPLOAD_FILE_ERROR:
      nextState = {
        uploadFileError: action.payload,
      }
      break
    case SET_IS_UPLOADING:
      nextState = {
        isUploading: action.payload,
      }
      break
    case IS_FETCHING_URLS:
      nextState = {
        isFetchingUrls: action.payload,
      }
      break
    case GET_URLS_FOR_USER_SUCCESS:
      nextState = {
        initialised: true,
        urls: action.payload,
      }
      break
    case SET_SHORT_URL:
      nextState = {
        shortUrl: action.payload,
      }
      break
    case SET_LONG_URL:
      nextState = {
        longUrl: action.payload,
      }
      break
    case SET_EDITED_LONG_URL: {
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
    case SET_RANDOM_SHORT_URL:
      nextState = {
        shortUrl: action.payload,
      }
      break
    case RESET_USER_STATE:
      nextState = {
        shortUrl: '',
        longUrl: '',
      }
      break
    case WIPE_USER_STATE:
      nextState = {
        ...initialState,
      }
      break
    case TOGGLE_URL_STATE_SUCCESS: {
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
    case OPEN_CREATE_URL_MODAL:
      nextState = {
        createUrlModal: true,
      }
      break
    case CLOSE_CREATE_URL_MODAL:
      nextState = {
        createUrlModal: false,
      }
      break
    case SET_URL_TABLE_CONFIG:
      nextState = {
        tableConfig: {
          ...state.tableConfig,
          ...action.payload,
        },
      }
      break
    case SET_URL_FILTER:
      nextState = {
        tableConfig: {
          ...state.tableConfig,
          filter: action.payload,
          pageNumber: 0,
        },
      }
      break
    case UPDATE_URL_COUNT:
      nextState = {
        urlCount: action.payload,
      }
      break
    default:
      return state
  }
  return { ...state, ...nextState }
}

export default user
