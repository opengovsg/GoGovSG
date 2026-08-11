import { HomeState } from '../../home/reducers/types.js'
import { LoginState } from '../../login/reducers/types.js'
import { UserState } from '../../user/reducers/types.js'
import { RootState } from '../components/pages/RootPage/reducers/types.js'
import { DirectoryState } from '../../directory/reducers/types.js'
import { ApiState } from '../../apiintegration/reducers/types.js'

export type GoGovReduxState = {
  user: UserState
  home: HomeState
  root: RootState
  login: LoginState
  directory: DirectoryState
  api: ApiState
}
