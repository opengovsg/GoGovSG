import React from 'react'
import PropTypes from 'prop-types'
import { IconButton, createStyles, makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) =>
  createStyles({
    roundIconButton: {
      height: '100%',
      width: 'auto',
      border: `solid 1px ${theme.palette.primary.main}`,
      fill: theme.palette.primary.main,
      '&:hover': {
        border: `solid 1px ${theme.palette.primary.dark}`,
        fill: theme.palette.primary.dark,
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: theme.palette.primary.main,
        },
      },
    },
  }),
)

const OutlinedIconButton = ({ children, href, onClick }) => {
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

OutlinedIconButton.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string,
  onClick: PropTypes.func,
}

OutlinedIconButton.defaultProps = {
  href: undefined,
  onClick: undefined,
}

export default OutlinedIconButton
