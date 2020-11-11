import React from 'react'
import PropTypes from 'prop-types'
import { IconButton, createStyles, makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) =>
  createStyles({
    roundIconButton: {
      width: 'auto',
      backgroundColor: theme.palette.primary.main,
      fill: theme.palette.secondary.dark,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: theme.palette.primary.main,
        },
      },
    },
  }),
)

const ContainedIconButton = ({ children, href, onClick }) => {
  const classes = useStyles()
  return (
    <IconButton
      className={classes.roundIconButton}
      href={href}
      onClick={onClick}
    >
      {children}
    </IconButton>
  )
}

ContainedIconButton.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string,
  onClick: PropTypes.func,
}

ContainedIconButton.defaultProps = {
  href: undefined,
  onClick: undefined,
}

export default ContainedIconButton
