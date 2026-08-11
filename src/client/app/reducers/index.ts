import { combineReducers } from 'redux'
import { login } from '../../login/reducers/index.js'
import user from '../../user/reducers/index.js'
import root from '../components/pages/RootPage/reducers/index.js'
import home from '../../home/reducers/index.js'
import directory from '../../directory/reducers/index.js'
import api from '../../apiintegration/reducers/index.js'

const rootReducer = combineReducers({
  login,
  user,
  root,
  home,
  directory,
  api,
})

export default rootReducer
