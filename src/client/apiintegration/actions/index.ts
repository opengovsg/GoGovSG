import { ThunkDispatch } from 'redux-thunk'
import { Dispatch } from 'redux'
import { GoGovReduxState } from '../../app/reducers/types'
import {
  SetErrorMessageAction,
  SetSuccessMessageAction,
} from '../../app/components/pages/RootPage/actions/types'
import { get, postFormData } from '../../app/util/requests'
import rootActions from '../../app/components/pages/RootPage/actions'
import {
  CLOSE_API_KEY_MODAL,
  CloseApiKeyModalAction,
  GENERATE_API_KEY_SUCCESSFULLY,
  GenerateApiKeySuccessfullyAction,
  OPEN_API_KEY_MODAL,
  OpenApiKeyModalAction,
  USER_HAS_API_KEY,
  USER_HAS_NO_API_KEY,
  UserHasApiKeyAction,
  UserHasNoApiKeyAction,
} from './types'

const userHasApiKey: () => UserHasApiKeyAction = () => ({
  type: USER_HAS_API_KEY,
})

const userHasNoApiKey: () => UserHasNoApiKeyAction = () => ({
  type: USER_HAS_NO_API_KEY,
})

const generateApiKeySuccessfully: (
  apiKey: string,
) => GenerateApiKeySuccessfullyAction = (apiKey: string) => ({
  type: GENERATE_API_KEY_SUCCESSFULLY,
  payload: { apiKey },
})

const openApiKeyModal: () => OpenApiKeyModalAction = () => ({
  type: OPEN_API_KEY_MODAL,
})

const closeApiKeyModal: () => CloseApiKeyModalAction = () => ({
  type: CLOSE_API_KEY_MODAL,
})

async function handleError(
  dispatch: Dispatch<SetErrorMessageAction>,
  response: Response,
) {
  const responseType = response.headers.get('content-type')
  let message: string
  if (responseType?.includes('json')) {
    const json = await response.json()
    message = json.message
  } else {
    message = await response.text()
  }
  message = message.replace('Error validating request body. ', '')
  dispatch<SetErrorMessageAction>(rootActions.setErrorMessage(message))
}

const generateApiKey =
  () =>
  async (
    dispatch: ThunkDispatch<
      GoGovReduxState,
      void,
      | SetErrorMessageAction
      | SetSuccessMessageAction
      | UserHasApiKeyAction
      | GenerateApiKeySuccessfullyAction
      | OpenApiKeyModalAction
    >,
  ) => {
    const response = await postFormData('/api/user/apiKey', new FormData())
    if (!response.ok) {
      await handleError(dispatch, response)
    } else {
      const { message } = await response.json()
      dispatch<GenerateApiKeySuccessfullyAction>(
        generateApiKeySuccessfully(message),
      )
      dispatch<UserHasApiKeyAction>(userHasApiKey())
      dispatch<OpenApiKeyModalAction>(openApiKeyModal())
    }
  }

const hasApiKey =
  () =>
  (
    dispatch: Dispatch<
      | SetErrorMessageAction
      | SetSuccessMessageAction
      | UserHasApiKeyAction
      | UserHasNoApiKeyAction
    >,
  ) => {
    get('/api/user/hasApiKey').then((response) => {
      const isOk = response.ok
      return response.json().then((json) => {
        if (isOk) {
          const { message } = json
          if (message === 'true') {
            dispatch<UserHasApiKeyAction>(userHasApiKey())
          } else {
            dispatch<UserHasNoApiKeyAction>(userHasNoApiKey())
          }
        } else {
          const errorMessage = 'Error getting user has apiKey'
          dispatch<UserHasNoApiKeyAction>(userHasNoApiKey())
          dispatch<SetErrorMessageAction>(
            rootActions.setErrorMessage(errorMessage),
          )
        }
      })
    })
  }

export default {
  generateApiKey,
  hasApiKey,
  closeApiKeyModal,
  openApiKeyModal,
}
