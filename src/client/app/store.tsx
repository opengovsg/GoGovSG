import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'
import reducer from './reducers'

export const store = createStore(reducer, applyMiddleware(thunk))
