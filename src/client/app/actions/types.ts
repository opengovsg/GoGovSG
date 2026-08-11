import { ThunkDispatch } from 'redux-thunk'
import { GoGovReduxState } from '../reducers/types.js'
import { HomeActionType } from '../../home/actions/types.js'
import { RootActionType } from '../components/pages/RootPage/actions/types.js'
import { UserActionType } from '../../user/actions/types.js'
import { LoginActionType } from '../../login/actions/types.js'
import { DirectoryActionType } from '../../directory/actions/types.js'

export type GetReduxState = () => GoGovReduxState

export type AllActions =
  | UserActionType
  | RootActionType
  | LoginActionType
  | HomeActionType
  | DirectoryActionType

export interface ReduxAction<T extends string> {
  type: T
}

export interface HasPayload<P> {
  payload: P
}

export type ReduxPayloadAction<T extends string, P> = ReduxAction<T> &
  HasPayload<P>

export type AllThunkDispatch = ThunkDispatch<GoGovReduxState, void, AllActions>
