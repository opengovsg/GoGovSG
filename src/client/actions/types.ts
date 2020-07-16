import { ThunkDispatch } from 'redux-thunk'
import { GoGovReduxState } from '../reducers/types'
import { HomeActionType } from './home/types'
import { RootActionType } from './root/types'
import { UserActionType } from './user/types'
import { LoginActionType } from './login/types'
import { SearchActionType } from './search/types'

export type GetReduxState = () => GoGovReduxState

export type AllActions =
  | UserActionType
  | RootActionType
  | LoginActionType
  | HomeActionType
  | SearchActionType

export type AllThunkDispatch = ThunkDispatch<GoGovReduxState, void, AllActions>
