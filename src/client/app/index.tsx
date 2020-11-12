import React from 'react'
import * as Sentry from '@sentry/browser'
import { render } from 'react-dom'
import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'

import Root from './components/pages/RootPage'
import { get } from './util/requests'
import reducer from './reducers'
import './i18n'

// If SENTRY_DNS env var is specified, init sentry.
get('/api/sentry/').then((response) => {
  if (response.ok) {
    response.text().then((sentryDns) => {
      if (sentryDns) {
        Sentry.init({
          dsn: sentryDns,
        })
      }
    })
  }
})

const store = createStore(reducer, applyMiddleware(thunk))

render(<Root store={store} />, document.getElementById('root'))
