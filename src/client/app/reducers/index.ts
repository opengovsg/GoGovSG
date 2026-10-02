import { combineReducers, Reducer } from 'redux'
import { login } from '../../login/reducers'
import user from '../../user/reducers'
import root from '../components/pages/RootPage/reducers'
import home from '../../home/reducers'
import directory from '../../directory/reducers'
import api from '../../apiintegration/reducers'
import { AllActions } from '../actions/types'
import { GoGovReduxState } from './types'

const rootReducer = combineReducers({
  login,
  user,
  root,
  home,
  directory,
  api,
}) as unknown as Reducer<GoGovReduxState, AllActions>

export default rootReducer
