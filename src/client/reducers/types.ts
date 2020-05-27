import { HomeState } from './home/types'
import { LoginState } from './login/types'
import { UserState } from './user/types'
import { RootState } from './root/types'

export type GoGovReduxState = {
  user: UserState
  home: HomeState
  root: RootState
  login: LoginState
}
