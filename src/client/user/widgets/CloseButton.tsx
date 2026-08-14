import React from 'react'
import IconButton from '@mui/material/IconButton'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import CloseIcon from '../../app/components/widgets/CloseIcon'

const useStyles = makeStyles((theme) =>
  createStyles({
    closeButton: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
  }),
)

export type CloseButtonProps = {
  onClick: () => void
}

// TODO: refactor other components to use this CloseButton
export default function CloseButton({ onClick }: CloseButtonProps) {
  const classes = useStyles()

  return (
    <IconButton onClick={onClick} className={classes.closeButton} size="large">
      <CloseIcon size={24} />
    </IconButton>
  )
}
