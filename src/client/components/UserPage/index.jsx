import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { withRouter } from 'react-router-dom'

import Modals, { CreateUrlModal } from './Modals'
import QRCodeModal from './QRCodeModal'
import OwnershipModal from './OwnershipModal'
import userActions from '~/actions/user'
import userPageStyle from '~/styles/userPage'
import BaseLayout from '../BaseLayout'
import UserLinkTable from './UserLinkTable'

/**
 * List URLs belonging to the user in a table.
 */

const mapStateToProps = (state) => ({
  isLoggedIn: state.login.isLoggedIn,
  qrCode: state.user.qrCode,
  createUrlModal: state.user.createUrlModal,
  ownershipModal: state.user.ownershipModal,
  newOwner: state.user.newOwner,
})

const mapDispatchToProps = (dispatch) => ({
  onCreateUrl: (history) => dispatch(userActions.createUrlOrRedirect(history)),
  openCreateUrlModal: (shortUrl) =>
    dispatch(userActions.openCreateUrlModal(shortUrl)),
  closeCreateUrlModal: () => dispatch(userActions.closeCreateUrlModal()),
  onCancelEditUrl: () => dispatch(userActions.cancelEditLongUrl()),
  openQrCode: (shortUrl) => dispatch(userActions.openQrCode(shortUrl)),
  closeQrCode: () => dispatch(userActions.closeQrCode()),
  openOwnershipModal: (shortUrl) =>
    dispatch(userActions.openOwnershipModal(shortUrl)),
  closeOwnershipModal: () => dispatch(userActions.closeOwnershipModal()),
  setNewOwner: (newOwner) => dispatch(userActions.setNewOwner(newOwner)),
  transferOwnership: (shortUrl, newOwner) => {
    dispatch(userActions.transferOwnership(shortUrl, newOwner))
  },
  getUrlsForUser: () => dispatch(userActions.getUrlsForUser()),
})

/**
 * Show the user page.
 */
const UserPage = ({
  classes,
  isLoggedIn,
  onCreateUrl,
  createUrlModal,
  closeCreateUrlModal,
  history,
  openQrCode,
  closeQrCode,
  closeOwnershipModal,
  qrCode,
  ownershipModal,
  newOwner,
  setNewOwner,
  transferOwnership,
  getUrlsForUser,
}) => {
  if (isLoggedIn) {
    useEffect(() => {
      getUrlsForUser()
    }, [])
    return (
      <BaseLayout>
        <Modals>
          <UserLinkTable />
          <CreateUrlModal
            createUrlModal={createUrlModal}
            closeCreateUrlModal={closeCreateUrlModal}
            onSubmit={() => onCreateUrl(history)}
          />
          {/* QR code modal */}
          <QRCodeModal
            id="qrCodeModal"
            classes={classes}
            qrCode={qrCode}
            openQrCode={openQrCode}
            closeQrCode={closeQrCode}
          />
          <OwnershipModal
            id="ownershipModal"
            classes={classes}
            ownershipModal={ownershipModal}
            closeOwnershipModal={closeOwnershipModal}
            newOwner={newOwner}
            setNewOwner={setNewOwner}
            transferOwnership={transferOwnership}
          />
        </Modals>
      </BaseLayout>
    )
  }

  return <div />
}

UserPage.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  history: PropTypes.shape({}).isRequired,
  // User states
  isLoggedIn: PropTypes.bool.isRequired,
  createUrlModal: PropTypes.bool.isRequired,
  qrCode: PropTypes.string.isRequired,
  ownershipModal: PropTypes.string.isRequired,
  newOwner: PropTypes.string.isRequired,
  // User actions
  closeCreateUrlModal: PropTypes.func.isRequired,
  onCreateUrl: PropTypes.func.isRequired,
  openQrCode: PropTypes.func.isRequired,
  closeQrCode: PropTypes.func.isRequired,
  closeOwnershipModal: PropTypes.func.isRequired,
  setNewOwner: PropTypes.func.isRequired,
  transferOwnership: PropTypes.func.isRequired,
  getUrlsForUser: PropTypes.func.isRequired,
}

export default withRouter(
  withStyles(userPageStyle)(
    connect(mapStateToProps, mapDispatchToProps)(UserPage),
  ),
)
