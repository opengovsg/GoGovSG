import { applyMiddleware, compose, createStore } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

import rootReducer from './reducers'

const composeEnhancers =
  process.env.NODE_ENV === 'development'
    ? composeWithDevTools({ trace: true })
    : compose

const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)))

export default store
