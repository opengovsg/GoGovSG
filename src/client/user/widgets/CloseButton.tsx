import React from 'react'
import IconButton from '@material-ui/core/IconButton'
import { createStyles, makeStyles } from '@material-ui/core'
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
    <IconButton onClick={onClick} className={classes.closeButton}>
      <CloseIcon size={24} />
    </IconButton>
  )
}
