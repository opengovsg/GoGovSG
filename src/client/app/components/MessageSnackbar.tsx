import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Snackbar,
  SnackbarContent,
  useMediaQuery,
  useTheme,
  createStyles,
  makeStyles,
} from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import CheckCircleIcon from './widgets/CheckCircleIcon'
import CloseIcon from './widgets/CloseIcon'
import rootActions from './pages/RootPage/actions'
import { snackbarVariants } from '../util/types'
import { GoGovReduxState } from '../../app/reducers/types'

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      alignItems: 'stretch',
    },
    error: {
      backgroundColor: '#FFEDED',
      color: '#384A51',
    },
    info: {
      backgroundColor: theme.palette.primary.dark,
    },
    success: {
      backgroundColor: '#EAF9E7',
      color: '#384A51',
    },
    before: {
      '&::before': {
        backgroundColor: '#384A51',
        width: '4px',
        content: '""',
        marginRight: theme.spacing(2.25),
      },
    },
    content: {
      padding: 0,
      borderRadius: '3px',
      boxShadow: '0px 0px 7px rgba(56, 74, 81, 0.15)',
      fontSize: '0.875rem',
      fontWeight: 400,
      width: 'calc(100vw - 20px)',
      display: 'flex',
      alignItems: 'stretch',
      flexWrap: 'nowrap',
      minHeight: '56px',
      [theme.breakpoints.up('sm')]: {
        width: '600px',
      },
    },
    closeButton: {
      marginRight: theme.spacing(2.5),
    },
    message: {
      display: 'flex',
      alignItems: 'center',
    },
    iconWrapper: {
      width: '16px',
      height: '16px',
    },
    checkCircleIcon: {
      marginRight: theme.spacing(1),
    },
  }),
)

const MessageSnackbar = () => {
  const theme = useTheme()
  const classes = useStyles()
  const message = useSelector((state: GoGovReduxState) => state.root.snackbarMessage.message)
  const variant = useSelector((state: GoGovReduxState) => state.root.snackbarMessage.variant)
  const dispatch = useDispatch()
  const closeSnackbar = (_: object, reason: string) => {
    if (reason !== 'clickaway') {
      dispatch(rootActions.closeSnackbar())
    }
  }

  const isMobileView = useMediaQuery(theme.breakpoints.down('xs'))
  let colorClass = ''
  switch (variant) {
    case snackbarVariants.ERROR:
      colorClass = classes.error
      break
    case snackbarVariants.INFO:
      colorClass = classes.info
      break
    case snackbarVariants.SUCCESS:
      colorClass = classes.success
      break
    default:
      break
  }

  return (
    <Snackbar
      open={!!message}
      autoHideDuration={5000}
      className={classes.root}
      onClose={closeSnackbar}
      anchorOrigin={{
        horizontal: 'center',
        vertical: isMobileView ? 'bottom' : 'top',
      }}
    >
      <SnackbarContent
        message={
          <>
            {variant === snackbarVariants.SUCCESS && (
              <CheckCircleIcon className={classes.checkCircleIcon} />
            )}
            {message}
          </>
        }
        className={`${classes.content} ${colorClass} ${classes.before}`}
        classes={{ message: classes.message }}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            onClick={() => dispatch(rootActions.closeSnackbar())}
            className={classes.closeButton}
            size="small"
          >
            <div className={classes.iconWrapper}>
              <CloseIcon
                color={variant === snackbarVariants.INFO ? '#fff' : '#384A51'}
                size={16}
              />
            </div>
          </IconButton>,
        ]}
      />
    </Snackbar>
  )
}

export default MessageSnackbar
