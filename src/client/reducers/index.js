import { combineReducers } from 'redux'
import { login } from '~/reducers/login'
import user from '~/reducers/user'
import root from '~/reducers/root'
import home from '~/reducers/home'
import search from '~/reducers/search'

const reducer = combineReducers({
  login,
  user,
  root,
  home,
  search,
})
export default reducer
