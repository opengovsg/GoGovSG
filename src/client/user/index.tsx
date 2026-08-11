import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Drawer from './components/Drawer/index.js'
import CreateUrlModal from './components/CreateUrlModal/index.js'
import AnnouncementModal from './components/AnnouncementModal/index.js'
import userActions from './actions/index.js'
import BaseLayout from '../app/components/BaseLayout/index.js'
import UserLinkTable from './components/UserLinkTable/index.js'
import EmptyState from './components/EmptyState/index.js'
import useIsFiltered from './components/EmptyState/isFiltered.js'
import loginActions from '../login/actions/index.js'
import { GAEvent, GAPageView } from '../app/util/ga.js'
import { GoGovReduxState } from '../app/reducers/types.js'

/**
 * Show the user page.
 */
function UserPage() {
  const fetchingUrls = useSelector(
    (state: GoGovReduxState) => state.user.isFetchingUrls,
  )
  const urlCount = useSelector((state: GoGovReduxState) => state.user.urlCount)
  const message = useSelector((state: GoGovReduxState) => state.user.message)
  const isLoggedIn = useSelector(
    (state: GoGovReduxState) => state.login.isLoggedIn,
  )
  const emailValidator = useSelector(
    (state: GoGovReduxState) => state.login.emailValidator,
  )
  const dispatch = useDispatch()
  const getUrlsForUser = () => dispatch(userActions.getUrlsForUser())
  const getEmailValidator = () =>
    dispatch(loginActions.getEmailValidationGlobExpression())
  const getUserMessage = () => dispatch(userActions.getUserMessage())

  const urlsFiltered = useIsFiltered()

  useEffect(() => {
    if (isLoggedIn) {
      getUrlsForUser()
      if (!emailValidator) {
        getEmailValidator()
      }
      if (message === null) {
        getUserMessage()
      }
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (isLoggedIn) {
      // Google Analytics: User page, to record sign in - act as exit for otp, devices, clicks and traffic page
      GAPageView('USER PAGE')
      GAEvent('user page', 'main')
    }
  }, [isLoggedIn])

  if (isLoggedIn) {
    return (
      <BaseLayout>
        <Drawer>
          {!fetchingUrls && urlCount === 0 && !urlsFiltered ? (
            <EmptyState urlsFiltered={urlsFiltered} />
          ) : (
            <UserLinkTable />
          )}
          <CreateUrlModal />
          <AnnouncementModal />
        </Drawer>
      </BaseLayout>
    )
  }

  return <div />
}

export default UserPage
