import React, { useState } from 'react'
import {
  createStyles,
  makeStyles,
  Divider,
  Menu,
  MenuItem,
} from '@material-ui/core'

import TrailingButton from './TrailingButton'
import downloadIcon from './assets/download-icon.svg'

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

type Option = {
  name: string
  onClick: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void
}

export default function DownloadButton() {
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const options: Option[] = [
    {
      name: 'Download PNG',
      onClick: () => {
        handleClose()
      },
    },
    {
      name: 'Download SVG',
      onClick: () => {
        handleClose()
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
    </>
  )
}
