import React from 'react'
import {
  TextField,
  createStyles,
  makeStyles,
  InputAdornment,
  Typography,
} from '@material-ui/core'

// Height of the text field in the create link dialog.
const TEXT_FIELD_HEIGHT = 44

type PrefixAdormentStylesProps = {
  textFieldHeight: number
}

const usePrefixAdornmentStyles = makeStyles(() =>
  createStyles({
    startAdorment: {
      minHeight: (props: PrefixAdormentStylesProps) => props.textFieldHeight,
      backgroundColor: '#f0f0f0',
      borderRight: 'solid 1px #d8d8d8',
      marginRight: 0,
    },
    startAdormentText: {
      paddingLeft: 15,
      paddingRight: 26,
    },
  }),
)

type PrefixAdornmentProps = {
  children: React.ReactNode
}

const PrefixAdornment = ({ children }: PrefixAdornmentProps) => {
  const classes = usePrefixAdornmentStyles({
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

type TextFieldStylesProps = {
  textFieldHeight: number
}

const useTextFieldStyles = makeStyles((theme) =>
  createStyles({
    textField: {
      width: '100%',
      maxWidth: 633,
      marginTop: 12,
      marginBottom: -24,
    },
    removePrefixPadding: { padding: theme.spacing(0) },
    textInput: {
      flexGrow: 1,
      height: '100%',
      minHeight: (props: TextFieldStylesProps) => props.textFieldHeight,
      padding: theme.spacing(0),
      lineHeight: 1.5,
      marginLeft: 14,
      marginRight: 14,
    },
  }),
)

type TextFieldProps = {
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  prefix?: string
  error?: boolean
  helperText?: string
}

export default function DrawerTextField(props: TextFieldProps) {
  const classes = useTextFieldStyles({ textFieldHeight: TEXT_FIELD_HEIGHT })

  return (
    <TextField
      className={classes.textField}
      error={props.error || false}
      InputProps={{
        className: classes.removePrefixPadding,
        classes: {
          input: classes.textInput,
        },
        startAdornment: props.prefix && (
          <PrefixAdornment>{props.prefix}</PrefixAdornment>
        ),
      }}
      required
      variant="outlined"
      value={props.value}
      onChange={props.onChange}
      placeholder={props.placeholder}
      helperText={props.helperText || ''}
    />
  )
}
