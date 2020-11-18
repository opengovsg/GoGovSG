import React, { FunctionComponent } from 'react'
import { Button, createStyles, makeStyles } from '@material-ui/core'

type OvalContainedButtonProps = {
  href?: string,
  onClick?: () => {}
}

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

const OvalContainedButton: FunctionComponent<OvalContainedButtonProps> = ({
  children,
  href,
  onClick }) => {
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

OvalContainedButton.defaultProps = {
  href: undefined,
  onClick: undefined,
}

export default OvalContainedButton