import React, { FunctionComponent, PropsWithChildren, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useAppDispatch from '../hooks'
import { LOGIN_PAGE } from '../util/types'
import loginActions from '../../login/actions'
import { GoGovReduxState } from '../reducers/types'

const PrivateRoute: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const isLoggedIn = useSelector(
    (state: GoGovReduxState) => state.login.isLoggedIn,
  )
  useEffect(() => {
    dispatch(loginActions.isLoggedIn())
  }, [dispatch])

  if (!isLoggedIn) {
    return <Navigate to={LOGIN_PAGE} state={{ previous: location.pathname }} />
  }

  return children
}

export default PrivateRoute
