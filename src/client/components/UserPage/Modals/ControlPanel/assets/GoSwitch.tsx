import {
  Switch,
  createStyles,
  makeStyles,
  SwitchProps,
} from '@material-ui/core'
import React from 'react'

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      width: 55,
      height: 29,
      padding: 0,
      margin: theme.spacing(1),
    },
    switchBase: {
      padding: 1,
      '&$checked': {
        transform: 'translateX(26px)',
        color: theme.palette.common.white,
        '& + $track': {
          backgroundColor: '#6d9067',
          opacity: 1,
          border: 'none',
        },
      },
      '&$focusVisible $thumb': {
        color: '#52d869',
        border: '6px solid #fff',
      },
    },
    thumb: {
      width: 27,
      height: 27,
    },
    track: {
      borderRadius: 29 / 2,
      border: '1px solid #bbbbbb',
      backgroundColor: '#f0f0f0',
      opacity: 1,
      transition: theme.transitions.create(['background-color', 'border']),
    },
    checked: {},
    focusVisible: {},
  }),
)

export default function GoSwitch({ ...props }: SwitchProps) {
  const classes = useStyles()
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  )
}
