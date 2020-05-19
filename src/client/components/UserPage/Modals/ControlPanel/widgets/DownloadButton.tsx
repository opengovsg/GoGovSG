import React, { useState } from 'react'
import {
  createStyles,
  makeStyles,
  Divider,
  Menu,
  MenuItem,
} from '@material-ui/core'

import TrailingButton from './TrailingButton'
import downloadIcon from '../assets/download-icon.svg'
import { useModalState, useModalDispatch } from '../..'
import QRCodeModal from '../QRCodeModal'
import ModalActions from '../helpers/reducers'

const useStyles = makeStyles((theme) =>
  createStyles({
    textDiv: {
      width: '70%',
    },
    buttonVerticalDivider: {
      height: 42,
      marginRight: 7,
      backgroundColor: theme.palette.primary.light,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  }),
)

// Use window to ref and download our qr code.
declare global {
  interface Window {
    QrCodeComponent: any
  }
}

type Option = {
  name: string
  onClick: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void
}

const MAX_DOWNLOAD_WAIT_MS = 2000
const WAIT_INTERVAL_MS = 100

async function downloadQrCode(
  variant: 'png' | 'svg',
  before: () => void,
  after: () => void,
) {
  let count = 0
  before()
  let intervalId = setInterval(function () {
    // Wait for rendering to be ready.
    if (window.QrCodeComponent.svgContainerRef.firstChild) {
      clearInterval(intervalId)
      if (variant === 'png') {
        window.QrCodeComponent.downloadPng()
      } else {
        window.QrCodeComponent.downloadSvg()
      }
      after()
    }
    // Stop trying after max wait time is hit.
    if (count >= MAX_DOWNLOAD_WAIT_MS / WAIT_INTERVAL_MS) {
      clearInterval(intervalId)
      after()
    }
    count += 1
  }, WAIT_INTERVAL_MS)
}

export default function DownloadButton() {
  const classes = useStyles()
  const modalState = useModalState()
  const shortLink = modalState.relevantShortLink!
  const qrModalIsOpen = modalState.qrCodeModalIsOpen
  const modalDispatch = useModalDispatch()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const openQrModal = () =>
    modalDispatch({ type: ModalActions.openQrCodeModal })
  const closeQrModal = () =>
    modalDispatch({ type: ModalActions.closeQrCodeModal })

  const options: Option[] = [
    {
      name: 'Show QR code',
      onClick: () => {
        openQrModal()
        handleClose()
      },
    },
    {
      name: 'Download as PNG',
      onClick: async () => {
        await downloadQrCode('png', openQrModal, () => {
          closeQrModal()
          handleClose()
        })
      },
    },
    {
      name: 'Download as SVG',
      onClick: async () => {
        await downloadQrCode('svg', openQrModal, () => {
          closeQrModal()
          handleClose()
        })
      },
    },
  ]

  return (
    <>
      <TrailingButton onClick={handleClick}>
        <div className={classes.textDiv}>Download</div>
        <Divider
          className={classes.buttonVerticalDivider}
          orientation="vertical"
          flexItem
        />
        <img src={downloadIcon} alt="Download" draggable={false} />
      </TrailingButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {options.map((option) => {
          return (
            <MenuItem key={option.name} onClick={option.onClick}>
              {option.name}
            </MenuItem>
          )
        })}
      </Menu>
      <QRCodeModal
        shortLink={shortLink}
        open={qrModalIsOpen}
        onClose={closeQrModal}
      />
    </>
  )
}
