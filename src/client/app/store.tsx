import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

import * as Sentry from '@sentry/react'

import rootReducer from './reducers'

const composeEnhancers = composeWithDevTools({
  trace: true,
})

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk), Sentry.createReduxEnhancer()),
)

export default store
