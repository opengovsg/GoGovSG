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
import ImageFormat from '../../../../../../shared/util/imageFormat'
import { postJson } from '../../../../../util/requests'

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
  if (typeof window === 'undefined') {
    throw Error('This code should only run in a browser environment')
  }
  const url = `https://${document.location.host}/${shortLink}`
  const response: Response = await postJson('/api/qrcode', {
    url: shortLink,
    format,
  })
  if (response.ok) {
    const bodyBlob = await response.blob()
    const blob = new Blob([bodyBlob], {
      type: response.headers.get('content-type') || format,
    })
    FileSaver.saveAs(blob, `${url}.${getFileExtension(format)}`)
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
