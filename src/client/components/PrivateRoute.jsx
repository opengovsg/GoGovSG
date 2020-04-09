import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Redirect, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LOGIN_PAGE } from '~/util/types'
import loginActions from '~/actions/login'

const PrivateRoute = (props) => {
  const { component: ChildComponent, ...args } = props
  const dispatch = useDispatch()
  const isLoggedIn = useSelector(state => state.login.isLoggedIn)
  useEffect(() => { dispatch(loginActions.isLoggedIn()) }, [])

  return (
    <Route
      {...args}
      render={routeProps => (isLoggedIn ? (
        <ChildComponent {...routeProps} />
      ) : (
        <Redirect
          to={{
            pathname: LOGIN_PAGE,
          }}
        />
      ))
    }
    />
  )
}

PrivateRoute.propTypes = {
  component: PropTypes.func.isRequired,
}

export default PrivateRoute
