import React, { FunctionComponent, PropsWithChildren } from 'react'
import { Button } from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

type TextButtonProps = {
  className?: string
  href?: string
  disabled?: boolean
  onClick?: () => {}
}

const useStyles = makeStyles((theme) =>
  createStyles({
    textButton: {
      paddingLeft: theme.spacing(0),
      paddingRight: theme.spacing(0),
      color: theme.palette.text.secondary,
      backgroundColor: 'transparent',
      transition: 'all .2s ease-in-out',
      '&:hover': {
        color: theme.palette.primary.dark,
        backgroundColor: 'transparent',
      },
    },
    tag: {
      display: 'contents',
    },
  }),
)

const TextButton: FunctionComponent<PropsWithChildren<TextButtonProps>> = ({
  children,
  className,
  href,
  disabled,
  onClick,
}: PropsWithChildren<TextButtonProps>) => {
  const classes = useStyles()
  return (
    <a
      className={classes.tag}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Button
        className={`${className} ${classes.textButton}`}
        disabled={disabled}
        onClick={onClick}
        variant="text"
        size="large"
        disableFocusRipple
        disableRipple
      >
        {children}
      </Button>
    </a>
  )
}

TextButton.defaultProps = {
  className: '',
  href: undefined,
  disabled: undefined,
  onClick: undefined,
}

export default TextButton
