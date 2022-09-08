import React from 'react'
import {
  InputAdornment,
  TextField,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import { TEXT_FIELD_HEIGHT } from '../constants'

const usePrefixAdornmentStyles = makeStyles(() =>
  createStyles({
    startAdornment: {
      minHeight: TEXT_FIELD_HEIGHT,
      backgroundColor: '#f0f0f0',
      borderRight: 'solid 1px #d8d8d8',
      marginRight: 0,
    },
    startAdornmentText: {
      paddingLeft: 15,
      paddingRight: 26,
    },
  }),
)

type PrefixAdornmentProps = {
  children: React.ReactNode
}

const PrefixAdornment = ({ children }: PrefixAdornmentProps) => {
  const classes = usePrefixAdornmentStyles()
  return (
    <InputAdornment className={classes.startAdornment} position="start">
      <Typography className={classes.startAdornmentText} color="textSecondary">
        {children}
      </Typography>
    </InputAdornment>
  )
}

type TextFieldStylesProps = {
  textFieldHeight: number
  multiline?: boolean
}

const useTextFieldStyles = makeStyles((theme) =>
  createStyles({
    textField: {
      width: '100%',
      marginTop: theme.spacing(1),
      marginBottom: 0,
      [theme.breakpoints.up('md')]: {
        // marginBottom: (props: TextFieldStylesProps) =>
        //   props.multiline ? 0 : -19,
      },
    },
    removePrefixPadding: { padding: theme.spacing(0) },
    textInput: {
      flexGrow: 1,
      height: '100%',
      minHeight: (props: TextFieldStylesProps) => props.textFieldHeight,
      padding: theme.spacing(0),
      lineHeight: 1.5,
      marginLeft: 14,
      marginRight: 0,
      marginTop: (props: TextFieldStylesProps) => (props.multiline ? 8 : 0),
      marginBottom: (props: TextFieldStylesProps) => (props.multiline ? 8 : 0),
      [theme.breakpoints.up('md')]: {
        marginRight: 14,
      },
    },
    helperText: {
      position: 'absolute',
      top: '100%',
      left: 0,
      width: 'auto',
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
  multiline?: boolean
  rows?: number
  rowsMax?: number
  FormHelperTextProps?: object
}

export default function PrefixableTextField({
  value,
  onChange,
  placeholder,
  prefix,
  error = false,
  helperText = '',
  multiline,
  rows,
  rowsMax,
  FormHelperTextProps,
}: TextFieldProps) {
  const classes = useTextFieldStyles({
    textFieldHeight: TEXT_FIELD_HEIGHT,
    multiline,
  })

  return (
    <TextField
      className={classes.textField}
      error={error}
      InputProps={{
        className: classes.removePrefixPadding,
        classes: {
          input: classes.textInput,
        },
        startAdornment: prefix && <PrefixAdornment>{prefix}</PrefixAdornment>,
      }}
      required
      variant="outlined"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      helperText={helperText}
      multiline={multiline}
      rows={rows}
      rowsMax={rowsMax}
      FormHelperTextProps={
        FormHelperTextProps || { className: classes.helperText }
      }
    />
  )
}
