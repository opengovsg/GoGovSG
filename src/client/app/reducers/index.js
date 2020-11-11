import { combineReducers } from 'redux'
import { login } from '../../login/reducers'
import user from '../../user/reducers'
import root from '../components/RootPage/reducers'
import home from '../../home/reducers'
import search from '../../search/reducers'
import directory from '../../directory/reducers'

const reducer = combineReducers({
  login,
  user,
  root,
  home,
  search,
  directory,
})
export default reducer
