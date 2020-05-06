import React from 'react'
import PropTypes from 'prop-types'
import { Button, createStyles, makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) =>
  createStyles({
    ovalContainedButton: {
      height: '100%',
      width: 150,
      '&:hover': {
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: theme.palette.primary.main,
        },
      },
    },
  }),
)

export default function OvalContainedButton({ children, href, onClick }) {
  const classes = useStyles()
  return (
    <Button
      className={classes.ovalContainedButton}
      variant="contained"
      color="primary"
      size="large"
      href={href}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

OvalContainedButton.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string,
  onClick: PropTypes.func,
}

OvalContainedButton.defaultProps = {
  href: undefined,
  onClick: undefined,
}
