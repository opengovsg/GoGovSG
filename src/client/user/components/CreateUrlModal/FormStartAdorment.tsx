import React, { FunctionComponent } from 'react'
import useCreateLinkFormStyles from './styles/createLinkForm'
import {
  InputAdornment,
  Typography,
} from '@material-ui/core'

// Height of the text field in the create link dialog.
export const TEXT_FIELD_HEIGHT = 44

const FormStartAdorment: FunctionComponent = ({ children }) => {
  const classes = useCreateLinkFormStyles({
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