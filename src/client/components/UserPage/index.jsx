import React, { useEffect } from 'react'
import { connect, useSelector } from 'react-redux'
import { withRouter } from 'react-router-dom'

import Drawer from './Drawer'
import CreateUrlModal from './CreateUrlModal'
import userActions from '~/actions/user'
import BaseLayout from '../BaseLayout'
import UserLinkTable from './UserLinkTable'
import EmptyState from './EmptyState'
import useIsFiltered from './EmptyState/isFiltered'
import loginActions from '~/actions/login'

/**
 * List URLs belonging to the user in a table.
 */

const mapStateToProps = (state) => ({
  isLoggedIn: state.login.isLoggedIn,
  createUrlModal: state.user.createUrlModal,
  emailValidator: state.login.emailValidator,
})

const mapDispatchToProps = (dispatch) => ({
  onCreateUrl: (history) => dispatch(userActions.createUrlOrRedirect(history)),
  closeCreateUrlModal: () => dispatch(userActions.closeCreateUrlModal()),
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
  onCreateUrl,
  createUrlModal,
  closeCreateUrlModal,
  history,
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

  if (isLoggedIn) {
    return (
      <BaseLayout>
        <Drawer>
          {!fetchingUrls && urlCount === 0 && !urlsFiltered ? (
            <EmptyState urlsFiltered={urlsFiltered} />
          ) : (
            <UserLinkTable />
          )}
          <CreateUrlModal
            createUrlModal={createUrlModal}
            closeCreateUrlModal={closeCreateUrlModal}
            onSubmit={() => onCreateUrl(history)}
          />
        </Drawer>
      </BaseLayout>
    )
  }

  return <div />
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(UserPage),
)
