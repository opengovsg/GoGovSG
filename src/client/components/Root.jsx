import React from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { MuiThemeProvider } from '@material-ui/core/styles'

import BaseLayout from '~/components/BaseLayout'
import PrivateRoute from '~/components/PrivateRoute'
import HomePage from '~/components/HomePage'
import LoginPage from '~/components/LoginPage'
import UserPage from '~/components/User/UserPage'
import NotFoundPage from '~/components/NotFoundPage'
import MessageSnackbar from '~/components/MessageSnackbar'

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
  USER_PAGE,
  snackbarVariants,
} from '~/util/types'
import theme from '~/styles/theme'

const snackbars = Object.values(snackbarVariants).map(variant => (
  <MessageSnackbar key={variant} variant={variant} />
)) // eslint-disable-line max-len
const Root = ({ store }) => (
  <Provider store={store}>
    <MuiThemeProvider theme={theme}>
      <BaseLayout>
        <HashRouter>
          <div>
            <Switch>
              <Route exact path={HOME_PAGE} component={HomePage} />
              <Route path={LOGIN_PAGE} component={LoginPage} />
              <PrivateRoute path={USER_PAGE} component={UserPage} />
              <Route path={NOT_FOUND_PAGE} component={NotFoundPage} />
              <Route component={NotFoundPage} />
            </Switch>
          </div>
        </HashRouter>
        <React.Fragment>{snackbars}</React.Fragment>
      </BaseLayout>
    </MuiThemeProvider>
  </Provider>
)

Root.propTypes = {
  store: PropTypes.shape({}).isRequired,
}

export default Root
