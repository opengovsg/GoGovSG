import React from 'react'
import PropTypes from 'prop-types'
import { IconButton, createStyles, makeStyles } from '@material-ui/core'

const useState = makeStyles((theme) =>
  createStyles({
    roundIconButton: {
      height: '100%',
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

const RoundIconButton = ({ children, href, onClick }) => {
  const classes = useState()
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

RoundIconButton.propTypes = {
  href: PropTypes.string,
  onClick: PropTypes.func,
}

RoundIconButton.defaultProps = {
  href: undefined,
  onClick: undefined,
}

export default RoundIconButton
