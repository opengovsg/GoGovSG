import * as React from 'react'
import {
  Button,
  ButtonBaseProps,
  createStyles,
  makeStyles,
} from '@material-ui/core'

const useStyles = makeStyles(() =>
  createStyles({
    trailingButton: {
      width: 135,
      height: 44,
      padding: 0,
      fontSize: '0.875rem',
    },
  }),
)

export default function TrailingButton(props: ButtonBaseProps) {
  const classes = useStyles()
  return (
    <Button
      {...props}
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
