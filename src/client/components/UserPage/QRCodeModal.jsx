import React from 'react'
import PropTypes from 'prop-types'

import { Modal, Paper, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

import userPageStyle from '~/styles/userPage'
import GoLogo from '~/assets/go-qr-logo.png'
import QRCode from '~/util/QRCode'

// Display modal for the QR Code
const QRCodeModal = ({ classes, qrCode, closeQrCode }) => (
  <Modal
    aria-labelledby="qrCodeModal"
    aria-describedby="qrCodeImage"
    open={Boolean(qrCode)}
    onClose={closeQrCode}
  >
    <Paper className={classes.qrCodeModal}>
      <QRCode
        size={1000}
        logo={GoLogo}
        value={`https://${document.location.host}/${qrCode}`}
      />
      <Typography
        variant="h4"
        className={classes.qrCodeModalTitle}
        align="center"
        gutterBottom
      >
        {`${document.location.host}/${qrCode}`}
      </Typography>
    </Paper>
  </Modal>
)

QRCodeModal.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  qrCode: PropTypes.string.isRequired,
  closeQrCode: PropTypes.func.isRequired,
}

export default withStyles(userPageStyle)(QRCodeModal)
