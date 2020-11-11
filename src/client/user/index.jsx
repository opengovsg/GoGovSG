import React, { useEffect } from 'react'
import { connect, useSelector } from 'react-redux'
import { withRouter } from 'react-router-dom'

import Drawer from './Drawer'
import CreateUrlModal from './CreateUrlModal'
import AnnouncementModal from './AnnouncementModal'
import userActions from './actions'
import BaseLayout from '../app/components/BaseLayout'
import UserLinkTable from './UserLinkTable'
import EmptyState from './EmptyState'
import useIsFiltered from './EmptyState/isFiltered'
import loginActions from '../login/actions'
import { GAEvent, GAPageView } from '../app/util/ga'

/**
 * List URLs belonging to the user in a table.
 */

const mapStateToProps = (state) => ({
  isLoggedIn: state.login.isLoggedIn,
  emailValidator: state.login.emailValidator,
})

const mapDispatchToProps = (dispatch) => ({
  getUrlsForUser: () => dispatch(userActions.getUrlsForUser()),
  getEmailValidator: () =>
    dispatch(loginActions.getEmailValidationGlobExpression()),
  getUserMessage: () => dispatch(userActions.getUserMessage()),
})

/**
 * Show the user page.
 */
const UserPage = ({
  isLoggedIn,
  getUrlsForUser,
  getEmailValidator,
  emailValidator,
  getUserMessage,
}) => {
  const fetchingUrls = useSelector((state) => state.user.isFetchingUrls)
  const urlCount = useSelector((state) => state.user.urlCount)
  const message = useSelector((state) => state.user.message)
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
  }, [
    emailValidator,
    getEmailValidator,
    getUrlsForUser,
    isLoggedIn,
    message,
    getUserMessage,
  ])

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

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(UserPage),
)
