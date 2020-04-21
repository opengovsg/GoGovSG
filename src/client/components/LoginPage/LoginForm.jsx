import React from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  FormControl,
  TextField,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import { loginFormVariants } from '~/util/types'

const useStyles = makeStyles((theme) =>
  createStyles({
    loginField: {
      borderRadius: '3px',
    },
    loginInputText: {
      color: theme.palette.grey[800],
    },
  }),
)

// Form object to request for user's email or OTP
const LoginForm = ({
  id,
  placeholder,
  submit,
  onChange,
  titleMessage,
  buttonMessage,
  textError,
  textErrorMessage,
  hidden,
  variant,
  autoComplete,
}) => {
  const classes = useStyles()
  const variantMap = loginFormVariants.map[variant]
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      hidden={hidden}
      autoComplete={autoComplete}
    >
      <TextField
        autoFocus
        required
        fullWidth
        variant="outlined"
        label={titleMessage}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        InputProps={{
          classes: {
            input: classes.loginInputText,
          },
        }}
        className={classes.loginField}
        margin="normal"
        id={id}
        name={id}
        disabled={!variantMap.inputEnabled}
        error={textError()}
        helperText={textErrorMessage()}
      />
      <FormControl margin="normal" fullWidth>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!variantMap.submitEnabled}
          size="large"
        >
          {buttonMessage}
        </Button>
      </FormControl>
    </form>
  )
}

LoginForm.propTypes = {
  id: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  submit: PropTypes.func.isRequired,
  titleMessage: PropTypes.string.isRequired,
  buttonMessage: PropTypes.string.isRequired,
  textError: PropTypes.func.isRequired,
  textErrorMessage: PropTypes.func.isRequired,
  hidden: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(Object.values(loginFormVariants.types)).isRequired,
  autoComplete: PropTypes.string.isRequired,
}

export default LoginForm
