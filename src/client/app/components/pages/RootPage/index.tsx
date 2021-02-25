import React, { FunctionComponent } from 'react'
import { Provider } from 'react-redux'
import { Route, Router, Switch } from 'react-router-dom'
import { MuiThemeProvider } from '@material-ui/core/styles'

import { Store } from 'redux'

import { History } from 'history'

import PrivateRoute from '../../PrivateRoute'
import HomePage from '../../../../home'
import LoginPage from '../../../../login'
import UserPage from '../../../../user'
import NotFoundPage from '../NotFoundPage'
import DirectoryPage from '../../../../directory'
import MessageSnackbar from '../../MessageSnackbar'
import ScrollToTop from './ScrollToTop'

// Add extra favicons to webpack bundle
import '../../../assets/favicon/android-chrome-192x192.png'
import '../../../assets/favicon/android-chrome-512x512.png'
import '../../../assets/favicon/apple-touch-icon.png'
import '../../../assets/favicon/favicon-16x16.png'
import '../../../assets/favicon/favicon-32x32.png'

import {
  DIRECTORY_PAGE,
  HOME_PAGE,
  LOGIN_PAGE,
  NOT_FOUND_PAGE,
  USER_PAGE,
} from '../../../util/types'
import theme from '../../../theme'

type RootProps = {
  store: Store
  history: History
}

const Root: FunctionComponent<RootProps> = ({ store, history }: RootProps) => (
  <Provider store={store}>
    <MuiThemeProvider theme={theme}>
      <Router history={history}>
        <ScrollToTop>
          <Switch>
            <Route exact path={HOME_PAGE} component={HomePage} />
            <Route path={LOGIN_PAGE} component={LoginPage} />
            <PrivateRoute path={USER_PAGE} component={UserPage} />
            <Route path={NOT_FOUND_PAGE} component={NotFoundPage} />
            <PrivateRoute path={DIRECTORY_PAGE} component={DirectoryPage} />
            <Route component={NotFoundPage} />
          </Switch>
        </ScrollToTop>
      </Router>
      <MessageSnackbar />
    </MuiThemeProvider>
  </Provider>
)

export default Root
