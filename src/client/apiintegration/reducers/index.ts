import { HasApiKeyState } from './types'
import {
  ApiKeyActionType,
  CLOSE_API_KEY_MODAL,
  GENERATE_API_KEY_SUCCESSFULLY,
  OPEN_API_KEY_MODAL,
  USER_HAS_API_KEY,
  USER_HAS_NO_API_KEY,
} from '../actions/types'

const initialState: HasApiKeyState = {
  hasApiKey: false,
  apiKeyModal: false,
  apiKey: '',
}

const api = (state = initialState, action: ApiKeyActionType) => {
  let nextState = {}
  switch (action.type) {
    case USER_HAS_API_KEY:
      nextState = {
        hasApiKey: true,
      }
      break
    case USER_HAS_NO_API_KEY:
      nextState = {
        hasApiKey: false,
      }
      break
    case OPEN_API_KEY_MODAL:
      nextState = {
        apiKeyModal: true,
      }
      break
    case CLOSE_API_KEY_MODAL:
      nextState = {
        apiKeyModal: false,
        apiKey: '',
      }
      break
    case GENERATE_API_KEY_SUCCESSFULLY:
      nextState = {
        apiKey: action.payload.apiKey,
        hasApiKey: true,
      }
      break
    default:
      return state
  }
  return { ...state, ...nextState }
}

export default api
