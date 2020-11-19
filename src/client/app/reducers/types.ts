import { HomeState } from '../../home/reducers/types'
import { LoginState } from '../../login/reducers/types'
import { UserState } from '../../user/reducers/types'
import { RootState } from '../components/pages/RootPage/reducers/types'
import { DirectoryState } from '../../directory/reducers/types'

export type GoGovReduxState = {
  user: UserState
  home: HomeState
  root: RootState
  login: LoginState
  directory: DirectoryState
}
