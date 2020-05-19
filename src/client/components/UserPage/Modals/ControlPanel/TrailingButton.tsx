import * as React from 'react'
import { Button, createStyles, makeStyles } from '@material-ui/core'

const useStyles = makeStyles(() =>
  createStyles({
    trailingButton: {
      width: 135,
      height: 44,
    },
  }),
)

type TrailingButtonProps = {
  children: React.ReactNode
  onClick:
    | ((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void)
    | undefined
}

export default function TrailingButton(props: TrailingButtonProps) {
  const classes = useStyles()
  return (
    <Button
      className={classes.trailingButton}
      variant="outlined"
      color="primary"
      size="large"
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  )
}
