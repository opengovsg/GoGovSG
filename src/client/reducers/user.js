import {
  CANCEL_EDIT_LONG_URL,
  CLOSE_CREATE_URL_MODAL,
  CLOSE_OWNERSHIP_MODAL,
  CLOSE_QR_CODE,
  EDIT_LONG_URL,
  GET_URLS_FOR_USER_SUCCESS,
  OPEN_CREATE_URL_MODAL,
  OPEN_OWNERSHIP_MODAL,
  OPEN_QR_CODE,
  RESET_USER_STATE,
  SET_EDITED_LONG_URL,
  SET_LONG_URL,
  SET_NEW_OWNER,
  SET_RANDOM_SHORT_URL,
  SET_SHORT_URL,
  SET_URL_TABLE_CONFIG,
  TOGGLE_URL_STATE_SUCCESS,
  UPDATE_URL_COUNT,
} from '~/actions/types'

const initialState = {
  urls: [],
  shortUrl: '',
  longUrl: '',
  editedLongUrl: '',
  createUrlModal: false,
  qrCode: '',
  ownershipModal: '',
  newOwner: '',
  tableConfig: {
    numberOfRows: 10, pageNumber: 0, sortDirection: 'desc', orderBy: 'createdAt', searchText: '',
  },
  urlCount: 0,
}

const user = (state = initialState, action) => {
  let nextState = {}
  const { payload } = action

  switch (action.type) {
    case GET_URLS_FOR_USER_SUCCESS:
      nextState = {
        urls: payload,
      }
      break
    case SET_SHORT_URL:
      nextState = {
        shortUrl: payload,
      }
      break
    case SET_LONG_URL:
      nextState = {
        longUrl: payload,
      }
      break
    case SET_EDITED_LONG_URL:
      const { shortUrl, editedLongUrl } = payload // eslint-disable-line no-case-declarations
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
    case SET_RANDOM_SHORT_URL:
      nextState = {
        shortUrl: payload,
      }
      break
    case RESET_USER_STATE:
      nextState = {
        shortUrl: '',
        longUrl: '',
      }
      break
    case TOGGLE_URL_STATE_SUCCESS: {
      const { shortUrl, toState } = payload // eslint-disable-line no-shadow

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
    case OPEN_QR_CODE:
      nextState = {
        qrCode: payload,
      }
      break
    case CLOSE_QR_CODE:
      nextState = {
        qrCode: '',
      }
      break
    case OPEN_OWNERSHIP_MODAL:
      nextState = {
        ownershipModal: payload,
      }
      break
    case CLOSE_OWNERSHIP_MODAL:
      nextState = {
        ownershipModal: '',
        newOwner: '',
      }
      break
    case SET_NEW_OWNER:
      nextState = {
        newOwner: payload,
      }
      break
    case EDIT_LONG_URL: {
      // eslint-disable-next-line no-shadow
      const [editedLongUrl] = state.urls.filter(url => url.shortUrl === payload)

      nextState = {
        urls: state.urls.map(url => ({
          ...url,
          edit: url.shortUrl === payload,
        })),
        editedLongUrl: editedLongUrl ? editedLongUrl.longUrl : '',
      }
      break
    }
    case CANCEL_EDIT_LONG_URL:
      nextState = {
        urls: state.urls.map(url => ({
          ...url,
          edit: false,
        })),
        editedLongUrl: '',
      }
      break
    case SET_URL_TABLE_CONFIG:
      nextState = {
        tableConfig: {
          ...state.tableConfig,
          ...payload,
        },
      }
      break
    case UPDATE_URL_COUNT:
      nextState = {
        urlCount: payload,
      }
      break
    default:
      return state
  }
  return Object.assign({}, state, nextState)
}

export default user
