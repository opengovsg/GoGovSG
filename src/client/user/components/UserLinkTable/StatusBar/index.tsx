import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Typography, createStyles, makeStyles } from '@material-ui/core'
import { Alert, AlertTitle } from '@material-ui/lab'
import StatusBarCompletedIcon from '../../../widgets/StatusBarCompletedIcon'
import StatusBarFailedIcon from '../../../widgets/StatusBarFailedIcon'
import StatusBarInProgressIcon from '../../../widgets/StatusBarInProgressIcon'
import userActions from '../../../actions'
import useAppMargins from '../../../../app/components/AppMargins/appMargins'
import { StatusBarVariant } from '../../../reducers/types'
import { GoGovReduxState } from '../../../../app/reducers/types'
import CloseButton from '../../../widgets/CloseButton'

type StyleProps = {
  appMargins: number
}

const useStyles = makeStyles((theme) =>
  createStyles({
    error: {
      backgroundColor: '#FFEDED',
      color: theme.palette.text.primary,
    },
    info: {
      backgroundColor: '#FDF3E8',
      color: theme.palette.text.primary,
    },
    success: {
      backgroundColor: '#EAF9E7',
      color: theme.palette.text.primary,
    },
    content: {
      alignItems: 'stretch',
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      [theme.breakpoints.up('md')]: {
        paddingRight: (props: StyleProps) => props.appMargins,
        paddingLeft: (props: StyleProps) => props.appMargins,
      },
      [theme.breakpoints.down('sm')]: {},
    },
    message: {},
    messageBody: {
      color: '#767676',
    },
    closeButton: {
      marginRight: theme.spacing(2.5),
    },
    iconWrapper: {
      width: '16px',
      height: '16px',
    },
  }),
)

const StatusBar = () => {
  const appMargins = useAppMargins()
  const classes = useStyles({ appMargins })

  const header = useSelector(
    (state: GoGovReduxState) => state.user.statusBarMessage.header,
  )
  const body = useSelector(
    (state: GoGovReduxState) => state.user.statusBarMessage.body,
  )
  const variant = useSelector(
    (state: GoGovReduxState) => state.user.statusBarMessage.variant,
  )

  const hasStatusBarAlert = !!(header || body)
  const dispatch = useDispatch()

  let colorClass = ''
  let icon: JSX.Element = <></>
  switch (variant) {
    case StatusBarVariant.Error:
      colorClass = classes.error
      icon = <StatusBarFailedIcon />
      break
    case StatusBarVariant.Info:
      colorClass = classes.info
      icon = <StatusBarInProgressIcon />
      break
    case StatusBarVariant.Success:
      colorClass = classes.success
      icon = <StatusBarCompletedIcon />
      break
    default:
      break
  }

  const dispatchCloseStatusBar = () => {
    dispatch(userActions.closeStatusBar())
  }

  return (
    <>
      {hasStatusBarAlert && (
        <Alert
          icon={icon}
          className={`${colorClass} ${classes.content}`}
          action={<CloseButton onClick={dispatchCloseStatusBar} />}
        >
          <AlertTitle>{header}</AlertTitle>
          <Typography variant="caption" className={classes.messageBody}>
            {body}
          </Typography>
        </Alert>
      )}
    </>
  )
}

export default StatusBar
