import React, { useState } from 'react'
import {
  createStyles,
  makeStyles,
  Menu,
  MenuItem,
  Typography,
} from '@material-ui/core'

import TrailingButton from './TrailingButton'
import downloadIcon from '../assets/download-icon.svg'
import { useDrawerState, useDrawerDispatch } from '../..'
import QRCodeModal from '../QRCodeModal'
import DrawerActions from '../helpers/reducers'

const useStyles = makeStyles(() =>
  createStyles({
    textDiv: {
      width: '55%',
    },
    menuPaper: {
      width: 135,
      height: 120,
      marginTop: 6,
      marginBottom: 6,
      boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
    },
    menuText: {
      fontWeight: 500,
      paddingLeft: 30,
      paddingRight: 30,
    },
    menuItemRoot: {
      height: '50%',
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
  const modalState = useDrawerState()
  const shortLink = modalState.relevantShortLink!
  const qrModalIsOpen = modalState.qrCodeModalIsOpen
  const modalDispatch = useDrawerDispatch()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const openQrModal = () =>
    modalDispatch({ type: DrawerActions.openQrCodeModal })
  const closeQrModal = () =>
    modalDispatch({ type: DrawerActions.closeQrCodeModal })

  const options: Option[] = [
    {
      name: 'PNG',
      onClick: async () => {
        await downloadQrCode('png', openQrModal, () => {
          closeQrModal()
          handleClose()
        })
      },
    },
    {
      name: 'SVG',
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
      <TrailingButton onClick={handleClick} variant="outlined">
        <div className={classes.textDiv}>Download</div>
        <img src={downloadIcon} alt="Download" draggable={false} />
      </TrailingButton>
      <Menu
        classes={{
          paper: classes.menuPaper,
        }}
        MenuListProps={{ style: { padding: '5 0', height: '100%' } }}
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {options.map((option) => {
          return (
            <MenuItem
              classes={{
                root: classes.menuItemRoot,
              }}
              key={option.name}
              onClick={option.onClick}
              disableGutters
            >
              <Typography
                className={classes.menuText}
                variant="body2"
                color="primary"
              >
                {option.name}
              </Typography>
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
