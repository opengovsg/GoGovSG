import React, { FunctionComponent, PropsWithChildren } from 'react'
import { IconButton } from '@mui/material'

import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

type ContainedIconButtonProps = {
  href?: string
  onClick?: () => void
}

const useStyles = makeStyles((theme) =>
  createStyles({
    roundIconButton: {
      width: 'auto',
      backgroundColor: theme.palette.primary.main,
      fill: theme.palette.background.default,
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
  href = undefined,
  onClick = undefined,
}: PropsWithChildren<ContainedIconButtonProps>) => {
  const classes = useStyles()
  return (
    <a href={href} onClick={onClick}>
      <IconButton className={classes.roundIconButton} size="large">
        {children}
      </IconButton>
    </a>
  )
}

export default ContainedIconButton
