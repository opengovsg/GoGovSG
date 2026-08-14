import React, { FunctionComponent } from 'react'
import { Provider } from 'react-redux'
import { HashRouter, Route, Routes } from 'react-router-dom'
import {
  ThemeProvider,
  Theme,
  StyledEngineProvider,
} from '@mui/material/styles'

import { Store } from 'redux'

import PrivateRoute from '../../PrivateRoute'
import HomePage from '../../../../home'
import LoginPage from '../../../../login'
import UserPage from '../../../../user'
import NotFoundPage from '../NotFoundPage'
import DirectoryPage from '../../../../directory'
import MessageSnackbar from '../../MessageSnackbar'
import ScrollToTop from './ScrollToTop'
import ApiIntegrationPage from '../../../../apiintegration'

// Add extra favicons to webpack bundle
import '@assets/favicon/android-chrome-192x192.png'
import '@assets/favicon/android-chrome-512x512.png'
import '@assets/favicon/apple-touch-icon.png'
import '@assets/favicon/favicon-16x16.png'
import '@assets/favicon/favicon-32x32.png'

import {
  API_INTEGRATION_PAGE,
  DIRECTORY_PAGE,
  HOME_PAGE,
  LOGIN_PAGE,
  NOT_FOUND_PAGE,
  USER_PAGE,
} from '../../../util/types'
import theme from '../../../theme'

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

type RootProps = {
  store: Store
}

const Root: FunctionComponent<RootProps> = ({ store }: RootProps) => (
  <Provider store={store}>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <HashRouter>
          <ScrollToTop>
            <Routes>
              <Route path={HOME_PAGE} element={<HomePage />} />
              <Route path={LOGIN_PAGE} element={<LoginPage />} />
              <Route
                path={USER_PAGE}
                element={
                  <PrivateRoute>
                    <UserPage />
                  </PrivateRoute>
                }
              />
              <Route path={NOT_FOUND_PAGE} element={<NotFoundPage />} />
              <Route
                path={DIRECTORY_PAGE}
                element={
                  <PrivateRoute>
                    <DirectoryPage />
                  </PrivateRoute>
                }
              />
              <Route
                path={API_INTEGRATION_PAGE}
                element={
                  <PrivateRoute>
                    <ApiIntegrationPage />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ScrollToTop>
        </HashRouter>
        <MessageSnackbar />
      </ThemeProvider>
    </StyledEngineProvider>
  </Provider>
)

export default Root
