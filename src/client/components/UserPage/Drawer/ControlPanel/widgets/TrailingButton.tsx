import * as React from 'react'
import {
  Button,
  ButtonProps,
  createStyles,
  makeStyles,
} from '@material-ui/core'

const useStyles = makeStyles((theme) =>
  createStyles({
    trailingButton: {
      width: 135,
      height: 44,
      padding: 0,
      fontSize: '0.875rem',
      [theme.breakpoints.down('sm')]: {
        marginTop: theme.spacing(0.5),
        width: (props: ButtonProps) => (props.fullWidth ? '100%' : 135),
      },
    },
  }),
)

export default function TrailingButton(props: ButtonProps) {
  const classes = useStyles(props)
  return (
    <Button
      {...props}
      className={classes.trailingButton}
      color="primary"
      size="large"
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  )
}
