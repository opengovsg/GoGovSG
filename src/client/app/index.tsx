import React from 'react'
import * as Sentry from '@sentry/browser'
import { render } from 'react-dom'

import Root from './components/pages/RootPage'
import { get } from './util/requests'
import './i18n'
import store from './store'

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

render(<Root store={store} />, document.getElementById('root'))
