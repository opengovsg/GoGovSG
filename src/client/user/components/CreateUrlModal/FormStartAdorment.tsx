import React, { FunctionComponent } from 'react'
import { createStyles, makeStyles } from '@material-ui/core'
import {
  InputAdornment,
  Typography,
} from '@material-ui/core'

// Height of the text field in the create link dialog.
export const TEXT_FIELD_HEIGHT = 44

type StyleProps = {
  textFieldHeight: number
}

const useStyles = makeStyles((theme) =>
  createStyles({
    startAdorment: {
      minHeight: (props: StyleProps) => props.textFieldHeight,
      backgroundColor: '#f0f0f0',
      paddingRight: theme.spacing(1.5),
      borderRight: `1px solid ${theme.palette.divider}`,
      flexShrink: 0,
    },
    startAdormentText: {
      width: '87px',
      paddingLeft: theme.spacing(1.5),
    },
  }
))

const FormStartAdorment: FunctionComponent = ({ children }) => {
  const classes = useStyles({
    textFieldHeight: TEXT_FIELD_HEIGHT,
  })
  return (
    <InputAdornment className={classes.startAdorment} position="start">
      <Typography className={classes.startAdormentText} color="textSecondary">
        {children}
      </Typography>
    </InputAdornment>
  )
}

export default FormStartAdorment