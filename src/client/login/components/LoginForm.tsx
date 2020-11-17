import React, { FunctionComponent } from 'react'
import classNames from 'classnames'
import { useDispatch } from 'react-redux'
import i18next from 'i18next'
import { Button, TextField, createStyles, makeStyles } from '@material-ui/core'
import { loginFormVariants, variantsValueTypes } from '../../app/util/types'
import loginActions from '../actions'
import TextButton from '../widgets/TextButton'
import { GAEvent, GAPageView } from '../../app/util/ga'

type LoginFormProps = {
  id: string,
  placeholder: string,
  buttonMessage: string,
  hidden: boolean,
  variant: variantsValueTypes,
  autoComplete: string,
  isEmailView?: boolean,
  onChange: (email: string) => {},
  textError: () => boolean,
  textErrorMessage: () => string,
  submit: () => {},
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
    signInButton: {
      width: '140px',
      minWidth: '120px',
      marginRight: theme.spacing(2),
    },
    secondaryButton: {
      fontWeight: 400,
      marginLeft: theme.spacing(2),
    },
    resendOTPBtn: {
      marginRight: 'auto',
      '&:disabled': {
        opacity: 0.5,
      },
    },
  }),
)

// Form object to request for user's email or OTP
const LoginForm : FunctionComponent<LoginFormProps> = ({
  id,
  placeholder,
  buttonMessage,
  hidden,
  variant,
  autoComplete,
  isEmailView,
  onChange,
  textError,
  textErrorMessage,
  submit,
}) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const getOTPEmail = () => dispatch(loginActions.getOTPEmail())
  const variantMap = loginFormVariants.map[variant]
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
        // Google Analytics: OTP page, Transition from email > OTP page
        if (isEmailView) {
          GAPageView('OTP LOGIN PAGE')
          GAEvent('login page', 'otp', 'successful')
        }
      }}
      hidden={hidden}
      autoComplete={autoComplete}
    >
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
      />
      <section className={classes.buttonRow}>
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
        {!isEmailView ? (
          <TextButton
            className={classNames(
              classes.secondaryButton,
              classes.resendOTPBtn,
            )}
            disabled={!variantMap.resendEnabled}
            onClick={getOTPEmail}
          >
            Resend OTP
          </TextButton>
        ) : (
          <TextButton
            className={classes.secondaryButton}
            href={i18next.t('general.links.faq')}
          >
            Need help?
          </TextButton>
        )}
      </section>
    </form>
  )
}

// By default the login page should first request for email
LoginForm.defaultProps = {
  isEmailView: true,
}

export default LoginForm
