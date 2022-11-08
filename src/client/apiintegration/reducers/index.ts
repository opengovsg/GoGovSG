import { HasApiKeyState } from './types'
import {
  ApiKeyActionType,
  USER_HAS_API_KEY,
  USER_HAS_NO_API_KEY,
} from '../actions/types'

const initialState: HasApiKeyState = {
  hasApiKey: false,
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
    default:
      return state
  }
  return { ...state, ...nextState }
}

export default api
