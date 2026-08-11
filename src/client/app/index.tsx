import React from 'react'
import { render } from 'react-dom'

// top level application entrypoint polyfill imports
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import { createHashHistory } from 'history'

import Root from './components/pages/RootPage/index.js'
import { i18nInit } from './i18n.js'
import store from './store.js'

const history = createHashHistory()

i18nInit.then(() =>
  render(
    <Root store={store} history={history} />,
    document.getElementById('root'),
  ),
)
