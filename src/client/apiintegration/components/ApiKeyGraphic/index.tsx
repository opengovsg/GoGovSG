import React, { FunctionComponent } from 'react'
import {
  Typography,
  createStyles,
  makeStyles,
  useMediaQuery,
  useTheme,
} from '@material-ui/core'
import retryIcon from '@assets/components/app/base-layout/retry-icon.svg'
import { useDispatch } from 'react-redux'
import PrefixableTextField from '../../../user/widgets/PrefixableTextField'
import TrailingButton from '../../../user/components/Drawer/ControlPanel/widgets/TrailingButton'
import ConfigOption, {
  TrailingPosition,
} from '../../../user/widgets/ConfigOption'
import apiActions from '../../actions'
import Tooltip from '../../../user/widgets/Tooltip'

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: theme.spacing(3),
      alignItems: 'left',
      [theme.breakpoints.up('md')]: {
        marginTop: theme.spacing(6),
      },
    },
    configOptionWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'left',
      maxWidth: '775px',
    },
    apiKeyInfoText: {
      textAlign: 'left',
      marginBottom: theme.spacing(1),
    },
    createApiKeyButton: {
      marginTop: '41px',
      width: '168px',
      minWidth: '90px',
      color: 'white',
      background: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    retryIcon: {
      width: '17px',
    },
  }),
)

/**
 * @component Default display component in place of generated api key.
 */
const ApiKeyGraphic: FunctionComponent = () => {
  const classes = useStyles()
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('sm'))
  const dispatch = useDispatch()
  return (
    <div className={classes.root}>
      <Typography variant="body1" className={classes.apiKeyInfoText}>
        After generating your API key, please make a copy of it immediately as
        it will only be shown once. Upon leaving or refreshing this page, the
        key will be hidden.
      </Typography>
      <div className={classes.configOptionWrapper}>
        <ConfigOption
          title={
            <>
              Your API Key{' '}
              <Tooltip
                title="API Key can be used to programmatically create, update short links."
                imageAltText="API Key help"
              />
            </>
          }
          leading={
            <PrefixableTextField
              value="******************"
              onChange={() => {}}
              placeholder="Email of link recipient"
              helperText={' '}
              disabled
            />
          }
          trailing={
            <TrailingButton
              onClick={() => {
                dispatch(apiActions.generateApiKey())
              }}
              variant="contained"
              fullWidth={isMobileView}
            >
              Regenerate &nbsp;
              <img
                className={classes.retryIcon}
                src={retryIcon}
                alt="Regenerate"
              />
            </TrailingButton>
          }
          wrapTrailing={isMobileView}
          trailingPosition={TrailingPosition.end}
        />
      </div>
    </div>
  )
}

export default ApiKeyGraphic
