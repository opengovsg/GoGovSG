import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Drawer from './components/Drawer'
import CreateUrlModal from './components/CreateUrlModal'
import AnnouncementModal from './components/AnnouncementModal'
import userActions from './actions'
import BaseLayout from '../app/components/BaseLayout'
import UserLinkTable from './components/UserLinkTable'
import EmptyState from './components/EmptyState'
import useIsFiltered from './components/EmptyState/isFiltered'
import loginActions from '../login/actions'
import { GAEvent, GAPageView } from '../app/util/ga'
import { GoGovReduxState } from '../app/reducers/types'

/**
 * Show the user page.
 */
const UserPage = ({
}) => {
  const fetchingUrls = useSelector((state: GoGovReduxState) => state.user.isFetchingUrls)
  const urlCount = useSelector((state: GoGovReduxState) => state.user.urlCount)
  const message = useSelector((state: GoGovReduxState) => state.user.message)
  const isLoggedIn =  useSelector((state: GoGovReduxState) => state.login.isLoggedIn)
  const emailValidator = useSelector((state: GoGovReduxState) => state.login.emailValidator)
  const dispatch = useDispatch()
  const getUrlsForUser = () => dispatch(userActions.getUrlsForUser())
  const getEmailValidator = () => dispatch(loginActions.getEmailValidationGlobExpression())
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
