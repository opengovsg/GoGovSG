import React from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { MuiThemeProvider } from '@material-ui/core/styles'

import PrivateRoute from '~/components/PrivateRoute'
import HomePage from '~/components/HomePage'
import LoginPage from '~/components/LoginPage'
import UserPage from '~/components/UserPage'
import NotFoundPage from '~/components/NotFoundPage'
import SearchPage from '~/components/SearchPage'
import MessageSnackbar from '~/components/MessageSnackbar'
import ScrollToTop from './ScrollToTop'

// Add extra favicons to webpack bundle
import '~/assets/favicon/android-chrome-192x192.png'
import '~/assets/favicon/android-chrome-512x512.png'
import '~/assets/favicon/apple-touch-icon.png'
import '~/assets/favicon/favicon-16x16.png'
import '~/assets/favicon/favicon-32x32.png'

import {
  HOME_PAGE,
  LOGIN_PAGE,
  NOT_FOUND_PAGE,
  SEARCH_PAGE,
  USER_PAGE,
} from '~/util/types'
import theme from '../../theme'

const Root = ({ store }) => (
  <Provider store={store}>
    <MuiThemeProvider theme={theme}>
      <HashRouter>
        <ScrollToTop>
          <Switch>
            <Route exact path={HOME_PAGE} component={HomePage} />
            <Route exact path={SEARCH_PAGE} component={SearchPage} />
            <Route path={LOGIN_PAGE} component={LoginPage} />
            <PrivateRoute path={USER_PAGE} component={UserPage} />
            <Route path={NOT_FOUND_PAGE} component={NotFoundPage} />
            <Route component={NotFoundPage} />
          </Switch>
        </ScrollToTop>
      </HashRouter>
      <MessageSnackbar />
    </MuiThemeProvider>
  </Provider>
)

Root.propTypes = {
  store: PropTypes.shape({}).isRequired,
}

export default Root
