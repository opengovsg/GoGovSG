import { combineReducers } from 'redux'
import { login } from '../../login/reducers'
import user from '../../user/reducers'
import root from '../components/pages/RootPage/reducers'
import home from '../../home/reducers'
import directory from '../../directory/reducers'
import { api } from '../../apiintegration/reducers'

const rootReducer = combineReducers({
  login,
  user,
  root,
  home,
  directory,
  api,
})

export default rootReducer
