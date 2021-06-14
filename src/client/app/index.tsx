import React from 'react'
import { render } from 'react-dom'

// top level application entrypoint polyfill imports
require('core-js/stable')
require('regenerator-runtime/runtime')

import { createHashHistory } from 'history'

import * as Sentry from '@sentry/react'
import { Integrations } from '@sentry/tracing'

import Root from './components/pages/RootPage'
import { get } from './util/requests'
import { i18nInit } from './i18n'
import store from './store'

const history = createHashHistory()

// If SENTRY_DNS env var is specified, init sentry.
get('/api/sentry/').then((response) => {
  if (response.ok) {
    response.text().then((sentryDns) => {
      if (sentryDns) {
        Sentry.init({
          dsn: sentryDns,
          integrations: [
            new Integrations.BrowserTracing({
              routingInstrumentation:
                Sentry.reactRouterV5Instrumentation(history),
            }),
          ],
          tracesSampleRate: 1.0,
        })
      }
    })
  }
})
i18nInit.then(() =>
  render(
    <Root store={store} history={history} />,
    document.getElementById('root'),
  ),
)
