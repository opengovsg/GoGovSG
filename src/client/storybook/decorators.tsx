import React from 'react'
import type { Decorator } from '@storybook/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { applyMiddleware, legacy_createStore as createStore } from 'redux'
import { thunk } from 'redux-thunk'
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import mergeWith from 'lodash/mergeWith'

import rootReducer from '../app/reducers'
import theme from '../app/theme'
import { GoGovReduxState } from '../app/reducers/types'

export type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T

export type ReduxStoryParameters = {
  reduxState?: DeepPartial<GoGovReduxState>
  routerEntries?: string[]
}

// Real Provider + real reducers, seeded with each story's own preloadedState.
// Thunks dispatched on mount still fire (see storybook/mocks/cross-fetch.ts)
// but their network call never resolves, so this preloadedState remains the
// only source of truth for what's rendered.
//
// combineReducers does NOT merge a partial slice with that slice's own
// default state -- a story's `reduxState.user = { urlCount: 0 }` becomes the
// ENTIRE user slice, so any field a component reads that the story didn't
// set (e.g. urlUpload, statusBarMessage) is undefined and crashes. Deep-merge
// each story's overrides onto the real default state tree (produced by
// calling the reducer with undefined state) so every field is always
// populated; arrays are replaced wholesale rather than merged by index, so a
// story's `urls: [...]` fully replaces the default `urls: []` instead of
// merging element-by-element.
const defaultState = rootReducer(
  undefined,
  // Any unrecognised action makes combineReducers fall through to each
  // slice's own default state -- the action type itself is arbitrary.
  { type: '@@STORYBOOK_INIT' } as unknown as Parameters<typeof rootReducer>[1],
)

export const withRedux: Decorator = (Story, context) => {
  const { reduxState = {} } = context.parameters as ReduxStoryParameters
  const preloadedState = mergeWith(
    {},
    defaultState,
    reduxState,
    (_objValue, srcValue) => (Array.isArray(srcValue) ? srcValue : undefined),
  )
  const store = createStore(
    rootReducer,
    preloadedState as GoGovReduxState,
    applyMiddleware(thunk),
  )
  return (
    <Provider store={store}>
      <Story />
    </Provider>
  )
}

export const withRouter: Decorator = (Story, context) => {
  const { routerEntries = ['/'] } = context.parameters as ReduxStoryParameters
  return (
    <MemoryRouter initialEntries={routerEntries}>
      <Story />
    </MemoryRouter>
  )
}

export const withTheme: Decorator = (Story) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Story />
  </ThemeProvider>
)

// Theme breakpoints (src/client/app/theme/index.ts): sm=600, md=960, xl=1440.
// Desktop is pinned to 1280 (lg) per the agreed viewport policy rather than xl.
export const PUBLIC_CHROMATIC_VIEWPORTS = [375, 960, 1280]
export const ADMIN_CHROMATIC_VIEWPORTS = [1280]

export const publicViewportParameters = {
  chromatic: { viewports: PUBLIC_CHROMATIC_VIEWPORTS },
  viewport: { value: 'desktop' },
}

export const adminViewportParameters = {
  chromatic: { viewports: ADMIN_CHROMATIC_VIEWPORTS },
  viewport: { value: 'desktop' },
}
