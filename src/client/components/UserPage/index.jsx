import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import Drawer from './Drawer'
import CreateUrlModal from './CreateUrlModal'
import userActions from '~/actions/user'
import BaseLayout from '../BaseLayout'
import UserLinkTable from './UserLinkTable'

/**
 * List URLs belonging to the user in a table.
 */

const mapStateToProps = (state) => ({
  isLoggedIn: state.login.isLoggedIn,
  createUrlModal: state.user.createUrlModal,
})

const mapDispatchToProps = (dispatch) => ({
  onCreateUrl: (history) => dispatch(userActions.createUrlOrRedirect(history)),
  closeCreateUrlModal: () => dispatch(userActions.closeCreateUrlModal()),
  getUrlsForUser: () => dispatch(userActions.getUrlsForUser()),
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
}) => {
  if (isLoggedIn) {
    useEffect(() => {
      getUrlsForUser()
    }, [])
    return (
      <BaseLayout>
        <Drawer>
          <UserLinkTable />
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
