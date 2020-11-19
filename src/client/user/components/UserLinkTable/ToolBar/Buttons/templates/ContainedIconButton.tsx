import React, { FunctionComponent } from 'react'
import { IconButton, createStyles, makeStyles } from '@material-ui/core'

type ContainedIconButtonProps = {
  href?: string,
  onClick?: () => {},
}

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

const ContainedIconButton: FunctionComponent<ContainedIconButtonProps> = ({
   children,
   href,
   onClick, }) => {
  const classes = useStyles()
  return (
    <a href={href} onClick={onClick}>
      <IconButton
        className={classes.roundIconButton}
      >
        {children}
      </IconButton>
    </a>
  )
}

ContainedIconButton.defaultProps = {
  href: undefined,
  onClick: undefined,
}

export default ContainedIconButton
