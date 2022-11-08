import { ThunkDispatch } from 'redux-thunk'
import { Dispatch } from 'redux'
import { GoGovReduxState } from '../../app/reducers/types'
import {
  SetErrorMessageAction,
  SetSuccessMessageAction,
} from '../../app/components/pages/RootPage/actions/types'
import {
  SetCreateShortLinkErrorAction,
  SetUploadFileErrorAction,
} from '../../user/actions/types'
import { get, postFormData } from '../../app/util/requests'
import rootActions from '../../app/components/pages/RootPage/actions'
import {
  USER_HAS_API_KEY,
  USER_HAS_NO_API_KEY,
  UserHasApiKeyAction,
  UserHasNoApiKeyAction,
} from './types'

const userHasApiKey: () => UserHasApiKeyAction = () => ({
  type: USER_HAS_API_KEY,
  payload: true,
})

const userHasNoApiKey: () => UserHasNoApiKeyAction = () => ({
  type: USER_HAS_NO_API_KEY,
  payload: false,
})

async function handleError(
  dispatch: Dispatch<
    | SetUploadFileErrorAction
    | SetCreateShortLinkErrorAction
    | SetErrorMessageAction
  >,
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
      SetErrorMessageAction | SetSuccessMessageAction | UserHasApiKeyAction
    >,
  ) => {
    const response = await postFormData('/api/user/apiKey', new FormData())
    if (!response.ok) {
      await handleError(dispatch, response)
    } else {
      const successMessage = 'Your Api Key has been created'
      dispatch<SetSuccessMessageAction>(
        rootActions.setSuccessMessage(successMessage),
      )
      dispatch<UserHasApiKeyAction>(userHasApiKey())
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
}
