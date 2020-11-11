import React, { useState } from 'react'
import {
  createStyles,
  makeStyles,
  Menu,
  MenuItem,
  Typography,
} from '@material-ui/core'
import FileSaver from 'file-saver'

import TrailingButton from './TrailingButton'
import downloadIcon from '../assets/download-icon.svg'
import { useDrawerState } from '../..'
import ImageFormat from '../../../../../shared/util/image-format'
import { get } from '../../../../app/util/requests'
import { GAEvent } from '../../../../app/util/ga'
import * as Sentry from '@sentry/browser'

// Gets file extension from content-type.
function getFileExtension(format: ImageFormat) {
  switch (format) {
    case ImageFormat.SVG:
      return 'svg'
    case ImageFormat.PNG:
      return 'png'
    case ImageFormat.JPEG:
      return 'jpeg'
    default:
      throw Error('Invalid format passed to getFileExtension')
  }
}

// Downloads QR code from server.
async function downloadServerQrCode(
  shortLink: string,
  format: ImageFormat,
): Promise<void> {
  const url = `https://${document.location.host}/${shortLink}`
  const endpoint = `/api/qrcode?url=${encodeURIComponent(
    shortLink,
  )}&format=${encodeURIComponent(format)}`
  const response: Response = await get(endpoint)
  if (response.ok) {
    // Google Analytics: QR Code generation - actions are stringed by shortlink and format
    GAEvent('qr code generation', format.toString(), 'succesful')
    // Use filename from response for filename, fallbacks to endpoint.
    const fileName = response.headers.get('Filename') ?? url
    const bodyBlob = await response.blob()
    const blob = new Blob([bodyBlob], {
      type: response.headers.get('content-type') || format,
    })
    FileSaver.saveAs(blob, `${fileName}.${getFileExtension(format)}`)
  } else {
    // Sentry analytics: qr code download fail
    Sentry.captureMessage(`generate qr code for ${format} unsuccessful`)
    GAEvent('qr code generation', format.toString(), 'unsuccesful')
  }
}

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

type Option = {
  name: string
  onClick: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void
}

export default function DownloadButton() {
  const classes = useStyles()
  const modalState = useDrawerState()
  const shortLink = modalState.relevantShortLink!
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const options: Option[] = [
    {
      name: 'PNG',
      onClick: () => {
        downloadServerQrCode(shortLink, ImageFormat.PNG)
        handleClose()
      },
    },
    {
      name: 'SVG',
      onClick: () => {
        downloadServerQrCode(shortLink, ImageFormat.SVG)
        handleClose()
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
    </>
  )
}
