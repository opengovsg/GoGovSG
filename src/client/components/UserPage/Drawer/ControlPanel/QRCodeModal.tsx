import React from 'react'
import {
  Modal,
  Paper,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'

import GoLogo from './assets/go-logo.png'
import QRCode from './QRCode'

const useStyles = makeStyles((theme) =>
  createStyles({
    qrCodeModal: {
      outline: 'none',
      top: 'calc(50% - 250px)',
      left: 'calc(50% - 200px)',
      position: 'fixed',
      width: '400px',
      backgroundColor: theme.palette.secondary.main,
      borderRadius: '10px',
      padding: '16px',
      [theme.breakpoints.down('xs')]: {
        width: '80vw',
        top: '10vh',
        left: 'calc(50% - 40vw)',
      },
    },
    qrCodeModalTitle: {
      color: theme.palette.common.black,
      textAlign: 'center',
      padding: '10px',
      wordBreak: 'break-all',
      fontWeight: 500,
    },
  }),
)

export type QRCodeModalProps = {
  open: boolean
  onClose: () => void
  shortLink: string
}

const QRCodeModal = (props: QRCodeModalProps) => {
  const classes = useStyles()
  return (
    <Modal
      aria-labelledby="qrCodeModal"
      aria-describedby="qrCodeImage"
      open={props.open}
      onClose={props.onClose}
    >
      <Paper className={classes.qrCodeModal}>
        <QRCode
          size={1000}
          logo={GoLogo}
          value={`https://${document.location.host}/${props.shortLink}`}
        />
        <Typography
          variant="h3"
          className={classes.qrCodeModalTitle}
          align="center"
          gutterBottom
        >
          {`${document.location.host}/${props.shortLink}`}
        </Typography>
      </Paper>
    </Modal>
  )
}

export default QRCodeModal
