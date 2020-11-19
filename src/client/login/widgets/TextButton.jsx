import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { Button, createStyles, makeStyles } from '@material-ui/core'

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
  }),
)

const TextButton = ({
  children,
  className,
  href,
  target,
  disabled,
  onClick,
}) => {
  const classes = useStyles()
  return (
    <Button
      className={classNames(className, classes.textButton)}
      href={href}
      target={target}
      disabled={disabled}
      onClick={onClick}
      variant="text"
      size="large"
      disableFocusRipple
      disableRipple
    >
      {children}
    </Button>
  )
}

TextButton.propTypes = {
  className: PropTypes.string,
  href: PropTypes.string,
  target: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
}

TextButton.defaultProps = {
  className: '',
  href: undefined,
  target: undefined,
  disabled: undefined,
  onClick: undefined,
}

export default TextButton
