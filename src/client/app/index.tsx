import React from 'react'
import { createRoot } from 'react-dom/client'

// top level application entrypoint polyfill imports
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import { createHashHistory } from 'history'

import Root from './components/pages/RootPage'
import { i18nInit } from './i18n'
import store from './store'

const history = createHashHistory()

const root = createRoot(document.getElementById('root')!)

i18nInit.then(() => root.render(<Root store={store} history={history} />))
