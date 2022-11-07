import React, { useState } from 'react'
import {
  Menu,
  MenuItem,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import TrailingButton from '../components/Drawer/ControlPanel/widgets/TrailingButton'
import downloadIcon from '../assets/dropdown-icon.svg'

const useStyles = makeStyles(() =>
  createStyles({
    textDiv: {
      paddingLeft: 20,
    },
    icon: {
      paddingRight: 20,
    },
    menuPaper: {
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
      minWidth: 135,
      height: 48,
    },
  }),
)

export type DropdownOption = {
  name: string
  onClick: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void
}

export type DropdownButtonProps = {
  className?: string
  fullWidth?: boolean
  variant?: 'text' | 'outlined' | 'contained'
  buttonText: string
  options: DropdownOption[]
}
export function DropdownButton({
  variant,
  className,
  buttonText,
  options,
  fullWidth,
}: DropdownButtonProps) {
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <TrailingButton
        className={className}
        variant={variant || 'outlined'}
        onClick={handleClick}
        fullWidth={fullWidth}
      >
        <div className={classes.textDiv}>{buttonText}</div>
        <img
          className={classes.icon}
          src={downloadIcon}
          alt="Download"
          draggable={false}
        />
      </TrailingButton>
      <Menu
        classes={{
          paper: classes.menuPaper,
        }}
        MenuListProps={{ style: { padding: '5 0', height: '100%' } }}
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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
              onClick={(event) => {
                option.onClick(event)
                handleClose()
              }}
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
