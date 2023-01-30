import React, { FunctionComponent, PropsWithChildren } from 'react'

import {
  Box,
  Button,
  TextField,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import { VariantType, loginFormVariants } from '../../app/util/types'

type LoginFormProps = {
  id: string
  placeholder: string
  buttonMessage: string
  govLoginButtonMessage?: string
  variant: VariantType
  autoComplete: string
  onChange: (email: string) => void
  textError: () => boolean
  textErrorMessage: () => string
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onGovLogin?: () => void
  value: string
}

const useStyles = makeStyles((theme) =>
  createStyles({
    loginField: {
      borderRadius: '3px',
    },
    loginInputText: {
      color: theme.palette.grey[800],
    },
    buttonRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1),
    },
    buttonGroup: {
      display: 'flex',
      gap: '0.5rem',
    },
    signInButton: {
      width: '140px',
      minWidth: '120px',
      marginRight: theme.spacing(2),
    },
  }),
)

// Form object to request for user's email or OTP
const LoginForm: FunctionComponent<LoginFormProps> = ({
  id,
  placeholder,
  buttonMessage,
  govLoginButtonMessage,
  onGovLogin,
  variant,
  autoComplete,
  onChange,
  textError,
  textErrorMessage,
  onSubmit,
  children,
  value,
}: PropsWithChildren<LoginFormProps>) => {
  const classes = useStyles()
  const variantMap = loginFormVariants.map[variant]
  return (
    <form onSubmit={onSubmit} autoComplete={autoComplete}>
      <TextField
        autoFocus
        required
        fullWidth
        variant="outlined"
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
        value={value}
      />
      <section className={classes.buttonRow}>
        <Box className={classes.buttonGroup}>
          <Button
            className={classes.signInButton}
            type="submit"
            variant="contained"
            color="primary"
            disabled={!variantMap.submitEnabled || !!textError()}
            size="large"
          >
            {buttonMessage}
          </Button>
          {govLoginButtonMessage && (
            <Button
              className={classes.signInButton}
              type="button"
              variant="contained"
              color="secondary"
              disabled={!variantMap.submitEnabled || !!textError()}
              size="large"
              onClick={onGovLogin}
            >
              {govLoginButtonMessage}
            </Button>
          )}
        </Box>
        {children}
      </section>
    </form>
  )
}

export default LoginForm
